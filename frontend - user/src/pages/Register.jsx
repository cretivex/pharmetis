import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { otpService } from '../services/otp.service.js'
import { setUser } from '../store/authSlice.js'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState('email')
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const validatePasswordStep = () => {
    if (!formData.password.trim()) {
      setError('Password is required.')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }
    if (!confirmPassword.trim()) {
      setError('Please confirm your password.')
      return false
    }
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!validatePasswordStep()) return
    setIsLoading(true)
    try {
      await otpService.sendRegistrationOTP(
        formData.email,
        formData.fullName || null,
        formData.companyName || null
      )
      setSuccess('Verification code sent. Check your email.')
      setStep('otp')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1))
      }, 1000)
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Too many requests. Please wait a moment.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to send code.')
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
      const user = await otpService.verifyRegistrationOTP(
        formData.email,
        otp,
        formData.fullName || null,
        formData.companyName || null,
        formData.password || null
      )
      dispatch(setUser(user))
      const returnTo = location.state?.from
      if (
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//') &&
        returnTo !== '/login' &&
        returnTo !== '/register'
      ) {
        const sep = returnTo.includes('?') ? '&' : '?'
        navigate(`${returnTo}${sep}welcome=1`, { replace: true })
      } else {
        navigate('/?welcome=1', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid code. Please try again.')
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
      await otpService.resendRegistrationOTP(formData.email)
      setSuccess('Code resent. Check your email.')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1))
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend.')
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
    setConfirmPassword('')
  }

  const isEmailStep = step === 'email'

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
            Join buyers sourcing certified suppliers globally.
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            Create your workspace to send RFQs, compare quotes, and keep procurement compliant.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">Verified email · Secure onboarding</div>
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
          <p className="mt-1 text-xs text-slate-500">Buyer registration</p>
        </div>

        <div className="auth-form-wrap">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="auth-card"
          >
            <h1 className="mb-1 font-display text-xl font-semibold text-slate-900">
              {isEmailStep ? 'Create account' : 'Verify email'}
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              {isEmailStep
                ? 'Join as a buyer. We will send a verification code to your email.'
                : `Code sent to ${formData.email}`}
            </p>

            <AnimatePresence mode="wait">
              {isEmailStep ? (
                <motion.form
                  key="email"
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
                    <label htmlFor="reg-email" className="auth-label">
                      Email *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setError('')
                      }}
                      placeholder="you@company.com"
                      required
                      disabled={isLoading}
                      className="auth-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-fullName" className="auth-label">
                      Full name <span className="text-slate-600 font-normal">(optional)</span>
                    </label>
                    <input
                      id="reg-fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value })
                        setError('')
                      }}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="auth-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-company" className="auth-label">
                      Company name <span className="text-slate-600 font-normal">(optional)</span>
                    </label>
                    <input
                      id="reg-company"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => {
                        setFormData({ ...formData, companyName: e.target.value })
                        setError('')
                      }}
                      placeholder="Your Company"
                      disabled={isLoading}
                      className="auth-input"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-password" className="auth-label">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value })
                          setError('')
                        }}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        minLength={8}
                        className="auth-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">At least 8 characters</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-confirm" className="auth-label">
                      Confirm password *
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setError('')
                        }}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="auth-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="auth-primary-btn">
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending code…
                      </>
                    ) : (
                      'Send verification code'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
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
                    <label htmlFor="reg-otp" className="auth-label">
                      Verification code
                    </label>
                    <input
                      id="reg-otp"
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
                    <p className="text-xs text-slate-600 text-center">
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
                        Creating account…
                      </>
                    ) : (
                      'Verify & create account'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-semibold text-neutral-900 underline-offset-4 transition-colors hover:text-neutral-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
