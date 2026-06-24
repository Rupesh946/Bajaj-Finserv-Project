# Chitkara Full Stack Developer Challenge - Graph Hierarchy Visualizer

This repository contains the complete full-stack solution for the Chitkara Full Stack Engineering Challenge, featuring a Node.js Express backend and a React (Vite) visual client dashboard.

---

## Identity Details
All API responses return the student parameters:
* **User ID**: `rupesh_231099`
* **Email**: `rupesh2276.be23@chitkara.edu.in`
* **Roll Number**: `2310992276`

---

## Workspace Structure
* **[`/backend`](file:///c:/Users/Rupesh/OneDrive/Desktop/Bajaj%20Finserv/backend)**: Graph hierarchy edge validation, cycle DFS checks, diamond dependency resolvers, and summary compiler.
* **[`/frontend`](file:///c:/Users/Rupesh/OneDrive/Desktop/Bajaj%20Finserv/frontend)**: Cyberpunk dark glow visual client, recursive visual tree rendering, example payloads pre-loaders, and multi-select pill checkboxes.

---

## Running Locally

### 1. Launch Backend
Navigate to `/backend` directory and run:
```bash
cd backend
npm install
npm start
```
The graph engine starts on [http://localhost:4000](http://localhost:4000).

### 2. Run Backend Tests
Run the automated edge cases test suite in a separate terminal:
```bash
node backend/test.js
```

### 3. Launch Frontend
Navigate to `/frontend` directory and run:
```bash
cd frontend
npm install
npm run dev
```
The React dashboard launches on [http://localhost:3000](http://localhost:3000).

---

## Deployed Live Links

* **Hosted API base URL**: `https://<YOUR_RENDER_BACKEND_URL>`
* **Hosted Frontend URL**: `https://<YOUR_VERCEL_FRONTEND_URL>`
* **Public GitHub Repository**: [https://github.com/Rupesh946/Bajaj-Finserv-Project](https://github.com/Rupesh946/Bajaj-Finserv-Project)

*(Note: Replace placeholders above with your deployed urls).*

---

## API Specifications

### POST `/bfhl`
Processes edge relation strings and compiles connected components.

* **Sample Curl Command**:
  ```bash
  curl -X POST http://localhost:4000/bfhl \
    -H "Content-Type: application/json" \
    -d '{"data": ["A->B", "A->C", "B->D", "hello"]}'
  ```

* **Sample JSON Output**:
  ```json
  {
    "user_id": "rupesh_231099",
    "email_id": "rupesh2276.be23@chitkara.edu.in",
    "college_roll_number": "2310992276",
    "hierarchies": [
      {
        "root": "A",
        "tree": {
          "A": {
            "B": {
              "D": {}
            },
            "C": {}
          }
        },
        "depth": 3
      }
    ],
    "invalid_entries": ["hello"],
    "duplicate_edges": [],
    "summary": {
      "total_trees": 1,
      "total_cycles": 0,
      "largest_tree_root": "A"
    }
  }
  ```

### GET `/bfhl`
* **Response**:
  ```json
  {
    "operation_code": 1
  }
  ```
