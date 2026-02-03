import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, getToken } from '../api';
import './Auth.css';

/**
 * Standalone "Set New Password" page after forgot-password verification.
 * Does not require Layout/auth context — uses token from localStorage.
 */
export default function SetNewPassword() {
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }
    if (newPass.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    try {
      await auth.changePassword({ new_password: newPass });
      setSuccess(true);
      setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p style={{ color: 'var(--text-muted)' }}>Checking...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <label>New password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              minLength={4}
              placeholder="New password"
            />
          </div>
          <div className="input-group">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              minLength={4}
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
