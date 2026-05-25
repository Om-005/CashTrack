# CashTrack

CashTrack is a full-stack expense tracking application with a React Native / Expo frontend and an Express/MongoDB backend.

## Project Structure

- `frontend/` — Expo app built with React Native
- `backend/` — Node.js + Express API with MongoDB

## Getting Started

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables in `backend/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Open `frontend/src/utils/constants.js` and set `API_URL` to your backend URL:
   ```js
   export const API_URL = 'https://your-backend-url.com/api';
   ```
3. Run the Expo app:
   ```bash
   npx expo start
   ```

## Deploying Online

- Deploy the backend to a platform like Render, Railway, or Heroku.
- Use MongoDB Atlas for a cloud database and set `MONGO_URI` accordingly.
- Update the frontend `API_URL` so the app calls the hosted backend.

## Notes

- The backend must be online for the mobile app to work.
- Do not commit `node_modules/`.
- The root repository includes both frontend and backend code.
