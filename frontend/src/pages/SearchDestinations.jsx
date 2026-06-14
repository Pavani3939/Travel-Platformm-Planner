import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import DestinationCard from '../components/DestinationCard';
import { Search, MapPin, Calendar, DollarSign, X, AlertCircle, Compass } from 'lucide-react';

export default function SearchDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterInterest, setFilterInterest] = useState('');
  
  // Search URL params to trigger planning immediately
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId && destinations.length > 0) {
      const dest = destinations.find(d => d.id === planId);
      if (dest) {
        handleOpenPlanModal(dest);
      }
    }
  }, [searchParams, destinations]);

  const fetchDestinations = async () => {
    try {
      const list = await api.get('/destinations');
      setDestinations(list);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlanModal = (dest) => {
    setSelectedDest(dest);
    setIsModalOpen(true);
    setModalError('');
    // Automatically suggest standard budget based on destination cost per day
    setBudget(dest.budgetPerDay * 5); // default 5-day estimation
  };

  const handleClosePlanModal = () => {
    setIsModalOpen(false);
    setSelectedDest(null);
    setSearchParams({}); // Clear URL params
  };

  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!startDate || !endDate || !budget) {
      setModalError('Please enter all dates and budget.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setModalError('Departure date cannot be after return date.');
      return;
    }

    const budgetVal = parseFloat(budget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setModalError('Budget must be positive.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/trips', {
        destinationId: selectedDest.id,
        startDate,
        endDate,
        budget: budgetVal
      });
      handleClosePlanModal();
      navigate('/trips');
    } catch (err) {
      setModalError(err.message || 'Failed to schedule trip. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDestinations = destinations.filter(d => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      d.name.toLowerCase().includes(query) ||
      d.country.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query);

    const budgetLimit = parseFloat(filterBudget);
    const matchesBudget = isNaN(budgetLimit) || (d.budgetPerDay * 5) <= budgetLimit;

    const interest = filterInterest.trim().toLowerCase();
    let matchesInterest = true;
    if (interest) {
      const desc = d.description.toLowerCase();
      const name = d.name.toLowerCase();
      if (interest.startsWith('histor') && (desc.includes('histor') || name.includes('histor') || desc.includes('ancient') || desc.includes('temple') || desc.includes('colosseum'))) {
        matchesInterest = true;
      } else if (interest.startsWith('natur') && (desc.includes('natur') || name.includes('natur') || desc.includes('beach') || desc.includes('reef') || desc.includes('forest') || desc.includes('volcanic'))) {
        matchesInterest = true;
      } else if ((interest.includes('food') || interest.includes('culinary') || interest.includes('dine') || interest.includes('dining')) && (desc.includes('food') || desc.includes('dining') || desc.includes('culinary') || desc.includes('bistro'))) {
        matchesInterest = true;
      } else {
        matchesInterest = name.includes(interest) || d.country.toLowerCase().includes(interest) || desc.includes(interest);
      }
    }

    return matchesSearch && matchesBudget && matchesInterest;
  });

  if (loading) {
    return <div style={styles.loading}>Loading Destinations...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Explore <span className="gradient-text">Destinations</span></h1>
          <p>Find the perfect location and estimate costs for your next vacation.</p>
        </div>
      </div>

      {/* Search & AI Recommendation Filters Bar */}
      <div className="glass-card" style={styles.searchBarCard}>
        <div style={styles.searchFiltersRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '2 1 300px' }}>
            <Search size={20} style={styles.searchIcon} />
            <input 
              type="text" 
              className="form-input" 
              style={styles.searchInput}
              placeholder="Search by city, country, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
            <span style={styles.currencySymbolIcon}>₹</span>
            <input 
              type="number" 
              className="form-input" 
              style={styles.inputWithIcon}
              placeholder="Ideal Budget Limit (₹)"
              value={filterBudget}
              onChange={e => setFilterBudget(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px' }}>
            <Compass size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Interests / Category"
              value={filterInterest}
              onChange={e => setFilterInterest(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid-3">
          {filteredDestinations.map(dest => (
            <DestinationCard 
              key={dest.id}
              destination={dest}
              onPlanTrip={() => handleOpenPlanModal(dest)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={styles.noResults}>
          <AlertCircle size={40} style={{ color: '#ef4444' }} />
          <h3>No matching destinations found</h3>
          <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
            Try adjusting search queries or explore general items.
          </p>
        </div>
      )}

      {/* Planning Modal popup */}
      {isModalOpen && selectedDest && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-slide-up" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h2>Plan Trip to {selectedDest.name}</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Country: {selectedDest.country}</p>
              </div>
              <button onClick={handleClosePlanModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {modalError && <div className="alert alert-error" style={{ padding: '0.75rem' }}>{modalError}</div>}

            <form onSubmit={handleCreateTripSubmit}>
              <div style={styles.estimateBanner}>
                <span>Daily Estimate: <strong>₹{selectedDest.budgetPerDay.toLocaleString()}/day</strong></span>
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
                      onChange={e => setStartDate(e.target.value)}
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
                      onChange={e => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Trip Budget (₹)</label>
                <div style={styles.inputContainer}>
                  <span style={styles.currencySymbolIcon}>₹</span>
                  <input 
                    type="number" 
                    className="form-input"
                    style={styles.inputWithIcon}
                    placeholder="Enter total budget amount in Rupees"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={handleClosePlanModal} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Setting up...' : 'Create Itinerary'}
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
  searchBarCard: {
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  searchIcon: {
    color: '#6b7280',
  },
  searchInput: {
    border: 'none',
    background: 'none',
    padding: 0,
    fontSize: '1.1rem',
    color: '#ffffff',
    '&:focus': {
      boxShadow: 'none',
      border: 'none',
    }
  },
  noResults: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    padding: '2.5rem 2rem',
    backgroundColor: '#111827',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  estimateBanner: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    border: '1px solid rgba(20, 184, 166, 0.15)',
    color: '#2dd4bf',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '1.25rem',
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
