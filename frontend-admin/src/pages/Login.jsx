import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requestOTP, verifyOTP } from '@/services/auth.service'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('cretivex4@gmail.com')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleRequestOTP = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await requestOTP(email)
      
      if (response.success) {
        setSuccess('OTP has been sent to your email (cretivex4@gmail.com)')
        setStep('otp')
        setResendCooldown(60) // 60 second cooldown
      } else {
        setError(response.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await verifyOTP(email, otp)
      
      if (response.success && response.data?.accessToken) {
        const userRole = response.data.user?.role?.toUpperCase()
        const adminPanelRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN']
        if (!adminPanelRoles.includes(userRole)) {
          setError(`Access denied. Admin panel access required. Current role: ${userRole || 'Unknown'}.`)
          setLoading(false)
          return
        }
        
        // Store tokens
        localStorage.setItem('adminToken', response.data.accessToken)
        if (response.data.refreshToken) {
          localStorage.setItem('adminRefreshToken', response.data.refreshToken)
        }
        
        // Store user info
        if (response.data.user) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.user))
        }
        
        navigate('/dashboard')
      } else {
        setError(response.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    await handleRequestOTP()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Pharmetis</h1>
            </div>
            <p className="text-xl text-slate-300 mb-2">RFQ Control Panel</p>
            <p className="text-slate-400">Manage your B2B pharmaceutical marketplace</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Secure OTP-based authentication</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Real-time RFQ management</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Advanced quotation comparison</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-border/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
              <CardDescription>
                {step === 'email' 
                  ? 'Enter your email to receive an OTP' 
                  : 'Enter the 6-digit OTP sent to your email'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="cretivex4@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      OTP will be sent to cretivex4@gmail.com
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setOtp(value)
                        }}
                        className="pl-10 text-center text-2xl tracking-widest font-mono"
                        maxLength={6}
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Check your email for the 6-digit code
                    </p>
                  </div>

                  {success && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep('email')
                        setOtp('')
                        setError('')
                        setSuccess('')
                      }}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 
                        ? `Resend OTP in ${resendCooldown}s` 
                        : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              <Separator className="my-6" />

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure OTP-based authentication</p>
                <p className="mt-1 text-xs">OTP expires in 5 minutes</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
