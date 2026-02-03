import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookings as bookingsApi } from '../api';
import './MyBookings.css';

export default function MyBookings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.list().then((data) => setList(Array.isArray(data) ? data : [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-container"><p>Loading bookings...</p></div>;

  return (
    <div className="my-bookings app-container">
      <h1>My Bookings</h1>
      {list.length === 0 && <p className="empty">No bookings yet. <Link to="/search">Search flights</Link> to book.</p>}
      <div className="booking-list">
        {list.map((b) => {
          const f = b.flight || {};
          return (
            <div key={b.id} className="booking-card card">
              <div className="booking-card-header">
                <span className="booking-id">#{b.id}</span>
                <span className={`status ${b.status}`}>{b.status}</span>
              </div>
              <div className="booking-card-body">
                <p><strong>{f.flight_number}</strong> — {f.source} → {f.destination}</p>
                <p>{b.trip_type} • {b.travel_class} • {b.num_passengers} passenger(s)</p>
                <p>Depart: {b.date_depart} {b.date_return && `• Return: ${b.date_return}`}</p>
                <p className="amount">₹ {Number(b.total_amount).toLocaleString('en-IN')}</p>
              </div>
              <Link to={`/booking-confirmation/${b.id}`} className="btn btn-outline btn-sm">View details</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
