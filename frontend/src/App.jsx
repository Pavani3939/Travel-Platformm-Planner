import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './utils/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import SearchDestinations from './pages/SearchDestinations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if session exists on server
      const currentUser = await api.get('/auth/me');
      setUser(currentUser);
    } catch (err) {
      // Not authenticated or session expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return <div style={styles.loadingScreen}>Checking authentication status...</div>;
  }

  return (
    <BrowserRouter>
      {user ? (
        <div className="app-container">
          <Navbar user={user} onLogout={handleLogout} />
          <Sidebar user={user} />
          
          <main className="main-content">
            <div style={{ height: '70px' }}></div> {/* Spacer for fixed Navbar */}
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/destinations" element={<SearchDestinations />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/profile" element={<Profile user={user} />} />
              
              {/* Admin Protected Route */}
              <Route 
                path="/admin" 
                element={user && user.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" replace />} 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

const styles = {
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0f19',
    color: '#9ca3af',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.1rem',
  },
};
