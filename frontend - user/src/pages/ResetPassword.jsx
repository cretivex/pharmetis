import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/authApi.js';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('Invalid reset link.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword, confirmPassword);
      setMessage(res?.message || 'Password reset successful.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1 className="mb-1 font-display text-xl font-semibold text-slate-900">Reset password</h1>
          <p className="mb-6 text-sm text-slate-600">Set a new password for your account.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {message ? <div className="auth-alert-success"><p>{message}</p></div> : null}
            {error ? <div className="auth-alert-error"><p>{error}</p></div> : null}
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="auth-label">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
              />
            </div>
            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
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

export default ResetPassword;
