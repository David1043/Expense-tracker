import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'];
function emptyForm() {
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { title: '', amount: '', category: 'Food', date: localDate, note: '' };
}
function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadExpenses() {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/expenses', 'GET', null, token);
        if (active) setExpenses(data);
      } catch (error) {
        if (!active) return;
        if (error.status === 401) {
          logout();
          navigate('/login', { replace: true, state: { message: 'Please log in again.' } });
        } else {
          setError(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadExpenses();
    return () => { active = false; };
  }, [token, reload]);

  function handleError(error) {
    if (error.status === 401) {
      logout();
      navigate('/login', { replace: true, state: { message: 'Session expired. Please log in again.' } });
    } else {
      setError(error.message);
    }
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = { ...form, amount: Number(form.amount) };
      const path = editingId ? `/expenses/${editingId}` : '/expenses';
      const saved = await apiRequest(path, editingId ? 'PUT' : 'POST', body, token);
      setExpenses(current => {
        const updated = editingId ? current.map(item => item._id === editingId ? saved : item) : [saved, ...current];
        return updated.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
      });
      setSuccess(editingId ? 'Expense updated.' : 'Expense added.');
      resetForm();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(expense) {
    setEditingId(expense._id);
    setForm({ title: expense.title, amount: String(expense.amount), category: expense.category, date: expense.date.slice(0, 10), note: expense.note || '' });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteExpense(id) {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/expenses/${id}`, 'DELETE', null, token);
      setExpenses(current => current.filter(item => item._id !== id));
      if (editingId === id) resetForm();
      setSuccess('Expense deleted.');
    } catch (error) {
      handleError(error);
    } finally {
      setDeletingId('');
    }
  }

  const visibleExpenses = filter === 'All' ? expenses : expenses.filter(item => item.category === filter);
  const total = expenses.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100;
  const filteredTotal = visibleExpenses.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100;
  const busy = saving || Boolean(deletingId) || loading;

  return (
    <>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container gap-2">
          <span className="navbar-brand mb-0">Expense Tracker</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">Hi, {user?.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        {error && <div className="alert alert-danger" role="alert">{error} <button className="btn btn-sm btn-outline-danger ms-2" disabled={busy} onClick={() => setReload(value => value + 1)}>Reload expenses</button></div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <p className="text-secondary mb-1">Total spent · all categories</p>
            <h1 className="h2 mb-1">{loading ? 'Loading...' : money(total)}</h1>
            <small className="text-secondary">{expenses.length} expense(s) · All time · INR</small>
          </div>
        </div>
        <div className="row g-4">
          <section className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">{editingId ? 'Edit expense' : 'Add expense'}</h2>
                <form onSubmit={handleSubmit}>
                  <fieldset disabled={busy}>
                    <label htmlFor="title" className="form-label">Title</label>
                    <input id="title" className="form-control mb-3" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} maxLength={100} placeholder="Lunch" required />
                    <label htmlFor="amount" className="form-label">Amount (INR)</label>
                    <input id="amount" className="form-control mb-3" type="number" min="0.01" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="250.00" required />
                    <label htmlFor="category" className="form-label">Category</label>
                    <select id="category" className="form-select mb-3" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>
                      {categories.map(category => <option key={category}>{category}</option>)}
                    </select>
                    <label htmlFor="date" className="form-label">Date</label>
                    <input id="date" className="form-control mb-3" type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required />
                    <label htmlFor="note" className="form-label">Note (optional)</label>
                    <textarea id="note" className="form-control mb-3" rows={3} maxLength={500} value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} />
                    <button className="btn btn-primary" type="submit">{saving ? 'Saving...' : editingId ? 'Update expense' : 'Add expense'}</button>
                    {editingId && <button className="btn btn-outline-secondary ms-2" type="button" onClick={resetForm}>Cancel</button>}
                  </fieldset>
                </form>
              </div>
            </div>
          </section>
          <section className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                  <h2 className="h5 mb-0">Your expenses</h2>
                  <div>
                    <label htmlFor="filter" className="form-label small mb-1">Filter by category</label>
                    <select id="filter" className="form-select form-select-sm" value={filter} onChange={event => setFilter(event.target.value)}>
                      <option>All</option>
                      {categories.map(category => <option key={category}>{category}</option>)}
                    </select>
                  </div>
                </div>
                {loading ? <p role="status">Loading expenses...</p> : (
                  <>
                    <p className="small text-secondary">Showing {visibleExpenses.length} expense(s) · Subtotal: {money(filteredTotal)}</p>
                    {visibleExpenses.length === 0 ? <p className="text-secondary">No expenses found. Add one or change the filter.</p> : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead><tr><th>Date</th><th>Title / Note</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead>
                          <tbody>
                            {visibleExpenses.map(expense => (
                              <tr key={expense._id}>
                                <td className="text-nowrap">{expense.date.slice(0, 10)}</td>
                                <td className="expense-text">{expense.title}{expense.note && <small className="d-block text-secondary note">{expense.note}</small>}</td>
                                <td>{expense.category}</td>
                                <td className="text-nowrap">{money(expense.amount)}</td>
                                <td><div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => startEdit(expense)}>Edit</button>
                                  <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => deleteExpense(expense._id)}>{deletingId === expense._id ? 'Deleting...' : 'Delete'}</button>
                                </div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
