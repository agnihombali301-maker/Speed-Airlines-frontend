import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { flights as flightsApi } from '../api';
import './SearchFlights.css';

export default function SearchFlights() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState({ sources: [], destinations: [] });

  useEffect(() => {
    flightsApi.destinations().then(setDestinations).catch(() => {});
  }, []);

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (source) params.source = source;
      if (destination) params.destination = destination;
      if (date) params.date = date;
      const data = await flightsApi.list(params);
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  };

  return (
    <div className="search-flights app-container">
      <h1>Search Flights</h1>
      <form onSubmit={search} className="search-form card">
        <div className="search-row">
          <div className="input-group">
            <label>From</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="City or airport"
              list="sources"
            />
            <datalist id="sources">
              {destinations.sources.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="input-group">
            <label>To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City or airport"
              list="dests"
            />
            <datalist id="dests">
              {destinations.destinations.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div className="input-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      <div className="results">
        {loading && <p>Loading...</p>}
        {!loading && list.length === 0 && (source || destination || date) && <p>No flights found.</p>}
        {!loading && list.length > 0 && (
          <div className="flight-list">
            {list.map((f) => (
              <div key={f.id} className="flight-card card">
                <div className="flight-header">
                  <span className="flight-number">{f.flight_number}</span>
                  <span className="flight-route">{f.source} → {f.destination}</span>
                </div>
                <div className="flight-times">
                  <span>{formatTime(f.departure_time)}</span>
                  <span>{formatTime(f.arrival_time)}</span>
                </div>
                <div className="flight-prices">
                  <span>Economy: ₹{Number(f.economy_price).toLocaleString('en-IN')}</span>
                  <span>Business: ₹{Number(f.business_price).toLocaleString('en-IN')}</span>
                </div>
                <div className="flight-seats">
                  Economy seats: {f.economy_seats} | Business seats: {f.business_seats}
                </div>
                <Link to={`/book/${f.id}`} className="btn btn-primary">Book</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
