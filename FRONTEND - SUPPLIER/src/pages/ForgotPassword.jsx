import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Loader2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { sendResetOtpSupplier, resetPasswordSupplier } from '@/services/auth.service'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      setStep(2)
      setSuccessMessage('If that email is registered as a supplier, you will receive a 6-digit OTP. Check your inbox.')
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
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
      await resetPasswordSupplier(email.trim(), otp, newPassword, confirmPassword)
      navigate('/supplier/login', { state: { message: 'Password reset successfully. You can now sign in.' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. OTP may be invalid or expired.')
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
          <p className="mt-2 text-sm text-gray-600">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 ? <Mail className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              {step === 1 ? 'Forgot Password' : 'Set new password'}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your registered email and we'll send you a 6-digit OTP."
                : 'Enter the OTP you received and your new password. OTP expires in 10 minutes.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                    {successMessage}
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="otp">OTP (6 digits)</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    className="font-mono text-lg tracking-widest text-center"
                  />
                </div>
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); setError(null); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link to="/supplier/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
