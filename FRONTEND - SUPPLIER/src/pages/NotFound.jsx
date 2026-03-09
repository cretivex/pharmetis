import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/supplier/login">
          <Button variant="outline">Go to login</Button>
        </Link>
        <Link to="/supplier/dashboard" className="ml-3">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
