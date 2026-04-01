# Supplier Login Troubleshooting Guide

## Common Issues and Solutions

### 1. Connection Refused Error (ERR_CONNECTION_REFUSED)

**Problem:** `POST http://localhost:5000/api/auth/login net::ERR_CONNECTION_REFUSED`

**Solution:**
1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify server is running:**
   - Check terminal for: `🚀 Server running on port 5000`
   - Open browser: http://localhost:5000/api/auth/login (should show error, but confirms server is up)

3. **Check if port 5000 is in use:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   ```

### 2. CORS Error

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. **Check backend `.env` file:**
   ```env
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
   ```

2. **Restart backend server** after changing CORS settings

### 3. Invalid Credentials

**Problem:** Login fails with "Invalid email or password"

**Solution:**
1. **Use correct test credentials:**
   - Email: `supplier1@test.com`
   - Password: `Supplier123!`

2. **Or use seed data:**
   - Email: `vendor1@medipharma.com`
   - Password: `password123`

3. **Verify user exists:**
   ```bash
   cd backend
   node scripts/get-suppliers.js
   ```

### 4. API URL Configuration

**Problem:** Frontend can't find API endpoint

**Solution:**
1. **Create `.env` file in `FRONTEND - SUPPLIER/`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Restart frontend dev server** after creating `.env`

3. **Verify in browser console:**
   - Check Network tab for actual request URL
   - Should be: `http://localhost:5000/api/auth/login`

### 5. Token Not Saved

**Problem:** Login succeeds but token not saved

**Solution:**
1. **Check browser console** for errors
2. **Check localStorage:**
   ```javascript
   localStorage.getItem('supplierToken')
   ```
3. **Clear localStorage and try again:**
   ```javascript
   localStorage.clear()
   ```

## Quick Test Steps

1. **Backend Running?**
   ```bash
   curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test\",\"password\":\"test\"}"
   ```
   Should return JSON (even if error, confirms server is up)

2. **Frontend API URL?**
   - Open browser DevTools → Network tab
   - Try login
   - Check request URL in Network tab

3. **Credentials Valid?**
   ```bash
   cd backend
   node scripts/get-suppliers.js
   ```

## Test Credentials

### Dummy Suppliers (Password: `Supplier123!`)
- `supplier1@test.com`
- `supplier2@test.com`
- `supplier3@test.com`

### Seed Data Suppliers (Password: `password123`)
- `vendor1@medipharma.com`
- `vendor2@globalpharma.com`
- `vendor3@biomed.com`
- `vendor4@pharmacore.com`
- `vendor5@asianpharma.com`

## Debug Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5175
- [ ] `.env` file exists in `FRONTEND - SUPPLIER/` with `VITE_API_URL=http://localhost:5000/api`
- [ ] CORS_ORIGIN in backend `.env` includes `http://localhost:5175`
- [ ] User exists in database (check with `get-suppliers.js`)
- [ ] Password is correct (check credentials above)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows request reaching backend

## Still Not Working?

1. **Check backend logs** for errors
2. **Check browser console** for detailed error messages
3. **Verify database connection** in backend
4. **Try direct API call:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"supplier1@test.com\",\"password\":\"Supplier123!\"}"
   ```
