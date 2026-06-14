import { Compass, Plus } from 'lucide-react';

export default function DestinationCard({ destination, onPlanTrip }) {
  const imageUrl = destination.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="glass-card animate-slide-up" style={styles.card}>
      <div style={{ ...styles.imgContainer, backgroundImage: `url(${imageUrl})` }}>
        <div style={styles.overlay}>
          <span style={styles.country}>{destination.country}</span>
          <h3 style={styles.name}>{destination.name}</h3>
        </div>
      </div>
      
      <div style={styles.body}>
        <p style={styles.description}>{destination.description}</p>
        
        <div style={styles.budgetRow}>
          <div style={styles.budgetLabelContainer}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#9ca3af', marginRight: '2px' }}>₹</span>
            <span style={styles.budgetText}>Est. Daily Cost</span>
          </div>
          <span style={styles.budgetValue}>₹{destination.budgetPerDay.toFixed(0)}/day</span>
        </div>

        <button 
          onClick={() => onPlanTrip(destination.id)} 
          className="btn btn-primary"
          style={styles.btn}
        >
          <Plus size={16} />
          <span>Plan a Trip</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imgContainer: {
    height: '180px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0.2) 60%, rgba(11, 15, 25, 0) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.25rem',
  },
  country: {
    fontSize: '0.85rem',
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  name: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },
  description: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    flex: 1,
  },
  budgetRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  budgetLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  icon: {
    color: '#9ca3af',
  },
  budgetText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#14b8a6',
  },
  btn: {
    width: '100%',
    borderRadius: '8px',
  },
};
