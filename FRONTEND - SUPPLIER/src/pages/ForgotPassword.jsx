import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthBrandHeader, AuthShell } from '@/components/auth/AuthShell'
import { sendResetOtpSupplier } from '@/services/auth.service'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !email.trim()) {
      setError('Please enter your email')
      setLoading(false)
      return
    }

    try {
      await sendResetOtpSupplier(email.trim())
      setSuccessMessage('If this email exists, a reset link has been sent. Please check your inbox.')
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell maxWidth="md">
      <div className="animate-fade-in">
        <AuthBrandHeader
          icon={Building2}
          title="Reset password"
          subtitle="We’ll email a one-time code to verify it’s you."
        />

        <Card className="shadow-shell">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your registered email and we will send a secure reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-4">
              {successMessage && (
                <div className="rounded-xl border border-success/25 bg-success/5 p-3 text-sm text-success">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
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
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
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
