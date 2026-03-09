# How to Start the Backend Server

## Quick Start

```bash
cd backend
npm run dev
```

The server will start on **http://localhost:5000**

## Alternative Commands

### Development Mode (with auto-reload):
```bash
cd backend
npm run dev
```

### Production Mode:
```bash
cd backend
npm start
```

## Verify Server is Running

Once started, you should see:
```
🚀 Server running on port 5000
📦 Environment: development
🌐 CORS Origin: http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## API Endpoints

- **Base URL:** http://localhost:5000/api
- **Login:** POST http://localhost:5000/api/auth/login
- **Health Check:** GET http://localhost:5000/api/health (if available)

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
1. Change PORT in `backend/.env` file
2. Or kill the process using port 5000:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Database Connection Issues
Make sure PostgreSQL is running and DATABASE_URL is set in `backend/.env`

### Missing Dependencies
```bash
cd backend
npm install
```

## Environment Variables

Required in `backend/.env`:
- `PORT=5000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175`
