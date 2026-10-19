import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="card auth-card mx-auto shadow-sm">
        <div className="card-body p-4">
          <h1 className="h3">Expense Tracker</h1>
          <p className="text-secondary">Log in to manage your expenses.</p>
          {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" className="form-control mb-3" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" maxLength={254} required />
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" className="form-control mb-3" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required />
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <p className="mt-3 mb-0">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </main>
  );
}
