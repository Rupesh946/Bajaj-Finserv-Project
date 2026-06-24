# Chitkara Full Stack Developer Challenge - Bajaj Finserv Health (BFHL) Submission

This repository contains the complete full-stack solution for Round 1 of the Chitkara Full Stack Engineering Challenge. It features a robust Node.js backend REST API and a responsive React client interface with dynamic filtering.

## Repository Contents

* **[`/backend`](file:///c:/Users/Rupesh/OneDrive/Desktop/Bajaj%20Finserv/backend)**: Express Node.js API with custom base64 file validators and element sorting.
* **[`/frontend`](file:///c:/Users/Rupesh/OneDrive/Desktop/Bajaj%20Finserv/frontend)**: High-fidelity Vite-React interface supporting real-time filter pills and attachment helpers.

---

## Identity Parameters
All API responses return the student parameters approved for this challenge:
* **User ID**: `rupesh_24062002`
* **Email**: `rupesh.dev@chitkara.edu.in`
* **Roll Number**: `2110991234`

---

## System Requirements

Ensure you have **Node.js (v18+)** installed.

### Quick Setup

#### 1. Setup Backend
Open a terminal and run:
```bash
cd backend
npm install
npm start
```
The server will run on [http://localhost:4000](http://localhost:4000).

#### 2. Setup Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The client dashboard will load on [http://localhost:3000](http://localhost:3000).

---

## API Documentation

### POST `/bfhl`
Processes data arrays and optional file metadata.

* **Sample Payload**:
  ```json
  {
    "data": ["A", "1", "324", "M", "a", "c"],
    "file_b64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
  }
  ```
* **Sample Response**:
  ```json
  {
    "is_success": true,
    "user_id": "rupesh_24062002",
    "email": "rupesh.dev@chitkara.edu.in",
    "roll_number": "2110991234",
    "numbers": ["1", "324"],
    "alphabets": ["A", "M", "a", "c"],
    "highest_lowercase_alphabet": ["c"],
    "file_valid": true,
    "file_mime_type": "image/png",
    "file_size_kb": 0.05
  }
  ```

### GET `/bfhl`
* **Response**:
  ```json
  {
    "operation_code": 1
  }
  ```
