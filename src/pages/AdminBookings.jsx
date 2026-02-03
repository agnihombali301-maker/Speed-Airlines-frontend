import { useState, useEffect } from 'react';
import { bookings as bookingsApi } from '../api';
import { admin } from '../api';
import './Admin.css';

export default function AdminBookings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.list().then((data) => setList(Array.isArray(data) ? data : [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking? Balance will be refunded.')) return;
    try {
      await admin.deleteBooking(id);
      setList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="app-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page app-container">
      <h1>Manage Bookings</h1>
      <div className="admin-table card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Flight</th>
              <th>Trip</th>
              <th>Class</th>
              <th>Passengers</th>
              <th>Amount (INR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.user_id}</td>
                <td>{b.flight?.flight_number} — {b.flight?.source} → {b.flight?.destination}</td>
                <td>{b.trip_type}</td>
                <td>{b.travel_class}</td>
                <td>{b.num_passengers}</td>
                <td>₹ {Number(b.total_amount).toLocaleString('en-IN')}</td>
                <td><span className={`status ${b.status}`}>{b.status}</span></td>
                <td>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
