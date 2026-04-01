import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import MedicinesPage from './pages/MedicinesPage'
import SuppliersPage from './pages/SuppliersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/medicines" element={<MedicinesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
      </Routes>
    </BrowserRouter>
  )
}
