# PharmaTrade - Global Pharma Export Marketplace

Enterprise-grade B2B website for a Global Pharma Export Marketplace + Execution OS.

## Tech Stack

- **React JS** (Vite)
- **Tailwind CSS**
- **React Router**
- Component-based architecture
- Fully responsive design

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Container)
│   ├── sections/     # Page sections (Hero, TrustLayer, etc.)
│   ├── Navbar.jsx    # Navigation component
│   └── Footer.jsx    # Footer component
├── pages/            # Page components
├── layout/           # Layout components
├── routes/           # Routing configuration
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Pages

- **Home** (`/`) - Main landing page with all sections
- **For Buyers** (`/buyers`) - Buyer-focused information
- **For Suppliers** (`/suppliers`) - Supplier-focused information
- **Compliance** (`/compliance`) - Compliance and trust information
- **Platform** (`/platform`) - Platform features and pricing
- **Login** (`/login`) - Login UI (UI only)
- **Request Access** (`/request-access`) - Access request form (UI only)

## Design System

### Colors

- **Primary**: `#0A192F` (Deep navy)
- **Accent**: `#2563EB` (Blue)
- **Muted**: `#1E293B` (Charcoal)
- **Border**: `#334155` (Slate)

### Typography

- Hero: `text-5xl font-semibold`
- Section title: `text-3xl font-semibold`
- Body: `text-base text-slate-300`
- Small meta: `text-sm text-slate-400`

## Features

- ✅ Fully responsive design
- ✅ Dark enterprise theme
- ✅ Smooth scrolling
- ✅ Sticky navbar with blur effect
- ✅ Semantic HTML
- ✅ Accessible components
- ✅ SEO meta structure
- ✅ Production-ready structure

## Notes

- All forms are UI-only (no backend integration)
- No external UI libraries (pure Tailwind CSS)
- Component-based architecture for scalability
- Clean folder structure for maintainability
