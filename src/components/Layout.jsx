import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="layout">
      <header className="header">
        <NavLink to="/" className="logo">
          <span className="logo-icon">✈</span> Speed Airlines
        </NavLink>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          {!isAdmin && (
            <>
              <NavLink to="/search">Search Flights</NavLink>
              <NavLink to="/my-bookings">My Bookings</NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/flights">Flights</NavLink>
              <NavLink to="/admin/bookings">Bookings</NavLink>
            </>
          )}
          <NavLink to="/change-password">Change Password</NavLink>
          <span className="user-info">
            {user.role === 'customer' && (
              <strong>₹ {(user.balance ?? 0).toLocaleString('en-IN')}</strong>
            )}
            <span className="username">{user.username}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </span>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
