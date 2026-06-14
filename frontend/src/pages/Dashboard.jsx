import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';
import TripCard from '../components/TripCard';
import { Briefcase, PiggyBank, Compass, Plus, MapPin } from 'lucide-react';
import { convertToINR } from '../utils/currency';

export default function Dashboard({ user }) {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, destinationsData] = await Promise.all([
          api.get('/trips'),
          api.get('/destinations'),
        ]);
        setTrips(tripsData);
        setDestinations(destinationsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips?id=${id}`);
        setTrips(trips.filter(t => t.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete trip.');
      }
    }
  };

  // Calculate statistics
  const totalTrips = trips.length;
  const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);
  const totalExpenses = trips.reduce((sum, t) => {
    const tripExpSum = t.expenses ? t.expenses.reduce((s, e) => s + convertToINR(e.amount, e.currency), 0) : 0;
    return sum + tripExpSum;
  }, 0);

  const remainingBudget = totalBudget - totalExpenses;

  // Find nearest upcoming trip
  const getUpcomingTrip = () => {
    if (trips.length === 0) return null;
    const sorted = [...trips].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    // Filter trips that are in the future or current
    const today = new Date().toISOString().split('T')[0];
    const upcoming = sorted.find(t => t.endDate >= today);
    return upcoming || sorted[0];
  };

  const upcomingTrip = getUpcomingTrip();
  const upcomingDest = upcomingTrip ? destinations.find(d => d.id === upcomingTrip.destinationId) : null;

  const upcomingTripSpent = upcomingTrip && upcomingTrip.expenses
    ? upcomingTrip.expenses.reduce((s, e) => s + convertToINR(e.amount, e.currency), 0)
    : 0;

  if (loading) {
    return <div style={styles.loading}>Loading Dashboard...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Welcome, <span className="gradient-text">{user.fullName}</span></h1>
          <p>Plan, organize, and track your next travel adventures.</p>
        </div>
        <Link to="/destinations" className="btn btn-primary">
          <Plus size={18} />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={styles.metricsGrid}>
        <StatCard 
          title="Active Trips" 
          value={totalTrips} 
          icon={<Briefcase size={20} />} 
          subtext="Total trips planned" 
          color="#3b82f6"
        />
        <StatCard 
          title="Total Budget" 
          value={`₹${totalBudget.toLocaleString()}`} 
          icon={<span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#14b8a6' }}>₹</span>} 
          subtext="Combined travel allowance" 
          color="#14b8a6"
        />
        <StatCard 
          title="Total Expenses" 
          value={`₹${totalExpenses.toLocaleString()}`} 
          icon={<PiggyBank size={20} />} 
          subtext={`Remaining: ₹${remainingBudget.toLocaleString()}`} 
          color={remainingBudget < 0 ? '#ef4444' : '#8b5cf6'}
        />
      </div>

      {/* Main Panel layout */}
      <div style={styles.dashboardBody}>
        {/* Left Column: Upcoming Trip Banner or Empty State */}
        <div style={styles.primaryColumn}>
          {upcomingTrip ? (
            <div className="glass-card" style={styles.bannerCard}>
              <span style={styles.bannerLabel}>Upcoming Adventure</span>
              <div style={styles.bannerDetails}>
                <div style={styles.bannerText}>
                  <h2>{upcomingDest?.name || 'Vacation'}</h2>
                  <p style={styles.bannerCountry}>{upcomingDest?.country}</p>
                  <p style={styles.bannerDate}>
                    Departure: <strong>{upcomingTrip.startDate}</strong> ({upcomingTrip.endDate} return)
                  </p>
                  <div style={styles.bannerProgressRow}>
                    <span>Budget Spent:</span>
                    <strong style={{ color: upcomingTripSpent > upcomingTrip.budget ? '#ef4444' : '#14b8a6' }}>
                      ₹{upcomingTripSpent.toFixed(0)} / ₹{upcomingTrip.budget.toFixed(0)}
                    </strong>
                  </div>
                  <Link to={`/trips/${upcomingTrip.id}`} className="btn btn-primary btn-sm" style={styles.bannerBtn}>
                    <span>Manage Itinerary</span>
                  </Link>
                </div>
                {upcomingDest?.imageUrl && (
                  <div 
                    style={{ ...styles.bannerImg, backgroundImage: `url(${upcomingDest.imageUrl})` }}
                  ></div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={styles.emptyBanner}>
              <Compass size={48} style={styles.emptyIcon} />
              <h2>No upcoming trips planned</h2>
              <p>Explore beautiful destinations around the globe and create your first itinerary today!</p>
              <Link to="/destinations" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                <Compass size={18} />
                <span>Explore Destinations</span>
              </Link>
            </div>
          )}

          {/* Quick List of recent trips */}
          <div style={styles.sectionHeaderRow}>
            <h3>Recent Trip Plans</h3>
            <Link to="/trips" style={styles.sectionLink}>View All Trips</Link>
          </div>
          
          {trips.length > 0 ? (
            <div className="grid-2">
              {trips.slice(0, 2).map(trip => (
                <TripCard 
                  key={trip.id}
                  trip={trip}
                  destination={destinations.find(d => d.id === trip.destinationId)}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyList}>
              <p>Your recent trips will be displayed here.</p>
            </div>
          )}
        </div>

        {/* Right Column: Mini destination suggestions */}
        <div style={styles.secondaryColumn}>
          <div className="glass-card" style={styles.quickPlanCard}>
            <h3>Featured Places</h3>
            <p style={styles.quickPlanSub}>Instant inspiration for your next getaway</p>
            
            <div style={styles.miniDestList}>
              {destinations.slice(0, 3).map(dest => (
                <div key={dest.id} style={styles.miniDestRow}>
                  <div 
                    style={{ ...styles.miniDestImg, backgroundImage: `url(${dest.imageUrl})` }}
                  ></div>
                  <div style={styles.miniDestInfo}>
                    <span style={styles.miniDestName}>{dest.name}</span>
                    <span style={styles.miniDestCountry}>{dest.country}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/destinations?plan=${dest.id}`)}
                    style={styles.miniDestBtn}
                    title="Plan trip here"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Link to="/destinations" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              Explore All Destinations
            </Link>
          </div>
        </div>
      </div>
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
  metricsGrid: {
    marginBottom: '2.5rem',
  },
  dashboardBody: {
    display: 'flex',
    gap: '2rem',
  },
  primaryColumn: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  secondaryColumn: {
    flex: 1,
  },
  bannerCard: {
    padding: '2rem',
    background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.7) 0%, rgba(17, 24, 39, 0.9) 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLabel: {
    display: 'inline-block',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  bannerDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
  },
  bannerText: {
    flex: 1,
  },
  bannerCountry: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '0.75rem',
  },
  bannerDate: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  bannerProgressRow: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '1.25rem',
  },
  bannerBtn: {
    borderRadius: '6px',
  },
  bannerImg: {
    width: '180px',
    height: '140px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  emptyBanner: {
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    color: '#4b5563',
    marginBottom: '1rem',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLink: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },
  emptyList: {
    padding: '2rem',
    borderRadius: '12px',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    color: '#6b7280',
  },
  quickPlanCard: {
    padding: '1.5rem',
  },
  quickPlanSub: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '1.25rem',
  },
  miniDestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  miniDestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  miniDestImg: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  miniDestInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  miniDestName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  miniDestCountry: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  miniDestBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: 'none',
    color: '#3b82f6',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
};
