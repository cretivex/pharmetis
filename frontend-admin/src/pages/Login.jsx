import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Mail,
  AlertCircle,
  Loader2,
  KeyRound,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requestOTP, verifyOTP } from '@/services/auth.service'

const benefits = [
  { title: 'OTP-only access', desc: 'No shared passwords on the admin plane' },
  { title: 'RFQ operations', desc: 'Quotes, suppliers, and buyers in one place' },
  { title: 'Audit-ready', desc: 'Structured actions for compliance reviews' },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
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
        setSuccess(`We sent a code to ${email.trim()}`)
        setStep('otp')
        setResendCooldown(60)
      } else {
        setError(response.message || 'Could not send the code. Try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the code. Try again.')
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

      if (response.success && response.data?.user) {
        const userRole = response.data.user?.role?.toUpperCase()
        const adminPanelRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN']
        if (!adminPanelRoles.includes(userRole)) {
          setError(`Access denied. Admin role required (current: ${userRole || 'unknown'}).`)
          setLoading(false)
          return
        }

        navigate('/dashboard')
      } else {
        setError(response.message || 'Invalid code. Try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    await handleRequestOTP()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.35]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col lg:flex-row">
        {/* Brand — full width on mobile, half on large */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-center border-b border-border/40 px-6 py-10 sm:px-10 lg:w-1/2 lg:border-b-0 lg:border-r lg:py-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-violet-600/[0.06] lg:rounded-r-3xl" />
          <div className="relative mx-auto max-w-md lg:mx-0">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-glow ring-1 ring-primary/30">
                <ShieldCheck className="h-7 w-7 text-primary-foreground" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">Pharmetis</p>
                <p className="text-sm text-muted-foreground">Admin control panel</p>
              </div>
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Run RFQs with clarity and control
            </h1>
            <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              Sign in with a one-time code. Built for operators who need speed without sacrificing
              governance.
            </p>
            <ul className="mt-10 space-y-4">
              {benefits.map((b, i) => (
                <motion.li
                  key={b.title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.35 }}
                  className="flex gap-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[420px]"
          >
            <Card className="border-border/50 bg-card/90 shadow-shell ring-1 ring-border/40 backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Secure access
                </div>
                <CardTitle>{step === 'email' ? 'Sign in' : 'Enter verification code'}</CardTitle>
                <CardDescription>
                  {step === 'email'
                    ? 'Use your admin email — we’ll email a 6-digit code.'
                    : `Code sent to ${email.trim() || 'your inbox'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 'email' ? (
                  <form onSubmit={handleRequestOTP} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work email</Label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only approved admin roles can access this workspace.
                      </p>
                    </div>

                    {error ? (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{error}</span>
                      </div>
                    ) : null}

                    <Button type="submit" className="group w-full gap-2" disabled={loading || !email.trim()}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending code…
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="otp">6-digit code</Label>
                      <div className="relative">
                        <KeyRound
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setOtp(value)
                          }}
                          className="pl-11 text-center font-mono text-2xl tracking-[0.35em]"
                          maxLength={6}
                          required
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        Check spam folders. Code expires in a few minutes.
                      </p>
                    </div>

                    {success ? (
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{success}</span>
                      </div>
                    ) : null}

                    {error ? (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>{error}</span>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:flex-1"
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
                      <Button type="submit" className="w-full sm:flex-1" disabled={loading || otp.length !== 6}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying…
                          </>
                        ) : (
                          'Verify & enter'
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0 || loading}
                        className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                    </div>
                  </form>
                )}

                <Separator className="my-8 bg-border/60" />

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  By continuing you agree to internal access policies. Need help? Contact your platform
                  owner.
                </p>
                <p className="mt-3 text-center text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
