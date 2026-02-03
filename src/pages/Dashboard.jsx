import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard app-container">
      <div className="hero">
        <h1>Welcome to Speed Airlines</h1>
        <p className="hero-sub">Fly to destinations worldwide. All prices in INR.</p>
      </div>
      {!isAdmin && (
        <div className="dashboard-cards">
          <div className="balance-card card">
            <h2>Your Balance</h2>
            <p className="balance-amount">₹ {(user?.balance ?? 0).toLocaleString('en-IN')}</p>
            <p className="balance-note">Use this balance to book flights (demo currency)</p>
          </div>
          <Link to="/search" className="action-card card">
            <span className="action-icon">✈</span>
            <h2>Search & Book Flights</h2>
            <p>Choose source, destination, class and dates. One-way or return.</p>
          </Link>
          <Link to="/my-bookings" className="action-card card">
            <span className="action-icon">📋</span>
            <h2>My Bookings</h2>
            <p>View and manage your flight bookings.</p>
          </Link>
        </div>
      )}
      {isAdmin && (
        <div className="dashboard-cards">
          <Link to="/admin/users" className="action-card card">
            <span className="action-icon">👥</span>
            <h2>Manage Users</h2>
            <p>View and edit customers and balances.</p>
          </Link>
          <Link to="/admin/flights" className="action-card card">
            <span className="action-icon">✈</span>
            <h2>Manage Flights</h2>
            <p>Add, edit or remove flights.</p>
          </Link>
          <Link to="/admin/bookings" className="action-card card">
            <span className="action-icon">📋</span>
            <h2>Manage Bookings</h2>
            <p>View and manage all bookings.</p>
          </Link>
        </div>
      )}
    </div>
  );
}
