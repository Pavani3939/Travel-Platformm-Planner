import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';
import { 
  Users, Globe, Compass, Plus, 
  Trash2, Landmark, Tag, Text, Image, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'destinations'

  // Destination Form State
  const [destName, setDestName] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destDesc, setDestDesc] = useState('');
  const [destBudget, setDestBudget] = useState('');
  const [destImage, setDestImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, destsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/destinations')
      ]);
      setStats(statsData);
      setUsers(usersData);
      setDestinations(destsData);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Warning: Deleting a user will also cascade delete all of their planned trips. Proceed?')) {
      try {
        await api.delete(`/admin/users?id=${userId}`);
        setUsers(users.filter(u => u.id !== userId));
        // Refresh statistics
        const freshStats = await api.get('/admin/stats');
        setStats(freshStats);
      } catch (err) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteDestination = async (destId) => {
    if (window.confirm('Are you sure you want to delete this travel destination?')) {
      try {
        await api.delete(`/admin/destinations?id=${destId}`);
        setDestinations(destinations.filter(d => d.id !== destId));
        // Refresh statistics
        const freshStats = await api.get('/admin/stats');
        setStats(freshStats);
      } catch (err) {
        alert(err.message || 'Failed to delete destination.');
      }
    }
  };

  const handleAddDestinationSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!destName.trim() || !destCountry.trim() || !destDesc.trim() || !destBudget) {
      setFormError('Please fill in all required destination fields.');
      return;
    }

    const budgetVal = parseFloat(destBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setFormError('Daily budget estimate must be positive.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.post('/admin/destinations', {
        name: destName.trim(),
        country: destCountry.trim(),
        description: destDesc.trim(),
        budgetPerDay: budgetVal,
        imageUrl: destImage.trim()
      });

      setDestinations([...destinations, created]);
      setFormSuccess(`Destination '${created.name}' added successfully!`);
      
      // Reset Form
      setDestName('');
      setDestCountry('');
      setDestDesc('');
      setDestBudget('');
      setDestImage('');

      // Refresh Stats
      const freshStats = await api.get('/admin/stats');
      setStats(freshStats);
    } catch (err) {
      setFormError(err.message || 'Failed to add destination.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Admin Dashboard...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={28} style={{ color: '#c084fc' }} />
            Platform <span className="gradient-text">Management</span>
          </h1>
          <p>Global administrative overview and control options.</p>
        </div>
      </div>

      {/* Admin stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<Users size={20} />} 
            color="#3b82f6"
          />
          <StatCard 
            title="Destinations" 
            value={stats.totalDestinations} 
            icon={<Globe size={20} />} 
            color="#8b5cf6"
          />
          <StatCard 
            title="Scheduled Trips" 
            value={stats.totalTrips} 
            icon={<Compass size={20} />} 
            color="#14b8a6"
          />
          <StatCard 
            title="Popular Spot" 
            value={stats.popularDestination === 'None' ? 'N/A' : stats.popularDestination.split(' ')[0]} 
            icon={<Landmark size={20} />} 
            subtext={stats.popularDestination !== 'None' ? stats.popularDestination : 'No trips scheduled yet'}
            color="#f59e0b"
          />
        </div>
      )}

      {/* Tab controls */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTabBtn : {}) }}
        >
          User Accounts
        </button>
        <button 
          onClick={() => setActiveTab('destinations')}
          style={{ ...styles.tabBtn, ...(activeTab === 'destinations' ? styles.activeTabBtn : {}) }}
        >
          Travel Destinations
        </button>
      </div>

      {/* Tab Contents: Users */}
      {activeTab === 'users' && (
        <div className="glass-card animate-slide-up" style={{ padding: '1.5rem 0' }}>
          <h3 style={{ padding: '0 1.5rem 1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            Registered Users ({users.length})
          </h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><code>{u.id}</code></td>
                    <td style={{ fontWeight: '600' }}>{u.fullName}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.id === 'usr-admin' ? (
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Protected</span>
                      ) : (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          style={styles.actionDeleteBtn}
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: Destinations */}
      {activeTab === 'destinations' && (
        <div style={styles.destSplitLayout}>
          {/* Left Side: Destination form */}
          <div style={styles.formCol}>
            <div className="glass-card">
              <h3>Add New Destination</h3>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Expand the platform catalog of available locations.
              </p>

              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

              <form onSubmit={handleAddDestinationSubmit}>
                <div className="form-group">
                  <label className="form-label">City/Spot Name</label>
                  <div style={styles.inputContainer}>
                    <Landmark size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={styles.inputWithIcon}
                      placeholder="e.g. Paris"
                      value={destName}
                      onChange={e => setDestName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <div style={styles.inputContainer}>
                    <Globe size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={styles.inputWithIcon}
                      placeholder="e.g. France"
                      value={destCountry}
                      onChange={e => setDestCountry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Budget Estimate (₹)</label>
                  <div style={styles.inputContainer}>
                    <span style={{ position: 'absolute', left: '1rem', fontWeight: 'bold', color: '#6b7280' }}>₹</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={styles.inputWithIcon}
                      placeholder="e.g. 12000"
                      value={destBudget}
                      onChange={e => setDestBudget(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (Optional)</label>
                  <div style={styles.inputContainer}>
                    <Image size={16} style={styles.inputIcon} />
                    <input 
                      type="url" 
                      className="form-input" 
                      style={styles.inputWithIcon}
                      placeholder="Unsplash image URL"
                      value={destImage}
                      onChange={e => setDestImage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ ...styles.textarea, minHeight: '80px' }}
                    placeholder="Short description highlighting landmarks..."
                    value={destDesc}
                    onChange={e => setDestDesc(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: '8px' }}
                  disabled={submitting}
                >
                  <Plus size={18} />
                  <span>Create Destination</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Destinations list */}
          <div style={styles.listCol}>
            <div className="glass-card" style={{ padding: '1.5rem 0' }}>
              <h3 style={{ padding: '0 1.5rem 1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Catalog of Destinations ({destinations.length})
              </h3>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Location</th>
                      <th>Country</th>
                      <th>Est. Cost</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinations.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div 
                            style={{ 
                              ...styles.tableDestImg, 
                              backgroundImage: `url(${d.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'})` 
                            }}
                          ></div>
                        </td>
                        <td style={{ fontWeight: '600' }}>{d.name}</td>
                        <td>{d.country}</td>
                        <td style={{ color: '#14b8a6', fontWeight: '600' }}>₹{d.budgetPerDay}/day</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteDestination(d.id)}
                            style={styles.actionDeleteBtn}
                            title="Delete destination"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
  tabContainer: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '2rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    transition: 'color 0.2s ease',
  },
  activeTabBtn: {
    color: '#3b82f6',
    borderBottom: '2px solid #3b82f6',
  },
  actionDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#f87171',
    }
  },
  destSplitLayout: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: 2,
    minWidth: '320px',
  },
  listCol: {
    flex: 3,
    minWidth: '400px',
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
  textarea: {
    resize: 'vertical',
  },
  tableDestImg: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '1px solid rgba(255,255,255,0.05)',
  },
};
