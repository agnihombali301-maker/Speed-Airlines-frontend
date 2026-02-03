import { useState, useEffect } from 'react';
import { flights as flightsApi, admin } from '../api';
import './Admin.css';

export default function AdminFlights() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    flight_number: '', source: '', destination: '',
    departure_time: '', arrival_time: '',
    economy_price: 5000, business_price: 12000,
    economy_seats: 60, business_seats: 20,
  });

  const load = () => {
    flightsApi.list().then((data) => setList(Array.isArray(data) ? data : [])).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const dep = new Date(form.departure_time);
      const arr = new Date(form.arrival_time);
      await admin.createFlight({
        ...form,
        departure_time: dep.toISOString(),
        arrival_time: arr.toISOString(),
      });
      setShowForm(false);
      setForm({ flight_number: '', source: '', destination: '', departure_time: '', arrival_time: '', economy_price: 5000, business_price: 12000, economy_seats: 60, business_seats: 20 });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this flight?')) return;
    try {
      await admin.deleteFlight(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="app-container"><p>Loading...</p></div>;

  return (
    <div className="admin-page app-container">
      <h1>Manage Flights</h1>
      <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Flight'}
      </button>
      {showForm && (
        <form onSubmit={handleCreate} className="card admin-form">
          <h2>New flight</h2>
          <div className="form-row">
            <div className="input-group">
              <label>Flight number</label>
              <input value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Source</label>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Destination</label>
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Departure (datetime)</label>
              <input type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Arrival (datetime)</label>
              <input type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Economy price (INR)</label>
              <input type="number" value={form.economy_price} onChange={(e) => setForm({ ...form, economy_price: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Business price (INR)</label>
              <input type="number" value={form.business_price} onChange={(e) => setForm({ ...form, business_price: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Economy seats</label>
              <input type="number" value={form.economy_seats} onChange={(e) => setForm({ ...form, economy_seats: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Business seats</label>
              <input type="number" value={form.business_seats} onChange={(e) => setForm({ ...form, business_seats: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create flight</button>
        </form>
      )}
      <div className="admin-table card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Flight #</th>
              <th>Route</th>
              <th>Economy</th>
              <th>Business</th>
              <th>Seats (E/B)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.flight_number}</td>
                <td>{f.source} → {f.destination}</td>
                <td>₹{Number(f.economy_price).toLocaleString('en-IN')}</td>
                <td>₹{Number(f.business_price).toLocaleString('en-IN')}</td>
                <td>{f.economy_seats} / {f.business_seats}</td>
                <td>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(f.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
