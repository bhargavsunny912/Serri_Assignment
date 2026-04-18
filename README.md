# LibreChat Contact Workspace (Assignment)

This project adds a simple **Contact Workspace** feature to LibreChat. It allows storing contacts, importing them via CSV, and querying them using an AI tool.

---

## 🚀 Demo / Outputs

<p align="center">
<img width="958" height="475" alt="Screenshot 2026-04-18 174619" src="https://github.com/user-attachments/assets/efb5f1a2-5d28-476e-bbb7-9192fe53840a" />
<img width="960" height="477" alt="Screenshot 2026-04-18 174642" src="https://github.com/user-attachments/assets/4d668c63-d8a5-4808-b512-6d7fcc569d4f" />

</p>

<p align="center">
  <img width="960" height="476" alt="Screenshot 2026-04-18 174700" src="https://github.com/user-attachments/assets/95d690ae-1eae-4f7f-b70e-3b2c8df89545" />
  <img width="956" height="481" alt="Screenshot 2026-04-18 174852" src="https://github.com/user-attachments/assets/843b5443-a6d1-4ae2-9227-22c91dd8b138" />
</p>

---

## 1. Your Implementation Changes

### Backend

* Added contacts module with schema:

  * `name`, `company`, `role`, `email`, `notes`
  * `attributes` field for dynamic CSV data

* Created API routes:

  * CRUD operations
  * CSV upload endpoint

* Integrated AI tool:

  * `get_contacts` tool
  * Fetches data from database based on query

* Updated:

  * tool manifest
  * tool registration

---

### Frontend

* Added Contacts section in sidebar

* Created components:

  * Contact list
  * Contact card
  * Detail modal
  * CSV upload UI

* Used React Query for API handling

---

## 2. Setup Instructions

### Prerequisites

* Node.js
* MongoDB

### Install

```bash id="d1h2ka"
npm install
npm run smart-reinstall
```

### Build

```bash id="r5l1xz"
npm run build:data-provider
```

### Environment (.env)

```env id="b0q4lf"
ENDPOINTS=google,agents,plugins
GOOGLE_KEY=your_api_key
MONGO_URI=mongodb://localhost:27017/LibreChat
```

### Run

Backend:

```bash id="9vb1sp"
npm run backend:dev
```

Frontend:

```bash id="3h9g2k"
npm run frontend:dev
```

---

## 3. Architecture Explanation

<p align="center">
  <img width="1536" height="1024" alt="ChatGPT Image Apr 18, 2026, 11_36_49 PM" src="https://github.com/user-attachments/assets/a817a4c2-18d7-41c9-9e11-4edfeae5dcc2" />
</p>

* MongoDB stores contact data
* Backend handles APIs and tool logic
* Frontend displays UI and interacts with backend
* AI agent uses `get_contacts` tool

Flow:
User → AI → Tool → Database → Response

Search is simple (regex-based across fields)

---

## 4. Design Questions

### Q1. Handling large data (1M contacts)

* Current approach may slow down
* Improvements:

  * indexing
  * better search tools (Elasticsearch)
  * background processing for uploads

---

### Q2. Improving search relevance

* Current: keyword-based
* Can improve with:

  * filters
  * semantic search

---

### Q3. Limitations

* Basic string search
* No pagination
* CSV format assumptions
* Not scalable for very large data

---

## Conclusion

This project connects contact data with an AI tool to support natural language queries. It includes CRUD operations, CSV upload, and simple search, with scope for future improvements.
