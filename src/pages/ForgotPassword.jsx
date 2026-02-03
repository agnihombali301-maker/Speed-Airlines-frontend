import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../App';
import './Auth.css';

export default function ForgotPassword() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState(null);
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    const u = (username || '').trim();
    if (!u) return;
    setError('');
    try {
      const { questions: q } = await auth.forgotPasswordQuestions(u);
      setQuestions(Array.isArray(q) && q.length === 3 ? q : null);
    } catch (_) {
      setQuestions(null);
      setError('User not found. Please check the username.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await auth.forgotPassword({ username, a1, a2, a3 });
      if (token) {
        login(token, user);
        setSuccess(true);
        setTimeout(() => navigate('/set-new-password', { replace: true }), 1500);
      } else {
        setError('Verification succeeded but no token received.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Answers verified</h1>
          <p>Redirecting to set your new password...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Answer your 3 security questions to recover access</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setQuestions(null); setError(''); }}
              onBlur={fetchQuestions}
              required
              placeholder="Your username"
            />
            <p className="hint" style={{ marginTop: 4 }}>Enter your username and move to the next field to load your security questions.</p>
          </div>
          <div className="input-group">
            <label>{questions ? questions[0] : 'Answer to Question 1'}</label>
            <input type="text" value={a1} onChange={(e) => setA1(e.target.value)} required placeholder="Your answer" />
          </div>
          <div className="input-group">
            <label>{questions ? questions[1] : 'Answer to Question 2'}</label>
            <input type="text" value={a2} onChange={(e) => setA2(e.target.value)} required placeholder="Your answer" />
          </div>
          <div className="input-group">
            <label>{questions ? questions[2] : 'Answer to Question 3'}</label>
            <input type="text" value={a3} onChange={(e) => setA3(e.target.value)} required placeholder="Your answer" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Recover'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
