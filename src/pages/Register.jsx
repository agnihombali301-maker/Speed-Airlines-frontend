import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../App';
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    auth.questions().then((r) => setQuestions(r.questions || [])).catch(() => setQuestions([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await auth.register({
        username,
        password,
        q1: String(questions.indexOf(q1)),
        q2: String(questions.indexOf(q2)),
        q3: String(questions.indexOf(q3)),
        a1, a2, a3,
      });
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">Create Customer Account</h1>
        <p className="auth-subtitle">You will receive ₹1,00,00,000 in your account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Choose username" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Choose password" minLength={4} />
          </div>
          <h3 style={{ margin: '16px 0 8px', color: 'var(--text)' }}>Security questions (for password recovery)</h3>
          <div className="input-group">
            <label>Question 1</label>
            <select value={q1} onChange={(e) => setQ1(e.target.value)} required>
              <option value="">Select question</option>
              {questions.map((q, i) => <option key={i} value={q}>{q}</option>)}
            </select>
            <input type="text" value={a1} onChange={(e) => setA1(e.target.value)} required placeholder="Your answer" style={{ marginTop: 8 }} />
          </div>
          <div className="input-group">
            <label>Question 2</label>
            <select value={q2} onChange={(e) => setQ2(e.target.value)} required>
              <option value="">Select question</option>
              {questions.map((q, i) => <option key={i} value={q}>{q}</option>)}
            </select>
            <input type="text" value={a2} onChange={(e) => setA2(e.target.value)} required placeholder="Your answer" style={{ marginTop: 8 }} />
          </div>
          <div className="input-group">
            <label>Question 3</label>
            <select value={q3} onChange={(e) => setQ3(e.target.value)} required>
              <option value="">Select question</option>
              {questions.map((q, i) => <option key={i} value={q}>{q}</option>)}
            </select>
            <input type="text" value={a3} onChange={(e) => setA3(e.target.value)} required placeholder="Your answer" style={{ marginTop: 8 }} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
