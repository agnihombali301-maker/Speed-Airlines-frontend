import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bookings as bookingsApi } from '../api';
import { useAuth } from '../App';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const { refreshUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.get(Number(bookingId)).then((b) => { setBooking(b); refreshUser(); }).catch(() => setBooking(null)).finally(() => setLoading(false));
  }, [bookingId, refreshUser]);

  if (loading) return <div className="app-container"><p>Loading...</p></div>;
  if (!booking) return <div className="app-container"><p>Booking not found.</p></div>;

  const f = booking.flight || {};

  return (
    <div className="booking-confirmation app-container">
      <div className="confirmation-card card">
        <div className="confirmation-header">
          <span className="confirmation-icon">✓</span>
          <h1>Booking Confirmed</h1>
          <p>Thank you for flying with Speed Airlines</p>
        </div>
        <div className="confirmation-details">
          <div className="detail-row">
            <span>Booking ID</span>
            <strong>#{booking.id}</strong>
          </div>
          <div className="detail-row">
            <span>Flight</span>
            <strong>{f.flight_number} — {f.source} → {f.destination}</strong>
          </div>
          <div className="detail-row">
            <span>Trip</span>
            <strong>{booking.trip_type === 'return' ? 'Return' : 'One way'}</strong>
          </div>
          <div className="detail-row">
            <span>Class</span>
            <strong>{booking.travel_class}</strong>
          </div>
          <div className="detail-row">
            <span>Passengers</span>
            <strong>{booking.num_passengers}</strong>
          </div>
          <div className="detail-row">
            <span>Departure date</span>
            <strong>{booking.date_depart}</strong>
          </div>
          {booking.date_return && (
            <div className="detail-row">
              <span>Return date</span>
              <strong>{booking.date_return}</strong>
            </div>
          )}
          <div className="detail-row">
            <span>Meals</span>
            <strong>{booking.meal_preference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</strong>
          </div>
          <div className="detail-row">
            <span>Extra baggage</span>
            <strong>{booking.extra_baggage_kg} kg</strong>
          </div>
          <div className="detail-row total">
            <span>Amount paid</span>
            <strong>₹ {Number(booking.total_amount).toLocaleString('en-IN')}</strong>
          </div>
        </div>
        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn btn-primary">My Bookings</Link>
          <Link to="/search" className="btn btn-outline">Book another flight</Link>
        </div>
      </div>
    </div>
  );
}
