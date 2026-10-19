import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, checking, authError, retry, logout } = useAuth();
  if (checking) return <p className="container py-5" role="status">Checking your session...</p>;
  if (authError) return (
    <div className="container py-5">
      <p className="alert alert-danger" role="alert">{authError}</p>
      <button className="btn btn-primary me-2" onClick={retry}>Retry</button>
      <button className="btn btn-outline-secondary" onClick={logout}>Log out</button>
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
}
