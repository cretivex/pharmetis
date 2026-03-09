import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="md:ml-[280px] transition-all duration-300">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
