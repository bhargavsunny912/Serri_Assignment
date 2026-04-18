import type { Types, Document } from 'mongoose';

/** A Contact document as stored in MongoDB (extends Mongoose Document for instance methods) */
export interface IContact extends Document {
  userId: Types.ObjectId;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  notes?: string;
  /** Flexible key-value metadata: industry, location, tags, funding stage, etc. */
  attributes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

/** Plain object version (returned from .lean() queries — no Mongoose methods) */
export interface IContactLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  notes?: string;
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

/** Parameters for creating a new contact */
export interface CreateContactParams {
  userId: string | Types.ObjectId;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  notes?: string;
  attributes?: Record<string, string>;
}

/** Parameters for updating an existing contact */
export interface UpdateContactParams {
  userId: string | Types.ObjectId;
  contactId: string | Types.ObjectId;
  name?: string;
  company?: string;
  role?: string;
  email?: string;
  notes?: string;
  attributes?: Record<string, string>;
}

/** Parameters for searching/listing contacts */
export interface GetContactsParams {
  userId: string | Types.ObjectId;
  search?: string;
  page?: number;
  limit?: number;
}
