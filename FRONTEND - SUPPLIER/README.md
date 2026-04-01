# Supplier Portal - PharmaTrade

Operational portal for suppliers to manage RFQs, products, and company profile.

## Tech Stack

- React (Vite)
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- React Router DOM
- Axios

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5175`

### Build

```bash
npm run build
```

## Pages

1. **Supplier Registration** (`/supplier/register`) - Multi-step registration form
2. **Supplier Login** (`/supplier/login`) - Login page
3. **Dashboard** (`/supplier/dashboard`) - RFQ overview and stats
4. **RFQ Response** (`/supplier/rfqs/:id`) - Respond to RFQ with pricing
5. **My Products** (`/supplier/products`) - Manage product catalog
6. **Profile** (`/supplier/profile`) - Company profile and status

## Features

- Clean, task-focused interface
- Compact table layouts
- Bulk product upload (Excel/CSV)
- RFQ response with auto-calculated totals
- Multi-step registration with draft saving
- Document upload support
