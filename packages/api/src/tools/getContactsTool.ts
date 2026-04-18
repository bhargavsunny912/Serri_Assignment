import type { ExtendedJsonSchema } from './registry/definitions';

export const getContactsSchema: ExtendedJsonSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'The search query to look up contacts by name, company, role, email, etc. Pass an empty string to get all contacts.',
    },
  },
  required: ['query'],
};

export const getContactsDefinition = {
  name: 'get_contacts' as const,
  description: "Search and retrieve contacts from the user's contact workspace. Use this tool when the user asks about people, companies, roles, or any contact information.",
  schema: getContactsSchema,
  toolType: 'builtin' as const,
};
