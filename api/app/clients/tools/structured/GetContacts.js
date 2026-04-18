const { Tool } = require('@langchain/core/tools');
const { getContacts, getContactsDefinition } = require('@librechat/api');

class GetContacts extends Tool {
  static lc_name() {
    return 'get_contacts';
  }

  static get jsonSchema() {
    return getContactsDefinition.schema;
  }

  constructor(fields = {}) {
    super(fields);
    this.name = getContactsDefinition.name;
    this.userId = fields.userId;
    this.description = getContactsDefinition.description;
    this.schema = getContactsDefinition.schema;
  }

  async _call(input) {
    const { query } = input;
    try {
      const result = await getContacts({
        userId: this.userId,
        search: query,
        limit: 20, // Only fetch max 20 to avoid exceeding context window
      });

      if (!result.contacts || result.contacts.length === 0) {
        return 'No contacts found matching the query in your Contacts workspace.';
      }

      // Format results into a concise string for the LLM
      const formatted = result.contacts.map(c => {
        let text = `- Name: ${c.name}`;
        if (c.company) text += `\n  Company: ${c.company}`;
        if (c.role) text += `\n  Role: ${c.role}`;
        if (c.email) text += `\n  Email: ${c.email}`;
        if (c.notes) text += `\n  Notes: ${c.notes}`;
        if (c.attributes && Object.keys(c.attributes).length > 0) {
          text += '\n  Additional Info: ' + JSON.stringify(c.attributes);
        }
        return text;
      });

      return `Found ${formatted.length} contact(s) matching "${query}":\n\n${formatted.join('\n\n')}`;
    } catch (error) {
       console.error('Error in GetContacts tool:', error);
       return 'Error retrieving contacts from the database.';
    }
  }
}

module.exports = GetContacts;
