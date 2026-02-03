import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { auth } from '../api';
import './Auth.css';

export default function ChangePassword() {
  const { user } = useAuth();
  const [newPass, setNewPass] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    setIsResetMode(!!(token && urlParams.get('reset')));
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let body;
      if (isResetMode) {
        body = { new_password: newPass };
      } else if (isAdmin && targetUsername) {
        body = { new_password: newPass, target_username: targetUsername };
      } else {
        body = { new_password: newPass };
      }
      await auth.changePassword(body);
      setSuccess('Password updated successfully.');
      setNewPass('');
      setTargetUsername('');
      if (isResetMode) setTimeout(() => (window.location.href = '/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 className="auth-title">{isResetMode ? 'Set New Password' : 'Change Password'}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          {isAdmin && !isResetMode && (
            <div className="input-group">
              <label>Target username (leave blank to change your own)</label>
              <input type="text" value={targetUsername} onChange={(e) => setTargetUsername(e.target.value)} placeholder="Username" />
            </div>
          )}
          <div className="input-group">
            <label>New password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={4} placeholder="New password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
