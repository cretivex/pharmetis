import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { otpService } from '../services/otp.service.js'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

function Register() {
  const navigate = useNavigate()
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
      await otpService.verifyRegistrationOTP(
        formData.email,
        otp,
        formData.fullName || null,
        formData.companyName || null,
        formData.password || null
      )
      navigate('/')
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
  const inputBase =
    'w-full h-12 px-4 rounded-xl border border-blue-200 bg-white text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-60'

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
            Create an account to send RFQs, manage orders, and grow your business.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-500">
          Secure sign up · Email verification
        </div>
      </motion.div>

      {/* Right: Centered sign up card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50/80 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[420px] my-auto"
        >
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="text-lg font-semibold text-slate-800 tracking-tight">
              Pharmetis
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200/60">
            <h1 className="text-xl font-semibold text-slate-900 mb-1">
              {isEmailStep ? 'Create account' : 'Verify email'}
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              {isEmailStep
                ? 'Join Pharmetis as a buyer. We’ll send a verification code to your email.'
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
                    <label htmlFor="reg-email" className="text-sm font-medium text-slate-900">
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
                      className={inputBase}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-fullName" className="text-sm font-medium text-slate-900">
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
                      className={inputBase}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-company" className="text-sm font-medium text-slate-900">
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
                      className={inputBase}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-password" className="text-sm font-medium text-slate-900">
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
                        className={`${inputBase} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">At least 8 characters</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-900">
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
                        className={`${inputBase} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    <label htmlFor="reg-otp" className="text-sm font-medium text-slate-900">
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
                      className={`${inputBase} text-center text-xl font-semibold tracking-[0.3em] placeholder:tracking-[0.3em] placeholder:text-slate-600/60`}
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
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
