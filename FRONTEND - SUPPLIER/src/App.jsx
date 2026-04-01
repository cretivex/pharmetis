import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppRoutes } from '@/routes'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={4500}
          toastOptions={{
            classNames: {
              toast: 'text-sm shadow-lg',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
