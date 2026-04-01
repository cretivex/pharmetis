import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import PageContainer from '@/components/layout/PageContainer'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const SIDEBAR_WIDTH = 280
const SIDEBAR_COLLAPSED_WIDTH = 72

/**
 * Admin shell: responsive sidebar (drawer on small screens), top bar, main content.
 */
export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false)
  }, [isDesktop])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  return (
    <div className="flex min-h-screen bg-background">
      {!isDesktop && mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        isDesktop={isDesktop}
      />

      <div
        className="flex min-h-screen min-w-0 flex-1 flex-col overflow-y-auto transition-[margin] duration-300 ease-out scrollbar-thin"
        style={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
      >
        <Navbar
          sidebarWidth={sidebarWidth}
          isDesktop={isDesktop}
          onOpenMobileMenu={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 min-w-0 pt-16">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  )
}
