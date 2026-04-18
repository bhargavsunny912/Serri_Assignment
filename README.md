# LibreChat: Contact Workspace Integration

This repository contains the implementation of a full-stack **Contact Workspace** for LibreChat. It enables seamless integration between structured contact data and the AI assistant, allowing users to query their network using natural language.

---

##  Features

### 1. Contact Management UI
- **Unified Sidebar**: A dedicated "Contacts" entry in the sidebar for easy access without leaving the chat.
- **Dynamic List**: Interactive list of contacts with real-time search and filtering.
- **Detail View**: Support for core fields (Name, Company, Role, Email) and arbitrary metadata attributes (Tags, Location, Industry, etc.).

### 2. High-Performance CSV Ingestion
- **Streaming Architecture**: Leverages Node.js streaming for CSV parsing and MongoDB bulk operations, laying the foundation for handling datasets of up to 1 million contacts.
- **Metadata Mapping**: Automatic detection and storage of non-standard CSV columns as searchable contact attributes.

### 3. AI Agent "Contact Tool"
- **Natural Language Querying**: A custom `get_contacts` tool enables Gemini to answer questions like:
  - *"Who works at Acme Corp?"*
  - *"List all CTOs in my network."*
  - *"What are the interests of John Doe?"*
<img width="1365" height="598" alt="Screenshot 2026-03-21 140335" src="https://github.com/user-attachments/assets/270865be-63b9-40d0-b899-eaf088c34886" />
<img width="1364" height="604" alt="Screenshot 2026-03-21 140325" src="https://github.com/user-attachments/assets/6e434b1f-da3e-4260-bb64-eeeaaae9fda2" />
<img width="1364" height="602" alt="Screenshot 2026-03-21 140412" src="https://github.com/user-attachments/assets/6e26f93c-ee5c-46b8-adb8-63c05db03ddb" />
<img width="1361" height="600" alt="image" src="https://github.com/user-attachments/assets/1104d13a-0c0d-46a9-98b7-d814463785e3" />

---

##  Detailed Implementation Changes

### Core Logic & Data Modeling
1. **[NEW] `packages/api/src/contacts/`**:
   - `model.ts`: Defined the Mongoose schema for contacts.
   - Included core fields: `name`, `company`, `role`, `email`, `notes`.
   - Added an **`attributes: Schema.Types.Mixed`** field to handle arbitrary attributes dynamically.
2. **[NEW] `packages/api/src/tools/getContactsTool.ts`**:
   - Built the LangChain tool definition for the `get_contacts` operation.
   - Defined the JSON Schema for the `query` parameter.
3. **[NEW] `api/app/clients/tools/structured/GetContacts.js`**:
   - Implemented the actual execution logic for searching the MongoDB contact collection.

### Backend API (`/api`)
- **[NEW] `api/server/routes/contacts.js`**: Created CRUD endpoints and the CSV upload route.
- **[MODIFY] `api/server/routes/index.js`**: Registered the new contacts route.
- **[MODIFY] `api/app/clients/tools/manifest.json`**: Added the "Contacts Workspace" tool to the manifest for UI discoverability.
- **[MODIFY] `api/app/clients/tools/index.js`**: Exported the new tool to the global registry.

### Frontend Integration (`/client` & `/packages/data-provider`)
- **[NEW] `client/src/components/SidePanel/Contacts/`**:
  - `ContactPanel.tsx`: Main container for the sidebar feature.
  - `ContactList.tsx`: Efficient list rendering with search filtering.
  - `ContactCard.tsx`: Reusable component for displaying contact summaries.
  - `ContactDetailModal.tsx`: Detailed view for core fields and arbitrary metadata.
  - `ContactImport.tsx`: File upload interface for CSV data.
- **[NEW] `client/src/data-provider/Contacts/`**: Added `queries.ts` for React Query integration.
- **[MODIFY] `packages/data-provider/src/types/assistants.ts`**: Added `get_contacts` to the `Tools` enum for global state consistency.
- **[MODIFY] `client/src/components/Nav/Nav.tsx`**: Added the Contact icon to the navigation sidebar.

---

##  Architecture Explanation

LibreChat follows a **monorepo** architecture where the frontend (`/client`) and backend (`/api`) share logic via specialized packages. This implementation leverages that structure:

1.  **Data Layer**: MongoDB stores contacts. The **attributes (Mixed)** schema type is critical—it allows us to store "Industry" for one contact and "Funding Stage" for another without modifying the database schema.
2.  **Tooling Layer**: We use the **Structured Tool** pattern. When a user asks "Who works at Stripe?", the LLM identifies the `get_contacts` tool from its manifest, generates the search query `{"query": "Stripe"}`, and the backend executes this against MongoDB.
3.  **Search Logic**: The current search uses a case-insensitive regex match across multiple fields (`name`, `company`, `role`, `email`, `attributes`). This ensures that even arbitrary attributes are searchable.

---

##  Detailed Setup & Installation

### Prerequisites
- **Node.js**: v20.19.0+ or ^22.12.0
- **MongoDB**: A running instance (local or Atlas)

### 1. Installation
From the project root, run:
```bash
npm install
npm run smart-reinstall
```
This will install dependencies and link the internal packages (`data-provider`, `data-schemas`).

### 2. Build the Data Package
Since we modified the shared types in `data-provider`, you **must** rebuild it:
```bash
npm run build:data-provider
```

### 3. Environment Configuration
Create or update your `.env` file in the root directory:
```env
# Enable required endpoints
ENDPOINTS=google,agents,plugins

# Google AI Configuration (Required for Gemini)
GOOGLE_KEY=your_google_api_key_here

# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/LibreChat
```

### 4. Running the Application
Open two terminal windows:
- **Terminal 1 (Backend)**:
  ```bash
  npm run backend
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  npm run frontend:dev
  ```

### 5. Using the Contact Workspace
1.  Navigate to `http://localhost:3090`.
2.  Open the **Contacts Sidebar** from the left navigation.
3.  Upload a CSV file (e.g., `chat_states_1k.csv`) to populate your database.
4.  Switch to the **Agents** workspace, create an Agent with the **Google** provider, and **enable the "Contacts Workspace" tool**.

---

##  Design Questions

### 1. If the system needed to support 1,000,000 contacts, how would you redesign it?
At this scale, standard regex searches in MongoDB become slow. A production-ready redesign would include:
- **Dedicated Search Engine**: Move contact indexing to **Elasticsearch** or **Algolia**. These engines are built for multi-attribute full-text search and can handle millions of records with millisecond latency.
- **Background Job Processing**: Handle 1M+ CSV imports using a task queue like **BullMQ** with Redis. This prevents the API from timing out and allows the user to see a progress bar.
- **Database Indexing**: Implement `text` indexes in MongoDB and ensure that common query paths are covered by compound indexes.

### 2. How would you ensure the assistant retrieves the most relevant contacts for a query?
- **Semantic/Vector Search (RAG)**: Instead of simple keyword matching, I would generate embeddings for each contact. When a user asks a question, the system converts the question to a vector and retrieves the mathematically "closest" contacts.
- **Hierarchical Filtering**: Use the LLM to extract "hard" filters first (e.g., Company="Stripe") to narrow down the pool, then apply semantic search on the remaining results.

### 3. What are the limitations of your current implementation?
- **Keyword Dependency**: The current system relies on exact or partial string matching. It doesn't understand synonyms (e.g., it might miss "Software Engineer" if searching for "Dev").
- **Stateless Tool Calling**: The tool currently returns raw contact data; for extremely large result sets, the retrieval would need to be paginated to avoid hitting the LLM's context window limits.
- **CSV Headers**: The importer assumes semi-standard headers. A more robust system would include a "header mapping" UI for users to tell the system which CSV column maps to which field.
