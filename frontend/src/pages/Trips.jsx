import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import TripCard from '../components/TripCard';
import { Plus, X, Calendar, MapPin } from 'lucide-react';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [destinationId, setDestinationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTripsAndDestinations();
  }, []);

  const fetchTripsAndDestinations = async () => {
    try {
      const [tripsData, destinationsData] = await Promise.all([
        api.get('/trips'),
        api.get('/destinations'),
      ]);
      setTrips(tripsData);
      setDestinations(destinationsData);
      if (destinationsData.length > 0) {
        setDestinationId(destinationsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip plan?')) {
      try {
        await api.delete(`/trips?id=${id}`);
        setTrips(trips.filter(t => t.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete trip.');
      }
    }
  };

  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!destinationId || !startDate || !endDate || !budget) {
      setFormError('Please fill in all form fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Departure date must be before Return date.');
      return;
    }

    if (parseFloat(budget) <= 0) {
      setFormError('Budget must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const newTrip = await api.post('/trips', {
        destinationId,
        startDate,
        endDate,
        budget: parseFloat(budget),
      });
      setTrips([newTrip, ...trips]);
      setIsModalOpen(false);
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setBudget('');
    } catch (err) {
      setFormError(err.message || 'Failed to create trip plan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Your Trips...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>My Planned <span className="gradient-text">Trips</span></h1>
          <p>Manage existing itineraries or plan a new customized journey.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Plan a New Trip</span>
        </button>
      </div>

      {trips.length > 0 ? (
        <div className="grid-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              destination={destinations.find((d) => d.id === trip.destinationId)}
              onDelete={handleDeleteTrip}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={styles.emptyContainer}>
          <h2>No trips created yet</h2>
          <p style={{ color: '#9ca3af', margin: '0.5rem 0 1.5rem 0' }}>
            Get started by scheduling your first vacation dates and budget.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Plan a Trip Now
          </button>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-slide-up" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>Plan New Adventure</h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="alert alert-error" style={{ padding: '0.75rem' }}>{formError}</div>}

            <form onSubmit={handleCreateTripSubmit}>
              <div className="form-group">
                <label className="form-label">Select Destination</label>
                <div style={styles.inputContainer}>
                  <MapPin size={18} style={styles.inputIcon} />
                  <select
                    className="form-input form-select"
                    style={styles.inputWithIcon}
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country}) - ₹{d.budgetPerDay}/day
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <div style={styles.inputContainer}>
                    <Calendar size={18} style={styles.inputIcon} />
                    <input
                      type="date"
                      className="form-input"
                      style={styles.inputWithIcon}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <div style={styles.inputContainer}>
                    <Calendar size={18} style={styles.inputIcon} />
                    <input
                      type="date"
                      className="form-input"
                      style={styles.inputWithIcon}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Allocated Budget (₹)</label>
                <div style={styles.inputContainer}>
                  <span style={{ position: 'absolute', left: '1rem', fontWeight: 'bold', color: '#6b7280', fontSize: '1.1rem' }}>₹</span>
                  <input
                    type="number"
                    className="form-input"
                    style={styles.inputWithIcon}
                    placeholder="e.g. 80000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Confirm Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    fontSize: '1.2rem',
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: '4rem 2rem',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '3rem auto 0 auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '1rem',
  },
  modalCard: {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    backgroundColor: '#111827',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#6b7280',
  },
  inputWithIcon: {
    paddingLeft: '2.75rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
};
