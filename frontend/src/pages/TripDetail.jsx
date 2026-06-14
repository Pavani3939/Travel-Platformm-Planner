import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  ArrowLeft, Calendar, Plus, Trash2, 
  MapPin, Check, Edit2, Loader2, Info 
} from 'lucide-react';
import { convertToINR } from '../utils/currency';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Itinerary edit states
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [newActivityText, setNewActivityText] = useState('');
  const [editingLodging, setEditingLodging] = useState(false);
  const [lodgingInput, setLodgingInput] = useState('');

  // Expense edit states
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseCurrency, setExpenseCurrency] = useState('INR');

  // General Trip Edit states
  const [editingTripGeneral, setEditingTripGeneral] = useState(false);
  const [editBudget, setEditBudget] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const tripData = await api.get(`/trips?id=${id}`);
      setTrip(tripData);
      
      // Load general edit fields
      setEditBudget(tripData.budget);
      setEditStartDate(tripData.startDate);
      setEditEndDate(tripData.endDate);

      // Load destination details
      const dests = await api.get('/destinations');
      const dest = dests.find(d => d.id === tripData.destinationId);
      setDestination(dest);
    } catch (err) {
      setError(err.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  const persistTripUpdates = async (updatedTrip) => {
    try {
      const saved = await api.put(`/trips?id=${id}`, updatedTrip);
      setTrip(saved);
      return saved;
    } catch (err) {
      alert(err.message || 'Failed to save changes.');
      throw err;
    }
  };

  // --- Itinerary Operations ---
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivityText.trim()) return;

    const updatedItinerary = trip.itinerary.map(day => {
      if (day.dayNumber === activeDayTab) {
        return {
          ...day,
          activities: [...(day.activities || []), newActivityText.trim()]
        };
      }
      return day;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    await persistTripUpdates(updatedTrip);
    setNewActivityText('');
  };

  const handleDeleteActivity = async (dayNumber, activityIndex) => {
    const updatedItinerary = trip.itinerary.map(day => {
      if (day.dayNumber === dayNumber) {
        const activities = [...day.activities];
        activities.splice(activityIndex, 1);
        return { ...day, activities };
      }
      return day;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    await persistTripUpdates(updatedTrip);
  };

  const handleSaveLodging = async () => {
    const updatedItinerary = trip.itinerary.map(day => {
      if (day.dayNumber === activeDayTab) {
        return {
          ...day,
          accommodation: lodgingInput.trim() || 'Not Specified'
        };
      }
      return day;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    await persistTripUpdates(updatedTrip);
    setEditingLodging(false);
  };

  const handleStartEditingLodging = (currentLodging) => {
    setLodgingInput(currentLodging === 'Not Specified' ? '' : currentLodging);
    setEditingLodging(true);
  };

  // --- Expense Operations ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount) return;

    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newExpense = {
      id: 'exp-' + Math.random().toString(36).substring(2, 9),
      description: expenseDesc.trim(),
      amount: amountNum,
      category: expenseCategory,
      currency: expenseCurrency
    };

    const updatedTrip = {
      ...trip,
      expenses: [...(trip.expenses || []), newExpense]
    };

    await persistTripUpdates(updatedTrip);
    
    // Reset Form
    setExpenseDesc('');
    setExpenseAmount('');
    setExpenseCategory('Food');
    setExpenseCurrency('INR');
  };

  const handleDeleteExpense = async (expenseId) => {
    const updatedExpenses = trip.expenses.filter(exp => exp.id !== expenseId);
    const updatedTrip = { ...trip, expenses: updatedExpenses };
    await persistTripUpdates(updatedTrip);
  };

  // --- General Settings Update ---
  const handleSaveGeneralSettings = async (e) => {
    e.preventDefault();
    if (!editStartDate || !editEndDate || !editBudget) {
      alert('All fields are required.');
      return;
    }

    if (new Date(editStartDate) > new Date(editEndDate)) {
      alert('Start date must be before end date.');
      return;
    }

    const budgetNum = parseFloat(editBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert('Budget must be positive.');
      return;
    }

    const updatedTrip = {
      ...trip,
      startDate: editStartDate,
      endDate: editEndDate,
      budget: budgetNum
    };

    try {
      await persistTripUpdates(updatedTrip);
      setEditingTripGeneral(false);
    } catch (err) {
      // Error handled inside persistTripUpdates
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#3b82f6' }} />
        <p style={{ marginTop: '1rem' }}>Fetching Trip Details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="glass-card" style={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p style={{ margin: '1rem 0' }}>{error || 'We could not find the trip requested.'}</p>
        <Link to="/trips" className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Back to Trips</span>
        </Link>
      </div>
    );
  }

  const activeDayData = trip.itinerary.find(day => day.dayNumber === activeDayTab) || {
    dayNumber: activeDayTab,
    activities: [],
    accommodation: 'Not Specified'
  };

  const totalSpent = trip.expenses.reduce((sum, exp) => sum + convertToINR(exp.amount, exp.currency), 0);
  const remainingBudget = trip.budget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  // Group expenses by category for quick summary view
  const categoryTotals = { Food: 0, Transport: 0, Lodging: 0, Activities: 0, Other: 0 };
  trip.expenses.forEach(exp => {
    const amtInINR = convertToINR(exp.amount, exp.currency);
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += amtInINR;
    } else {
      categoryTotals.Other += amtInINR;
    }
  });

  return (
    <div className="animate-fade-in">
      {/* Back button and page title */}
      <div style={styles.navRow}>
        <Link to="/trips" style={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Trips</span>
        </Link>
      </div>

      <div className="glass-card" style={styles.headerBanner}>
        <div style={styles.headerInfo}>
          <span style={styles.headerCountry}>{destination?.country}</span>
          <h1>Trip to {destination?.name || 'Vacation Spot'}</h1>
          <p style={styles.headerDate}>
            <Calendar size={14} style={{ marginRight: '0.25rem' }} />
            {trip.startDate} to {trip.endDate}
          </p>
        </div>
        
        <button 
          onClick={() => setEditingTripGeneral(!editingTripGeneral)}
          className="btn btn-secondary btn-sm"
        >
          <Edit2 size={14} />
          <span>Edit Dates/Budget</span>
        </button>
      </div>

      {/* General Settings Editor Form */}
      {editingTripGeneral && (
        <form onSubmit={handleSaveGeneralSettings} className="glass-card animate-slide-up" style={styles.editGeneralForm}>
          <h3 style={{ marginBottom: '1.25rem' }}>Update Trip Details</h3>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Departure Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={editStartDate}
                onChange={e => setEditStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Return Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={editEndDate}
                onChange={e => setEditEndDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Overall Budget (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={editBudget}
                onChange={e => setEditBudget(e.target.value)}
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setEditingTripGeneral(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>
      )}

      {/* Main split dashboard layout */}
      <div style={styles.splitLayout}>
        {/* Left Column: Itinerary */}
        <div style={styles.itineraryCol}>
          <div className="glass-card" style={{ height: '100%' }}>
            <div style={styles.sectionHeader}>
              <MapPin size={22} style={{ color: '#3b82f6' }} />
              <h2>Day-wise Itinerary</h2>
            </div>

            {/* Day selector tabs */}
            <div style={styles.dayTabs}>
              {trip.itinerary.map(day => (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setActiveDayTab(day.dayNumber);
                    setEditingLodging(false);
                  }}
                  style={{
                    ...styles.dayTab,
                    ...(activeDayTab === day.dayNumber ? styles.activeDayTab : {})
                  }}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Itinerary details for active day */}
            <div style={styles.itineraryBody}>
              {/* Accommodation settings */}
              <div style={styles.lodgingRow}>
                <span style={styles.lodgingLabel}>Hotel / Lodging:</span>
                {editingLodging ? (
                  <div style={styles.lodgingEditGroup}>
                    <input
                      type="text"
                      className="form-input"
                      style={styles.lodgingInput}
                      placeholder="e.g. Hilton Hotel Paris"
                      value={lodgingInput}
                      onChange={e => setLodgingInput(e.target.value)}
                    />
                    <button onClick={handleSaveLodging} style={styles.lodgingConfirmBtn} title="Save lodging">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={styles.lodgingValue}>{activeDayData.accommodation}</strong>
                    <button 
                      onClick={() => handleStartEditingLodging(activeDayData.accommodation)}
                      style={styles.lodgingEditBtn}
                      title="Edit lodging"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Activities list */}
              <div style={styles.activitiesContainer}>
                <h4 style={styles.activitiesHeader}>Activities Planned</h4>
                {activeDayData.activities && activeDayData.activities.length > 0 ? (
                  <ul style={styles.activityList}>
                    {activeDayData.activities.map((act, index) => (
                      <li key={index} style={styles.activityItem}>
                        <span>{act}</span>
                        <button 
                          onClick={() => handleDeleteActivity(activeDayTab, index)}
                          style={styles.activityDeleteBtn}
                          title="Delete activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.emptyActivities}>
                    <Info size={16} />
                    <span>No activities scheduled for this day yet.</span>
                  </div>
                )}
              </div>

              {/* Add activity form */}
              <form onSubmit={handleAddActivity} style={styles.addActivityForm}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a new activity (e.g. Morning coffee, Museum tour)"
                  value={newActivityText}
                  onChange={e => setNewActivityText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Expenses & Budget Tracker */}
        <div style={styles.budgetCol}>
          <div className="glass-card" style={styles.budgetCard}>
            <div style={styles.sectionHeader}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#14b8a6', marginRight: '4px' }}>₹</span>
              <h2>Budget & Expenses</h2>
            </div>

            {/* Small metrics grid */}
            <div style={styles.budgetSummaryGrid}>
              <div style={styles.summaryBlock}>
                <span style={styles.summaryLabel}>Trip Budget</span>
                <span style={styles.summaryVal}>₹{trip.budget.toLocaleString()}</span>
              </div>
              <div style={styles.summaryBlock}>
                <span style={styles.summaryLabel}>Total Spent</span>
                <span style={{ ...styles.summaryVal, color: isOverBudget ? '#ef4444' : '#ffffff' }}>
                  ₹{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div style={styles.summaryBlock}>
                <span style={styles.summaryLabel}>Remaining</span>
                <span style={{ ...styles.summaryVal, color: isOverBudget ? '#ef4444' : '#14b8a6' }}>
                  ₹{remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Categorical Progress bars */}
            <div style={styles.categoriesOverview}>
              {Object.entries(categoryTotals).map(([cat, total]) => {
                const categoryPct = trip.budget > 0 ? Math.min((total / trip.budget) * 100, 100) : 0;
                return (
                  <div key={cat} style={styles.categoryRow}>
                    <div style={styles.catLabelRow}>
                      <span style={styles.catLabel}>{cat}</span>
                      <span style={styles.catValue}>₹{total.toFixed(0)}</span>
                    </div>
                    <div style={styles.catProgressBg}>
                      <div 
                        style={{ 
                          ...styles.catProgressFill, 
                          width: `${categoryPct}%`,
                          backgroundColor: cat === 'Food' ? '#3b82f6' : 
                                           cat === 'Transport' ? '#f59e0b' : 
                                           cat === 'Lodging' ? '#8b5cf6' : 
                                           cat === 'Activities' ? '#14b8a6' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Expense Form */}
            <form onSubmit={handleAddExpense} style={styles.expenseForm}>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem' }}>Log Expense</h4>
              <div style={styles.expenseInputsRow}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: '2 1 150px' }}
                  placeholder="Expense description (e.g. Dinner)"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="form-input"
                  style={{ flex: '1 1 80px' }}
                  placeholder="Amount"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  required
                />
                <select
                  className="form-input form-select"
                  style={{ flex: '0.8 1 80px', paddingRight: '1.5rem' }}
                  value={expenseCurrency}
                  onChange={e => setExpenseCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
                <select
                  className="form-input form-select"
                  style={{ flex: '1.2 1 100px', paddingRight: '1.5rem' }}
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Lodging">Lodging</option>
                  <option value="Activities">Activities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={styles.addExpenseBtn}>
                <Plus size={16} />
                <span>Log Transaction</span>
              </button>
            </form>

            {/* Expense Transaction History */}
            <div style={styles.transactionsContainer}>
              <h4 style={styles.transactionsHeader}>Transaction History</h4>
              {trip.expenses && trip.expenses.length > 0 ? (
                <div style={styles.transactionList}>
                  {trip.expenses.map(exp => (
                    <div key={exp.id} style={styles.transactionRow}>
                      <div style={styles.transMain}>
                        <span style={styles.transDesc}>{exp.description}</span>
                        <span 
                          style={{ 
                            ...styles.transBadge,
                            backgroundColor: exp.category === 'Food' ? 'rgba(59, 130, 246, 0.1)' : 
                                             exp.category === 'Transport' ? 'rgba(245, 158, 11, 0.1)' : 
                                             exp.category === 'Lodging' ? 'rgba(139, 92, 246, 0.1)' : 
                                             exp.category === 'Activities' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: exp.category === 'Food' ? '#60a5fa' : 
                                   exp.category === 'Transport' ? '#fbbf24' : 
                                   exp.category === 'Lodging' ? '#a78bfa' : 
                                   exp.category === 'Activities' ? '#2dd4bf' : '#f87171'
                          }}
                        >
                          {exp.category}
                        </span>
                      </div>
                      <div style={styles.transAction}>
                        <strong style={styles.transAmount}>
                          {exp.currency && exp.currency !== 'INR'
                            ? `${exp.currency} ${exp.amount.toFixed(2)} (~₹${convertToINR(exp.amount, exp.currency).toFixed(0)})`
                            : `₹${exp.amount.toFixed(0)}`
                          }
                        </strong>
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={styles.transDeleteBtn}
                          title="Delete expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyTrans}>No logged expenses for this trip.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    color: '#9ca3af',
  },
  errorContainer: {
    maxWidth: '500px',
    margin: '4rem auto 0 auto',
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  navRow: {
    marginBottom: '1rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  headerBanner: {
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerCountry: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  headerDate: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#9ca3af',
    marginTop: '0.35rem',
  },
  editGeneralForm: {
    marginBottom: '2rem',
    padding: '1.5rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  splitLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  itineraryCol: {
    flex: 6,
    minWidth: '400px',
  },
  budgetCol: {
    flex: 5,
    minWidth: '350px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  dayTabs: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  dayTab: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#9ca3af',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
  activeDayTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
    color: '#3b82f6',
    fontWeight: '600',
  },
  itineraryBody: {
    paddingTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  lodgingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  lodgingLabel: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  lodgingValue: {
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  lodgingEditBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
  },
  lodgingEditGroup: {
    display: 'flex',
    flex: 1,
    gap: '0.5rem',
  },
  lodgingInput: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.875rem',
  },
  lodgingConfirmBtn: {
    backgroundColor: '#10b981',
    border: 'none',
    color: '#ffffff',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitiesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  activitiesHeader: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    listStyle: 'none',
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  activityDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  emptyActivities: {
    padding: '1.5rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '8px',
    border: '1px dashed rgba(255,255,255,0.05)',
  },
  addActivityForm: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  budgetCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: '100%',
  },
  budgetSummaryGrid: {
    display: 'flex',
    gap: '1rem',
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '0.75rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginTop: '0.25rem',
  },
  categoriesOverview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  categoryRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  catLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  catLabel: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  catValue: {
    color: '#ffffff',
    fontWeight: '600',
  },
  catProgressBg: {
    height: '5px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '3px',
  },
  catProgressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  expenseForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  expenseInputsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  addExpenseBtn: {
    alignSelf: 'flex-end',
    borderRadius: '6px',
  },
  transactionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  transactionsHeader: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  transactionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '0.25rem',
  },
  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 0.75rem',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '6px',
  },
  transMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  transDesc: {
    fontSize: '0.85rem',
    color: '#ffffff',
    fontWeight: '500',
  },
  transBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  transAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  transAmount: {
    fontSize: '0.875rem',
    color: '#ffffff',
  },
  transDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  emptyTrans: {
    padding: '1rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.85rem',
    borderRadius: '6px',
    border: '1px dashed rgba(255,255,255,0.04)',
  },
};
