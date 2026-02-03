import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, flights as flightsApi, bookings as bookingsApi } from '../api';
import { useAuth } from '../App';
import './BookFlight.css';

const SEAT_ROWS = 10;
const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function BookFlight() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [flight, setFlight] = useState(null);
  const [tripType, setTripType] = useState('one_way');
  const [travelClass, setTravelClass] = useState('economy');
  const [numPassengers, setNumPassengers] = useState(1);
  const [dateDepart, setDateDepart] = useState('');
  const [dateReturn, setDateReturn] = useState('');
  const [seats, setSeats] = useState([]);
  const [mealPreference, setMealPreference] = useState('veg');
  const [extraBaggage, setExtraBaggage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    flightsApi.get(Number(flightId)).then((f) => { if (!cancelled) setFlight(f); }).catch(() => { if (!cancelled) setFlight(null); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [flightId]);

  // Do NOT validate token on page load - that was causing immediate redirect to login.
  // We only validate when user clicks "Pay & Confirm" in handleSubmit.

  const toggleSeat = (seat) => {
    setSeats((prev) => {
      const has = prev.includes(seat);
      if (has) return prev.filter((s) => s !== seat);
      if (prev.length >= numPassengers) return prev;
      return [...prev, seat];
    });
  };

  const basePrice = flight
    ? (travelClass === 'economy' ? flight.economy_price : flight.business_price) * numPassengers
    : 0;
  const mealCharge = 500 * numPassengers;
  const baggageCharge = 300 * extraBaggage;
  let total = basePrice + mealCharge + baggageCharge;
  if (tripType === 'return') total *= 2;

  const redirectToLogin = () => {
    sessionStorage.setItem('redirectAfterLogin', `/book/${flightId}`);
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!localStorage.getItem('token')) {
      redirectToLogin();
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        flight_id: Number(flightId),
        trip_type: tripType,
        travel_class: travelClass,
        num_passengers: numPassengers,
        date_depart: dateDepart,
        date_return: tripType === 'return' ? dateReturn : undefined,
        seats: seats.length ? seats : Array.from({ length: numPassengers }, (_, i) => `${i + 1}A`),
        meal_preference: mealPreference,
        extra_baggage_kg: extraBaggage,
      };
      const { booking } = await bookingsApi.create(payload);
      navigate(`/booking-confirmation/${booking.id}`);
    } catch (err) {
      const msg = err.message || 'Booking failed';
      setError(msg);
      if (msg.includes('sign in') || msg.includes('token') || msg.includes('session') || msg.includes('Authorization')) {
        redirectToLogin();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="app-container"><p>Loading flight...</p></div>;
  if (!flight) return <div className="app-container"><p>Flight not found.</p></div>;

  const balance = user?.balance ?? 0;
  const canPay = balance >= total;

  const allSeats = [];
  for (let r = 1; r <= SEAT_ROWS; r++) {
    for (const c of SEAT_COLS) {
      allSeats.push(`${r}${c}`);
    }
  }

  return (
    <div className="book-flight app-container">
      <h1>Book: {flight.flight_number} — {flight.source} to {flight.destination}</h1>
      <div className="balance-bar card">
        Your balance: <strong>₹ {balance.toLocaleString('en-IN')}</strong>
        {total > 0 && (
          <span className={canPay ? 'ok' : 'insufficient'}>
            Total: ₹ {total.toLocaleString('en-IN')} {canPay ? '✓' : '(insufficient)'}
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="book-form">
        <div className="card">
          <h2>Trip & Class</h2>
          <div className="input-group">
            <label>Trip type</label>
            <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
              <option value="one_way">One way</option>
              <option value="return">Return</option>
            </select>
          </div>
          <div className="input-group">
            <label>Travel class</label>
            <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="input-group">
            <label>Number of passengers</label>
            <input type="number" min={1} max={9} value={numPassengers} onChange={(e) => setNumPassengers(Number(e.target.value))} />
          </div>
          <div className="input-group">
            <label>Date of travel</label>
            <input type="date" value={dateDepart} onChange={(e) => setDateDepart(e.target.value)} required />
          </div>
          {tripType === 'return' && (
            <div className="input-group">
              <label>Date of return</label>
              <input type="date" value={dateReturn} onChange={(e) => setDateReturn(e.target.value)} required={tripType === 'return'} />
            </div>
          )}
        </div>
        <div className="card">
          <h2>Seat selection</h2>
          <p className="hint">Select up to {numPassengers} seat(s). Click to toggle.</p>
          <div className="seat-map">
            {allSeats.map((seat) => (
              <button
                key={seat}
                type="button"
                className={`seat ${seats.includes(seat) ? 'selected' : ''}`}
                onClick={() => toggleSeat(seat)}
              >
                {seat}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Meals & baggage</h2>
          <div className="input-group">
            <label>Meal preference</label>
            <select value={mealPreference} onChange={(e) => setMealPreference(e.target.value)}>
              <option value="veg">Vegetarian (₹500/passenger)</option>
              <option value="non_veg">Non-Vegetarian (₹500/passenger)</option>
            </select>
          </div>
          <div className="input-group">
            <label>Extra baggage (kg)</label>
            <input type="number" min={0} max={50} value={extraBaggage} onChange={(e) => setExtraBaggage(Number(e.target.value))} />
            <span className="hint">₹300 per kg</span>
          </div>
        </div>
        {error && (
          <div className="auth-error">
            {error}
            {(error.includes('session') || error.includes('expired') || error.includes('sign in') || error.includes('token')) && (
              <div style={{ marginTop: 12 }}>
                <button type="button" className="btn btn-primary" onClick={redirectToLogin}>
                  Sign in again
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          className={`btn btn-primary btn-lg ${(submitting || !dateDepart || (tripType === 'return' && !dateReturn) || !canPay) ? 'btn-disabled' : ''}`}
          disabled={submitting || !dateDepart || (tripType === 'return' && !dateReturn) || !canPay}
        >
          {submitting ? 'Processing...' : `Pay ₹ ${total.toLocaleString('en-IN')} & Confirm Booking`}
        </button>
        {!submitting && (!dateDepart || (tripType === 'return' && !dateReturn)) && (
          <p className="hint" style={{ marginTop: 8 }}>Select date of travel{tripType === 'return' ? ' and return date' : ''} to enable the button.</p>
        )}
        {!submitting && dateDepart && (tripType !== 'return' || dateReturn) && !canPay && (
          <p className="hint" style={{ marginTop: 8, color: 'var(--danger)' }}>Insufficient balance. You need ₹ {total.toLocaleString('en-IN')}.</p>
        )}
      </form>
    </div>
  );
}
