# Bajaj Finserv Challenge - Frontend Client

A premium single-page web client built with React and Vite to interact with the BFHL API.

## Design Highlights
* **Tab Title**: Set to the roll number `2110991234`.
* **Dark Glow Theme**: Modern design system using smooth dark-mode radial gradients, CSS variables, and micro-interactions.
* **JSON Syntax Highlighter & Validator**: Real-time validation feedback for payload errors.
* **Base64 File Helper**: Sleek drag-and-drop component to convert user attachments into Base64 format and auto-embed them in API requests.
* **Interactive Dropdown**: Multi-select pills to dynamically filter the output view for numbers, alphabets, and highest lowercase letter.

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the client.

## Environment Customization
By default, the client directs calls to `http://localhost:4000/bfhl`. To customize this, create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=https://your-deployed-api.com/bfhl
```
