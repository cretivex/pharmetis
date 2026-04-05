import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { otpService } from '../services/otp.service.js'
import { loginUser, setUser } from '../store/authSlice.js'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
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
      await dispatch(loginUser({ email, password })).unwrap()
      const returnTo = location.state?.from
      if (
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//') &&
        returnTo !== '/login' &&
        returnTo !== '/register'
      ) {
        navigate(returnTo)
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Invalid email or password.'
      const hint =
        typeof err === 'object' &&
        err?.response?.status === 401 &&
        String(msg).toLowerCase().includes('invalid')
          ? ' If you signed up with OTP, use the OTP tab to sign in.'
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
      const user = await otpService.verifyOTP(email, otp)
      dispatch(setUser(user))
      const returnTo = location.state?.from
      if (
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//') &&
        returnTo !== '/login' &&
        returnTo !== '/register'
      ) {
        navigate(returnTo)
      } else {
        navigate('/')
      }
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

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-brand hidden lg:flex"
      >
        <div className="relative z-10">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <img
              src="/logo-pharmetis.svg"
              alt="Pharmetis"
              className="h-11 w-auto max-w-[280px] object-contain object-left sm:h-12"
            />
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="max-w-md font-display text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Source from verified pharmaceutical suppliers worldwide.
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            Sign in to manage RFQs, orders, and your company profile — one secure workspace.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">SOC-style login · Password or OTP</div>
      </motion.div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:hidden">
          <Link to="/" className="inline-block">
            <img
              src="/logo-pharmetis.svg"
              alt="Pharmetis"
              className="h-10 w-auto max-w-[260px] object-contain object-left"
            />
          </Link>
          <p className="mt-1 text-xs text-slate-500">Buyer workspace · Sign in</p>
        </div>

        <div className="auth-form-wrap">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="auth-card"
          >
            <h1 className="mb-1 font-display text-xl font-semibold text-slate-900">
              {isPassword ? 'Sign in' : isOtpStepEmail ? 'Sign in with OTP' : 'Enter code'}
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              {isPassword
                ? 'Use your work email and password.'
                : isOtpStepEmail
                  ? 'We will email you a one-time code.'
                  : `Code sent to ${email}`}
            </p>

            <div className="auth-pill-track mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password')
                  setError('')
                  setSuccess('')
                  setPassword('')
                }}
                className={`auth-pill-tab ${isPassword ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {isPassword && (
                  <motion.span
                    layoutId="login-pill"
                    className="auth-pill-active"
                    transition={{ type: 'spring', bounce: 0.22, duration: 0.42 }}
                  />
                )}
                <span className="relative px-3">Password</span>
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
                className={`auth-pill-tab ${!isPassword ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {!isPassword && (
                  <motion.span
                    layoutId="login-pill"
                    className="auth-pill-active"
                    transition={{ type: 'spring', bounce: 0.22, duration: 0.42 }}
                  />
                )}
                <span className="relative px-3">OTP</span>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-alert-error">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="login-email" className="auth-label">
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
                      className="auth-input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="auth-label">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-neutral-900 hover:text-neutral-600 transition-colors"
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
                        className="auth-input pr-12"
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
                  <button type="submit" disabled={isLoading} className="auth-primary-btn">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-alert-error">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp-email" className="auth-label">
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
                      className="auth-input"
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className="auth-primary-btn">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-alert-error">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-alert-success">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <p>{success}</p>
                    </motion.div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp-code" className="auth-label">
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
                      className="auth-input text-center text-xl font-semibold tracking-[0.3em] placeholder:tracking-[0.3em] placeholder:text-slate-400"
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
                      className="font-medium text-neutral-900 transition-colors hover:text-neutral-600 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="auth-primary-btn disabled:opacity-60"
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
              No account yet?{' '}
              <Link
                to="/register"
                state={location.state}
                className="font-semibold text-neutral-900 underline-offset-4 transition-colors hover:text-neutral-600 hover:underline"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
