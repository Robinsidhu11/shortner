# Minimal URL Shortener

Fast, production-ready URL shortener built with **Next.js (App Router)** and **MongoDB Atlas**.  
Frontend and backend live in a single Next.js app: the homepage creates short links, and `/{code}` redirects instantly to the original URL.

## 1. Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm or yarn
- A MongoDB Atlas cluster (or any MongoDB instance)

## 2. Environment variables

Create a `.env.local` file in the project root (same folder as `package.json`) based on `.env.example`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set your MongoDB connection string:

```bash
MONGODB_URI="your-mongodb-atlas-connection-string"
```

The database name comes from the URI itself (e.g. `.../shortener`).

## 3. Install dependencies

From the project root:

```bash
npm install
```

## 4. Run the app in development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## 5. How it works

- **Shortening API**: `POST /api/shorten`
  - Body: `{ "url": "https://example.com/very/long/link" }`
  - Response: `{ "shortCode": "abc1234" }`
- **Redirect**: `GET /{shortCode}` looks up the code in MongoDB and issues a 302 redirect.
- **Storage**:
  - Collection: `short_urls`
  - Document fields: `shortCode`, `targetUrl`, `createdAt`
  - Indexed on `shortCode` for very fast lookups.

## 6. Production notes

- Deploy the app to any Node/Next-compatible host (e.g. Vercel).  
- Set `MONGODB_URI` in your production environment variables.  
- Redirects are handled via a minimal Node.js runtime route, with:
  - A small document shape
  - An index on `shortCode`
  - Cached MongoDB client for efficient connections

No analytics or tracking are stored—only the mapping from short code to the destination URL.

