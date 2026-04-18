import { Schema } from 'mongoose';
import type { IContact } from '~/types/contact';

/**
 * Mongoose schema for a Contact document.
 *
 * Core fields: name, company, role, email, notes — indexed for fast lookups.
 * `attributes` is a flexible Map<string, string> for arbitrary metadata
 * (e.g. industry, location, funding stage, tags) without rigid schema constraints.
 */
const ContactSchema: Schema<IContact> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
    },
    /**
     * Flexible key-value store for arbitrary attributes.
     * Stored as a MongoDB Map (BSON object).
     * Examples: { industry: 'AI Infrastructure', location: 'San Francisco' }
     */
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  },
);

// Compound index: fast lookups per user by name and company
ContactSchema.index({ userId: 1, name: 1 });
ContactSchema.index({ userId: 1, company: 1 });
ContactSchema.index({ userId: 1, email: 1 });

export default ContactSchema;
