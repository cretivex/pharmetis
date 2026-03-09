# Pharmetis Backend

Production-ready Node.js backend for Pharmetis B2B pharmaceutical marketplace.

## Tech Stack

- **Node.js** with Express.js
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security
- **CORS** for cross-origin requests
- **Morgan** for HTTP request logging

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE pharmetis;
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```
   This creates all 20 tables with relationships and indexes.

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Structure

All API routes are prefixed with `/api`.

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

## Environment Variables

See `.env.example` for required variables.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── modules/          # Feature modules
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # Route definitions
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── prisma/
│   └── schema.prisma     # Prisma schema
└── package.json
```

## License

ISC
