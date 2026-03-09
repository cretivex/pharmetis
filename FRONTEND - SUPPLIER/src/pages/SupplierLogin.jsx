import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { loginSupplier } from '@/services/auth.service'

export default function SupplierLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const message = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const result = await loginSupplier(email, password)
      console.log('Login result:', result)
      
      if (result?.success || result?.data?.token || result?.data?.accessToken) {
        navigate('/supplier/dashboard')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      })
      
      let errorMessage = 'Login failed'
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000'
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 'Invalid email or password'
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request. Please check your input.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Supplier Portal</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link
                  to="/supplier/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-4 space-y-2">
              <div className="text-center text-sm">
                <p className="text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link to="/supplier/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
              <div className="text-center text-xs text-gray-500 border-t pt-2 space-y-1">
                <p><strong>Test:</strong> supplier1@test.com / Supplier123!</p>
                <p>API: {import.meta.env.VITE_API_URL || 'https://api.pharmetis.in/api'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
