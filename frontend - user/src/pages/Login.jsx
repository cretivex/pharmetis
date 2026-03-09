import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { otpService } from '../services/otp.service.js'
import { authService } from '../services/auth.service.js'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

function Login() {
  const navigate = useNavigate()
  const [loginMethod, setLoginMethod] = useState('password')
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handlePasswordLogin = async (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      await authService.login(email, password)
      navigate('/buyer/dashboard')
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Invalid email or password.'
      const hint =
        err?.response?.status === 401 && String(msg).toLowerCase().includes('invalid')
          ? ' If you signed up with OTP, use the OTP tab or set a password in Settings → Security.'
          : ''
      setError(msg + hint)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      await otpService.sendOTP(email)
      setSuccess('OTP sent. Check your email.')
      setStep('otp')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1))
      }, 1000)
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Too many requests. Please wait a moment.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to send OTP.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      await otpService.verifyOTP(email, otp)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      await otpService.resendOTP(email)
      setSuccess('OTP resent. Check your email.')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1))
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
    setError('')
    setSuccess('')
    setCountdown(0)
  }

  const isPassword = loginMethod === 'password'
  const isOtpStepEmail = step === 'email'

  const inputBase =
    'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-60'

  return (
    <div className="min-h-screen flex">
      {/* Left: Dark gradient + brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(29,78,216,0.12),transparent)]" />
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center text-white font-semibold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            Pharmetis
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight max-w-md">
            Connect with verified pharmaceutical suppliers worldwide.
          </h2>
          <p className="text-slate-400 text-base max-w-sm">
            Sign in to manage RFQs, orders, and your company profile in one place.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
          Secure login · Password or OTP
        </div>
      </motion.div>

      {/* Right: Centered login card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50/80">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="text-lg font-semibold text-slate-800 tracking-tight">
              Pharmetis
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200/60">
            <h1 className="text-xl font-semibold text-slate-900 mb-1">
              {isPassword ? 'Sign in' : isOtpStepEmail ? 'Sign in with OTP' : 'Enter code'}
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              {isPassword
                ? 'Enter your email and password to continue.'
                : isOtpStepEmail
                  ? "We'll send a one-time code to your email."
                  : `Code sent to ${email}`}
            </p>

            {/* Pill tabs: Password | OTP */}
            <div className="flex p-1 rounded-full bg-slate-100 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setError('')
                  setSuccess('')
                  setPassword('')
                }}
                className={`relative flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors z-10 ${
                  isPassword ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isPassword && (
                  <motion.span
                    layoutId="login-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm border border-blue-200"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setError('')
                  setSuccess('')
                  setStep('email')
                  setOtp('')
                  setCountdown(0)
                }}
                className={`relative flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors z-10 ${
                  !isPassword ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {!isPassword && (
                  <motion.span
                    layoutId="login-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm border border-blue-200"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">OTP</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isPassword ? (
                <motion.form
                  key="password"
                  {...fadeUp}
                  onSubmit={(e) => {
                    e.preventDefault()
                    handlePasswordLogin(e)
                  }}
                  className="flex flex-col gap-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder="you@company.com"
                      required
                      disabled={isLoading}
                      className={inputBase}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:text-blue-700 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError('')
                        }}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className={`${inputBase} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl font-medium text-white bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-700 shadow-lg shadow-primary/25 hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </motion.form>
              ) : isOtpStepEmail ? (
                <motion.form
                  key="otp-email"
                  {...fadeUp}
                  onSubmit={handleSendOTP}
                  className="flex flex-col gap-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp-email" className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="otp-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder="you@company.com"
                      required
                      disabled={isLoading}
                      className={inputBase}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl font-medium text-white bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-700 shadow-lg shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Send code'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-verify"
                  {...fadeUp}
                  onSubmit={handleVerifyOTP}
                  className="flex flex-col gap-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{success}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp-code" className="text-sm font-medium text-slate-700">
                      Verification code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setOtp(v)
                        setError('')
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                      disabled={isLoading}
                      autoFocus
                      className={`${inputBase} text-center text-xl font-semibold tracking-[0.3em] placeholder:tracking-[0.3em] placeholder:text-slate-400`}
                    />
                    <p className="text-xs text-slate-500 text-center">
                      6-digit code sent to your email
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || countdown > 0}
                      className="text-primary hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="h-12 w-full rounded-xl font-medium text-white bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-700 shadow-lg shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      'Verify and sign in'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
