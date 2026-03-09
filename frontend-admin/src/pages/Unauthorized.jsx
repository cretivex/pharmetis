import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <ShieldX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Access denied</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You don&apos;t have permission to view this page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate('/login')}>
            Sign in again
          </Button>
        </div>
      </div>
    </div>
  )
}
