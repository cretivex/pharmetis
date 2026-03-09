import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

const SIDEBAR_WIDTH = 280
const SIDEBAR_COLLAPSED_WIDTH = 72

/**
 * Admin control panel layout. Sidebar + top bar + main content.
 * Sidebar collapse state is lifted here so content and navbar stay flush (no gap).
 */
export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((c) => !c)} />
      <div
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-hide transition-[margin] duration-300 ease-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar sidebarWidth={sidebarWidth} />
        <main className="pt-16 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
