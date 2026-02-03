import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import SetNewPassword from './pages/SetNewPassword';
import Dashboard from './pages/Dashboard';
import SearchFlights from './pages/SearchFlights';
import BookFlight from './pages/BookFlight';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import AdminUsers from './pages/AdminUsers';
import AdminFlights from './pages/AdminFlights';
import AdminBookings from './pages/AdminBookings';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    auth.me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, u) => {
    if (token && typeof token === 'string') {
      localStorage.setItem('token', token.trim());
    }
    if (u) setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () => {
    return auth.me().then(setUser);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Loading Speed Airlines...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" replace />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchFlights />} />
            <Route path="book/:flightId" element={<BookFlight />} />
            <Route path="booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/flights" element={<AdminFlights />} />
            <Route path="admin/bookings" element={<AdminBookings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
