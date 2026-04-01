import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm mb-6">
              An unexpected error occurred. Please try again or refresh the page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry}>Try again</Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/supplier/dashboard'}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
