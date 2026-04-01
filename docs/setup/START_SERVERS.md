# How to Start the Application

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on: `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd "frontend - user"
npm run dev
```

The frontend will run on: `http://localhost:5173`

## Verify Backend is Running

Check if backend is responding:
```bash
curl http://localhost:5000/health
```

Or visit in browser: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

## Troubleshooting

### Backend Connection Refused
- Make sure PostgreSQL is running
- Check `backend/.env` has correct `DATABASE_URL`
- Verify backend is running on port 5000
- Check for port conflicts

### Frontend Can't Connect to Backend
- Verify backend is running: `http://localhost:5000/health`
- Check `frontend - user/.env` has: `VITE_API_URL=http://localhost:5000/api`
- Restart frontend after backend starts

## Test Credentials

- **Admin**: `admin@pharmetis.com` / `password123`
- **Vendor**: `vendor1@medipharma.com` / `password123`
- **Buyer**: `buyer1@healthcare.com` / `password123`
