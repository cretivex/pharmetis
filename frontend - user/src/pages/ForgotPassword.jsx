import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi.js';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword(email);
      setMessage(res?.message || 'If this email exists, a reset link has been sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1 className="mb-1 font-display text-xl font-semibold text-slate-900">Forgot password</h1>
          <p className="mb-6 text-sm text-slate-600">Enter your email to receive a password reset link.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {message ? <div className="auth-alert-success"><p>{message}</p></div> : null}
            {error ? <div className="auth-alert-error"><p>{error}</p></div> : null}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@company.com"
              />
            </div>
            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-neutral-900 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
