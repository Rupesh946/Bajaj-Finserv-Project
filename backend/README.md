# Bajaj Finserv Challenge - Backend API

This is the Express-based Node.js API for the Bajaj Finserv Health Challenge.

## Setup Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend server will run on [http://localhost:4000](http://localhost:4000).

## Endpoints

### 1. GET `/bfhl`
* **Response**: Returns a JSON object with a status code of 200:
  ```json
  {
    "operation_code": 1
  }
  ```

### 2. POST `/bfhl`
* **Request Body**:
  ```json
  {
    "data": ["A", "1", "324", "M", "a", "c"],
    "file_b64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
  }
  ```
* **Response**:
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
