import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthBrandHeader, AuthShell } from '@/components/auth/AuthShell'
import { verifySupplierOTP, resendSupplierOTP } from '../services/auth.service.js'

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or query params
  const emailFromState = location.state?.email;
  const emailFromQuery = new URLSearchParams(location.search).get('email');
  const initialEmail = emailFromState || emailFromQuery || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    const firstInput = document.getElementById('otp-0');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifySupplierOTP(email, otpCode);
      
      if (result?.success) {
        setSuccess('Account verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/supplier/dashboard');
        }, 1500);
      } else {
        setSuccess('Account verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/supplier/login', { 
            state: { message: 'Account verified successfully. Please login.' } 
          });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) {
        firstInput.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!email) {
      setError('Email is required');
      return;
    }

    setResendLoading(true);
    setError(null);
    try {
      await resendSupplierOTP(email);
      setSuccess('OTP resent successfully. Please check your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthShell maxWidth="md">
      <div className="animate-fade-in">
        <AuthBrandHeader
          icon={ShieldCheck}
          title="Verify your email"
          subtitle={
            <>
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-foreground">{email || 'your inbox'}</span>
            </>
          }
        />

        <Card className="shadow-shell">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">One-time code</CardTitle>
            <CardDescription>For security, this code expires after a short time.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleVerify}>
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-success/25 bg-success/5 p-3 text-sm text-success">
                  {success}
                </div>
              )}

              {!email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
              )}

              <div>
                <Label className="mb-3 block">Enter code</Label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-14 w-11 rounded-xl border-2 border-input bg-background text-center text-xl font-semibold tabular-nums text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:h-14 sm:w-12 sm:text-2xl"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Verify & continue'
                )}
              </Button>

              <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendLoading
                    ? 'Sending…'
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/supplier/register')}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Back to registration
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  )
}

export default VerifyOTP;
