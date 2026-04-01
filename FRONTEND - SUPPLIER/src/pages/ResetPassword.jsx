import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthBrandHeader, AuthShell } from '@/components/auth/AuthShell'
import { resetPasswordSupplier } from '@/services/auth.service'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please use the link from your email.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!token) {
      setError('Invalid reset link.')
      setLoading(false)
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await resetPasswordSupplier(token, newPassword, confirmPassword)
      setSuccess(true)
      setTimeout(() => navigate('/supplier/login', { state: { message: 'Password reset successfully. You can now sign in.' } }), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell maxWidth="md">
      <div className="animate-fade-in">
        <AuthBrandHeader
          icon={Building2}
          title="New password"
          subtitle="Choose a strong password for your supplier account."
        />

        <Card className="shadow-shell">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your new password below. It must be at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-success/25 bg-success/5 p-4 text-center text-sm text-success">
                Password has been reset. Redirecting to login...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !token}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            )}
            <div className="mt-6 text-center">
              <Link to="/supplier/login" className="text-sm font-medium text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  )
}
