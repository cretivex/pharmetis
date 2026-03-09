# Frontend-Backend Connection Guide

## ✅ Setup Complete

The frontend and backend are now connected with full API integration.

## 📁 Files Created

### Frontend Services
- `frontend - user/src/config/api.js` - API client configuration
- `frontend - user/src/services/auth.service.js` - Authentication service
- `frontend - user/src/services/products.service.js` - Products API service
- `frontend - user/src/services/suppliers.service.js` - Suppliers API service
- `frontend - user/src/services/rfq.service.js` - RFQ API service
- `frontend - user/src/services/orders.service.js` - Orders API service

### Backend API Endpoints
- `backend/src/modules/products/` - Products endpoints
- `backend/src/modules/suppliers/` - Suppliers endpoints
- `backend/src/modules/rfqs/` - RFQ endpoints
- `backend/src/modules/orders/` - Orders endpoints

## 🔧 Configuration

### 1. Frontend Environment Variables

Create `frontend - user/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Backend Environment Variables

Ensure `backend/.env` has:
```env
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
cd "frontend - user"
npm run dev
```
Frontend runs on: `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/:id` - Get product by ID

### Suppliers
- `GET /api/suppliers` - Get all suppliers (with filters)
- `GET /api/suppliers/slug/:slug` - Get supplier by slug
- `GET /api/suppliers/:id` - Get supplier by ID
- `GET /api/suppliers/:id/products` - Get supplier products

### RFQs (Requires Authentication)
- `POST /api/rfqs` - Create RFQ
- `GET /api/rfqs` - Get user's RFQs
- `GET /api/rfqs/:id` - Get RFQ by ID
- `PATCH /api/rfqs/:id` - Update RFQ
- `DELETE /api/rfqs/:id` - Delete RFQ

### Orders (Requires Authentication)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID

## 🔐 Authentication Flow

1. User logs in via `authService.login()`
2. Access token stored in `localStorage`
3. Token automatically included in API requests
4. Navbar updates based on login state
5. Logout clears tokens and updates UI

## 📝 Usage Examples

### Login
```javascript
import { authService } from '../services/auth.service.js'

try {
  await authService.login(email, password)
  // User is now logged in
} catch (error) {
  console.error(error.message)
}
```

### Fetch Products
```javascript
import { productsService } from '../services/products.service.js'

const products = await productsService.getAll({
  search: 'paracetamol',
  dosageForm: 'TABLET',
  page: 1,
  limit: 20
})
```

### Fetch Suppliers
```javascript
import { suppliersService } from '../services/suppliers.service.js'

const suppliers = await suppliersService.getAll({
  country: 'India',
  isVerified: true
})
```

## ✅ Updated Components

- `Login.jsx` - Now uses real API authentication
- `Navbar.jsx` - Uses `authService` for logout

## 🧪 Testing

1. Start both servers
2. Open frontend: `http://localhost:5173`
3. Try logging in (create user first via register endpoint)
4. Navigate to products/suppliers pages
5. Check browser console for API calls

## 🔍 Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` includes `http://localhost:5173`
- Restart backend after changing `.env`

### Connection Refused
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`

### 401 Unauthorized
- Check if token is stored in `localStorage`
- Verify token hasn't expired
- Try logging in again

## 📚 Next Steps

1. Update other pages to use API services:
   - `Medicines.jsx` - Use `productsService.getAll()`
   - `Suppliers.jsx` - Use `suppliersService.getAll()`
   - `SendRFQ.jsx` - Use `rfqService.create()`
   - `MyRFQs.jsx` - Use `rfqService.getAll()`
   - `Orders.jsx` - Use `ordersService.getAll()`

2. Add error handling and loading states
3. Implement token refresh on 401 errors
4. Add request interceptors for automatic token refresh
