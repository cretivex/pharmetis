import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 dark:bg-background">
      <div className="mx-auto max-w-md animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
          <FileQuestion className="h-8 w-8 text-muted-foreground" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This URL doesn&apos;t exist or you don&apos;t have access. Head back to the portal or sign in.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/supplier/login" className="sm:flex-1 sm:max-w-[11rem]">
            <Button variant="outline" className="w-full">
              Go to login
            </Button>
          </Link>
          <Link to="/supplier/dashboard" className="sm:flex-1 sm:max-w-[11rem]">
            <Button className="w-full font-semibold shadow-sm">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
