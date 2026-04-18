const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('@librechat/api');

const router = express.Router();

/**
 * Note: Contacts workspace requires user to be authenticated.
 */
router.use(requireJwtAuth);

/**
 * GET /api/contacts
 * Returns a paginated list of contacts for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { search, cursor, limit } = req.query;
    
    // Convert limit to number if provided, otherwise default (e.g. 20)
    const limitNum = limit ? parseInt(limit, 10) : 20;
    // Map cursor back to page number for the API layer
    const pageNum = cursor ? parseInt(cursor, 10) : 1;

    const result = await getContacts({
      userId: req.user.id,
      search: search?.toString(),
      page: pageNum,
      limit: limitNum,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ message: 'Error getting contacts' });
  }
});

/**
 * GET /api/contacts/search
 * Returns a list of contacts matching the search query
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const result = await getContacts({
      userId: req.user.id,
      search: q.toString(),
      limit: 50,
    });
    res.json(result);
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ message: 'Error searching contacts' });
  }
});

/**
 * GET /api/contacts/:id
 * Gets a specific contact
 */
router.get('/:id', async (req, res) => {
  try {
    const contact = await getContactById(req.user.id, req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({ message: 'Error getting contact' });
  }
});

/**
 * POST /api/contacts
 * Creates a new contact
 */
router.post('/', async (req, res) => {
  try {
    const { name, company, role, email, notes, attributes } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const newContact = await createContact({
      userId: req.user.id,
      name,
      company,
      role,
      email,
      notes,
      attributes,
    });
    
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Error creating contact' });
  }
});

/**
 * PATCH /api/contacts/:id
 * Updates an existing contact
 */
router.patch('/:id', async (req, res) => {
  try {
    const updatedContact = await updateContact({
      userId: req.user.id,
      contactId: req.params.id,
      ...req.body,
    });
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Error updating contact' });
  }
});

/**
 * DELETE /api/contacts/:id
 * Deletes a contact
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteContact(req.user.id, req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact' });
  }
});

const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const { bulkImportContacts } = require('@librechat/api');

const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/contacts/import
 * Imports contacts from a CSV file
 */
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const contactsToImport = [];
    const errors = [];
    let rowCount = 0;
    
    // Parse the CSV
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        rowCount++;
        // Extract standard fields (case insensitive column names)
        const firstName = row.first_name || row.First_Name || row.firstName || '';
        const middleName = row.middle_name || row.Middle_Name || row.middleName || '';
        const lastName = row.last_name || row.Last_Name || row.lastName || '';
        
        let name = row.name || row.Name || '';
        if (!name && (firstName || lastName)) {
          name = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
        }

        if (!name) {
           errors.push(`Row ${rowCount}: Name is required`);
           return;
        }

        const company = row.company || row.Company || '';
        const role = row.role || row.Role || row.title || row.Title || '';
        const email = row.email || row.Email || '';
        const notes = row.notes || row.Notes || '';
        
        // Everything else goes to attributes
        const attributes = {};
        const standardKeys = [
          'name', 'Name', 
          'first_name', 'First_Name', 'firstName', 
          'middle_name', 'Middle_Name', 'middleName', 
          'last_name', 'Last_Name', 'lastName',
          'company', 'Company', 
          'role', 'Role', 'title', 'Title', 
          'email', 'Email', 
          'notes', 'Notes'
        ];
        
        Object.keys(row).forEach(key => {
          if (!standardKeys.includes(key) && row[key] !== undefined && row[key] !== null && row[key].toString().trim() !== '') {
            attributes[key] = row[key].toString().trim();
          }
        });

        contactsToImport.push({
          userId: req.user.id,
          name: name.trim(),
          company: company.trim(),
          role: role.trim(),
          email: email.trim(),
          notes: notes.trim(),
          attributes
        });
      })
      .on('end', async () => {
         // Clean up file
         if (fs.existsSync(req.file.path)) {
           fs.unlinkSync(req.file.path);
         }
         
         if (contactsToImport.length === 0) {
           return res.status(400).json({ message: 'No valid contacts found in CSV', errors });
         }
         
         try {
           const result = await bulkImportContacts(contactsToImport);
           res.json({
             imported: result.imported,
             errors: [...errors, ...result.errors]
           });
         } catch (bulkError) {
           console.error('Bulk insert error:', bulkError);
           res.status(500).json({ message: 'Database error importing contacts' });
         }
      })
      .on('error', (error) => {
         if (fs.existsSync(req.file.path)) {
           fs.unlinkSync(req.file.path);
         }
         console.error('CSV parse error:', error);
         res.status(500).json({ message: 'Error parsing CSV file' });
      });

  } catch (error) {
    console.error('Import route error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during import' });
  }
});

module.exports = router;
