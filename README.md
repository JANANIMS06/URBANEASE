# UrbanEase — Local Development Version

A local rebuild of the UrbanEase home-services website based on the supplied screenshots and Review 1 document.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express REST API
- Database: PostgreSQL
- Authentication: JWT + bcrypt (local replacement for Firebase Authentication)
- Maps, Gemini chatbot, Google Forms, and real payment gateway: not connected in this local MVP. The UI includes a simple demo chat and booking flow.

## Requirements
Install Node.js 20+ and PostgreSQL 14+.

## 1. Create the database
Open pgAdmin Query Tool or `psql` and run:
```sql
CREATE DATABASE urbanease;
```
Then run the SQL in `backend/db/schema.sql` against the `urbanease` database. This creates the tables and inserts the sample service catalogue.

## 2. Configure and start backend
```bash
cd backend
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`. Edit `.env` with your PostgreSQL username/password.
```bash
npm install
npm run dev
```
Backend runs at http://localhost:5000

## 3. Start frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## Demo flow
- Browse and search services without signing in.
- Create an account or sign in to make bookings.
- Open a service card and use Book Now to submit a booking.
- Use My Bookings to view your bookings.
- Use Become Provider to submit a provider application.

## Important notes
- The displayed service prices, ratings, and descriptions are demo data based on the screenshot, not live provider quotes.
- Payment is recorded as `pending`/demo only; no real money is charged.
- Use a strong JWT secret and appropriate security settings before any public deployment.
