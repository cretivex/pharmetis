import { useState } from 'react'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import MedicinesHero from '../components/medicines/MedicinesHero'
import MedicinesSidebar from '../components/medicines/MedicinesSidebar'
import MedicinesProductGrid from '../components/medicines/MedicinesProductGrid'

export default function MedicinesPage() {
  const [view, setView] = useState('grid')

  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <Navbar />
      <MedicinesHero view={view} onViewChange={setView} />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:gap-10 lg:px-8 lg:py-14">
        <MedicinesSidebar />
        <div className="mt-8 min-w-0 flex-1 lg:mt-0">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Wholesale</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Browse Generic Medicines in Bulk
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
              Wholesale sourcing from verified manufacturers—compare certifications, MOQs, and
              availability before you request a quote.
            </p>
          </div>
          <MedicinesProductGrid view={view} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
