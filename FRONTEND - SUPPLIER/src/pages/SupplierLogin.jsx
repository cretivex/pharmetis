import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthBrandHeader, AuthShell, AuthSplitBrandDefault } from '@/components/auth/AuthShell'
import { loginSupplier } from '@/services/auth.service'
import { SUPPLIER_FLASH_KEY } from '@/lib/flashStorage.js'

function emitToastFromVariant(message, toastVariant) {
  const id = `supplier-login-${message.slice(0, 48)}`
  const opts = { id }
  switch (toastVariant) {
    case 'error':
      toast.error(message, opts)
      break
    case 'warning':
      toast.warning(message, opts)
      break
    case 'info':
      toast.info(message, opts)
      break
    default:
      toast.success(message, opts)
  }
}

export default function SupplierLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SUPPLIER_FLASH_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      sessionStorage.removeItem(SUPPLIER_FLASH_KEY)
      if (parsed?.message) {
        emitToastFromVariant(parsed.message, parsed.variant || 'warning')
      }
    } catch {
      sessionStorage.removeItem(SUPPLIER_FLASH_KEY)
    }
  }, [])

  useEffect(() => {
    const msg = location.state?.message
    if (!msg) return
    emitToastFromVariant(msg, location.state?.toastVariant || 'success')
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.state, location.pathname, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const result = await loginSupplier(email, password)

      if (result?.success) {
        toast.success('Signed in successfully')
        navigate('/supplier/dashboard')
      } else {
        const msg = 'Login failed. Please check your credentials.'
        setError(msg)
        toast.error(msg)
      }
    } catch (err) {
      let errorMessage = 'Login failed'

      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage =
          'Cannot connect to server. Please ensure the backend is running on http://localhost:5000'
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 'Invalid email or password'
      } else if (err.response?.status === 403) {
        errorMessage =
          err.response?.data?.message ||
          'This account is not a supplier. Use a vendor account or the correct portal.'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request. Please check your input.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell variant="split" maxWidth="md" brandAside={<AuthSplitBrandDefault />}>
      <AuthBrandHeader
        icon={Building2}
        title="Welcome back"
        subtitle="Sign in to manage RFQs, products, and your supplier profile."
      />

      <Card className="animate-scale-in border-border/60 shadow-shell">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Use your registered supplier email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex justify-end">
              <Link
                to="/supplier/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="h-11 w-full text-base font-semibold shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          <div className="mt-6 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
            <p>
              No account yet?{' '}
              <Link to="/supplier/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Create supplier account
              </Link>
            </p>
            <p className="mt-4 text-left text-2xs leading-relaxed text-muted-foreground/90">
              API: {import.meta.env.VITE_API_URL || '/api (via Vite proxy)'}
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
