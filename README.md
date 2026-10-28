# AgriTech — Smart Farming Management System

A starter full-stack MERN project for farmers: authentication, farm and crop records, weather lookup, alerts, and a simple dashboard.

## Stack
- React + Vite + Bootstrap
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing

## Requirements
- Node.js 18+ and npm
- MongoDB local instance or MongoDB Atlas connection string
- Optional: OpenWeatherMap API key for live weather

## Run locally

### 1. Configure backend
```bash
cd server
cp .env.example .env
```
Edit `server/.env` and set `MONGODB_URI`, `JWT_SECRET`, and optionally `WEATHER_API_KEY`.

### 2. Install and run backend
```bash
npm install
npm run dev
```
API runs at `http://localhost:5000`.

### 3. Install and run frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

## Included API routes
- `GET /api/health` — API status
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in and receive JWT
- `GET /api/farms` — list your farms (JWT required)
- `POST /api/farms` — create a farm (JWT required)
- `GET /api/crops` — list your crops (JWT required)
- `POST /api/crops` — create a crop record (JWT required)
- `GET /api/weather?city=Ujjain` — current weather if an API key is configured

## Demo credentials
There are no pre-created accounts. Register from the app.

## Before deploying
- Set strong secrets in environment variables.
- Configure production CORS origins and HTTPS.
- Add rate limiting, email verification, password reset, request validation, and automated tests.
- Weather requires a valid OpenWeatherMap API key. Without one, the endpoint returns a helpful setup message.
- This is a starter project, not a production-ready agricultural advisory system. Verify agronomic and weather advice with trusted local sources.

## Add Demo and GitHub links
After deploying, add your live URL and repository URL to your project submission page. This ZIP does not create or publish either link automatically.
