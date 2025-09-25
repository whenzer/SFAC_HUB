import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import { DEV_OVERRIDES_ACTIVE, DEV_USER_DATA } from '../config/devConfig';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Juan Dela Cruz');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   // ⚠️ DEVELOPMENT OVERRIDE: Bypass authentication check
  //   if (DEV_OVERRIDES_ACTIVE) {
  //     console.warn('🚨 DEVELOPMENT MODE: Authentication bypassed for dashboard access');
  //     setUserName(DEV_USER_DATA.name);
      
  //     // Simulate loading time
  //     const timer = setTimeout(() => {
  //       setIsLoading(false);
  //     }, 1000);
      
  //     return () => clearTimeout(timer);
  //   }

  //   // PRODUCTION AUTHENTICATION CHECK
  //   const authToken = localStorage.getItem('authToken');
  //   const userData = localStorage.getItem('userData');
    
  //   if (!authToken || !userData) {
  //     navigate('/login');
  //     return;
  //   }

    

  //   // Parse user data and set name
  //   try {
  //     const user = JSON.parse(userData);
  //     setUserName(user.name || 'Student');
  //   } catch (error) {
  //     console.error('Error parsing user data:', error);
  //   }

  //   // Simulate loading time
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [navigate]);

  useEffect(() => { 
  // ⚠️ DEVELOPMENT OVERRIDE: Bypass authentication check
  if (DEV_OVERRIDES_ACTIVE) {
    console.warn('🚨 DEVELOPMENT MODE: Authentication bypassed for dashboard access');
    setUserName(DEV_USER_DATA.name);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }

  // PRODUCTION AUTHENTICATION CHECK
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    navigate('/login');
    return;
  }

  // ✅ Fetch user data from backend
  const fetchUser = async () => {
    try {
      const response = await fetch('https://sfac-hub.onrender.com/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Save user data to localStorage
        localStorage.setItem('userData', JSON.stringify(data.user));

        const user = data.user;
        
        // Use a safe concatenation: filter out any falsy values (like null, undefined, or empty strings)
        // and join the remaining parts with a single space.
        const fullNameParts = [user.firstname, user.middlename, user.lastname].filter(Boolean);
        
        // Set the name. If fullNameParts is empty (i.e., no name parts were available), default to 'Student'.
        setUserName(fullNameParts.length > 0 ? fullNameParts.join(' ') : 'Student');
      }  else {
        console.error('Failed to fetch user:', data.message);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  fetchUser();
}, [navigate]);

  const handleLogout = () => {
    // ⚠️ DEVELOPMENT OVERRIDE: Handle logout differently in dev mode
    if (DEV_OVERRIDES_ACTIVE) {
      console.warn('🚨 DEVELOPMENT MODE: Logout redirected to login (no actual logout needed)');
      navigate('/login');
      return;
    }

    // PRODUCTION LOGOUT
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
        <div className="loading-text">Loading Dashboard</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ⚠️ DEVELOPMENT WARNING BANNER */}
      {DEV_OVERRIDES_ACTIVE && (
        <div style={{
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          borderBottom: '2px solid #ff5252',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          🚨 DEVELOPMENT MODE: Authentication bypassed - Dashboard accessible without login
        </div>
      )}
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo-container">
              <img src={SFACLogo} alt="SFAC Logo" className="header-logo" />
              <span className="logo-text">SFAC Hub</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <div className="user-avatar">
                <span>{userName.charAt(0)}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="logout-btn" 
              title="Logout"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {userName}! 👋
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening at SFAC today
            </p>
          </div>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <p className="section-subtitle">
              Access the most common features
            </p>
            
            <div className="quick-actions-grid">
              {/* Stock Availability Card */}
              <Link to="/stock-availability" className="action-card stock-card">
                <div className="card-icon">
                  <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div className="card-content">
                  <h3 className="card-title">Stock Availability</h3>
                  <p className="card-description">
                    Check what's currently available
                  </p>
                  <div className="card-action">
                    <span>Access</span>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Make Reservation Card */}
              <Link to="/make-reservation" className="action-card reservation-card">
                <div className="card-icon">
                  <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="card-content">
                  <h3 className="card-title">Make Reservation</h3>
                  <p className="card-description">
                    Reserve items for pickup
                  </p>
                  <div className="card-action">
                    <span>Access</span>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Lost & Found Card */}
              <Link to="/lost-and-found" className="action-card lost-found-card">
                <div className="card-icon">
                  <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="card-content">
                  <h3 className="card-title">Lost & Found</h3>
                  <p className="card-description">
                    Report or find lost items
                  </p>
                  <div className="card-action">
                    <span>Access</span>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Popular Items */}
          <section className="popular-items-section">
            <h2 className="section-title">Popular Items</h2>
            <p className="section-subtitle">
              Most requested items this week
            </p>
            
            <div className="popular-items-list">
              <div className="popular-item">
                <div className="item-indicator school-uniforms"></div>
                <div className="item-info">
                  <span className="item-name">School Uniforms</span>
                  <span className="item-count">15 requests</span>
                </div>
              </div>
              
              <div className="popular-item">
                <div className="item-indicator textbooks"></div>
                <div className="item-info">
                  <span className="item-name">Textbooks</span>
                  <span className="item-count">12 requests</span>
                </div>
              </div>
              
              <div className="popular-item">
                <div className="item-indicator lab-equipment"></div>
                <div className="item-info">
                  <span className="item-name">Laboratory Equipment</span>
                  <span className="item-count">8 requests</span>
                </div>
              </div>
              
              <div className="popular-item">
                <div className="item-indicator stationery"></div>
                <div className="item-info">
                  <span className="item-name">Stationery</span>
                  <span className="item-count">6 requests</span>
                </div>
              </div>
            </div>
          </section>

          {/* This Week Stats */}
          <section className="stats-section">
            <h2 className="section-title">This Week</h2>
            
            <div className="stats-grid">
              <div className="stat-card items-reserved">
                <div className="stat-number">24</div>
                <div className="stat-label">Items Reserved</div>
              </div>
              
              <div className="stat-card items-found">
                <div className="stat-number">6</div>
                <div className="stat-label">Lost Items Found</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
  <div 
    className="modal-overlay logout-modal-overlay" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="logout-modal-title"
    onClick={(e) => e.target === e.currentTarget && setShowLogoutModal(false)}
  >
    <div className="modal-content logout-modal-content">
      <div className="logout-modal-header">
        <div className="logout-modal-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="url(#warning-gradient)" />
            <path 
              d="M12 8v4m0 4h.01" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="logout-modal-text">
          <h2 id="logout-modal-title" className="logout-modal-title">
            Ready to leave?
          </h2>
          <p className="logout-modal-description">
            You'll be signed out of your account. Make sure to save any changes before logging out.
          </p>
        </div>
      </div>
      
      <div className="logout-modal-footer">
        <button 
          className="logout-modal-btn logout-modal-btn--secondary"
          onClick={() => setShowLogoutModal(false)}
          aria-label="Cancel and stay logged in"
        >
          Stay Signed In
        </button>
        <button 
          className="logout-modal-btn logout-modal-btn--primary"
          onClick={confirmLogout}
          autoFocus
          aria-describedby="logout-modal-description"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  </div>
)}
<footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-box">
                <img src={SFACLogo} alt="SFAC Logo" />
              </div>
              <div className="footer-text">
                <p className="footer-copyright">
                  © 2025 SFAC Hub - Saint Francis of Assisi College, Bacoor Campus
                </p>
                <p className="footer-developer">
                  Developed by SFAC Students | Making campus life more efficient
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
