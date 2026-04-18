import mongoose from 'mongoose';
import { contactSchema } from '@librechat/data-schemas';
import type { 
  IContact, 
  IContactLean, 
  CreateContactParams, 
  UpdateContactParams, 
  GetContactsParams 
} from '@librechat/data-schemas';

// Make sure the model is only compiled once
export const ContactModel = mongoose.models.Contact || mongoose.model<IContact>('Contact', contactSchema);

/**
 * Creates a new contact for a user
 */
export const createContact = async (params: CreateContactParams): Promise<IContactLean> => {
  const contact = new ContactModel(params);
  const saved = await contact.save();
  return saved.toObject() as IContactLean;
};

/**
 * Gets a contact by ID (must belong to the given user)
 */
export const getContactById = async (userId: string, contactId: string): Promise<IContactLean | null> => {
  return ContactModel.findOne({ _id: contactId, userId }).lean() as unknown as Promise<IContactLean | null>;
};

/**
 * Updates a contact
 */
export const updateContact = async (params: UpdateContactParams): Promise<IContactLean | null> => {
  const { userId, contactId, ...updateData } = params;
  return ContactModel.findOneAndUpdate(
    { _id: contactId, userId },
    { $set: updateData },
    { new: true }
  ).lean() as unknown as Promise<IContactLean | null>;
};

/**
 * Deletes a contact
 */
export const deleteContact = async (userId: string, contactId: string): Promise<boolean> => {
  const result = await ContactModel.deleteOne({ _id: contactId, userId });
  return result.deletedCount === 1;
};

/**
 * Lists and searches contacts for a user with cursor pagination
 */
export const getContacts = async (params: GetContactsParams): Promise<{ contacts: IContactLean[]; nextCursor: string | null; hasNextPage: boolean }> => {
  const { userId, search, page = 1, limit = 20 } = params;
  
  const query: mongoose.FilterQuery<IContact> = { userId };
  
  // Basic text search over string fields
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { company: searchRegex },
      { role: searchRegex },
      { email: searchRegex },
      { notes: searchRegex }
    ];
  }

  // Use skip/limit for simpler pagination (offset-based since list is likely small, < 10k)
  const skip = (Math.max(1, page) - 1) * limit;
  // Fetch one extra to determine if there is a next page
  const contacts = await ContactModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1)
    .lean() as unknown as IContactLean[];

  const hasNextPage = contacts.length > limit;
  const docsToReturn = hasNextPage ? contacts.slice(0, limit) : contacts;
  
  // Send the next page number as the "cursor" (client data-provider expects a cursor string)
  const nextCursor = hasNextPage ? String(page + 1) : null;

  return {
    contacts: docsToReturn,
    nextCursor,
    hasNextPage
  };
};

/**
 * Bulk imports an array of contacts
 */
export const bulkImportContacts = async (contacts: CreateContactParams[]): Promise<{ imported: number; errors: any[] }> => {
  if (!contacts || contacts.length === 0) return { imported: 0, errors: [] };
  
  const operations = contacts.map(contact => ({
    insertOne: {
      document: contact
    }
  }));

  try {
    const result = await ContactModel.bulkWrite(operations, { ordered: false });
    return { imported: result.insertedCount || 0, errors: [] };
  } catch (error: any) {
    console.error('Bulk import error:', error);
    // ordered: false means some insertions might succeed while others fail (e.g. unique constraints, though we only have non-unique compound indexes here)
    return { 
      imported: error.insertedDocs?.length || 0, 
      errors: error.writeErrors || [error.message] 
    };
  }
};
