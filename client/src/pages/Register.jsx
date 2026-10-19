import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/register', 'POST', form);
      navigate('/login', { replace: true, state: { message: 'Account created! Please log in.' } });
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
          <h1 className="h3">Create an account</h1>
          <p className="text-secondary">Start tracking your daily expenses.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="name" className="form-label">Name</label>
            <input id="name" className="form-control mb-3" name="name" value={form.name} onChange={handleChange} autoComplete="name" maxLength={80} required />
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" className="form-control mb-3" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" maxLength={254} required />
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" className="form-control" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" minLength={8} maxLength={72} required />
            <p className="form-text">At least 8 characters; maximum 72 UTF-8 bytes.</p>
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
          </form>
          <p className="mt-3 mb-0">Already registered? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </main>
  );
}
