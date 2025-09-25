import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fetchWithRefresh from '../utils/apiService';
import { API_BASE_URL } from '../utils/apiService';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import { DEV_OVERRIDES_ACTIVE, DEV_USER_DATA } from '../config/devConfig';

// Define the expected structure for user data (adjust if your data is different)
interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any; // Allows for other properties like email, verified, etc.
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  // Default to 'Student' if name is unavailable
  const [userName, setUserName] = useState('Student'); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // 1. LOGOUT HANDLER (Uses useCallback for stability)
const handleLogout = useCallback(async () => {
    
    const refreshToken = localStorage.getItem('refreshToken');
    
    // ⚠️ SERVER-SIDE TOKEN DELETION
    if (refreshToken) {
        try {
            await fetch(`${API_BASE_URL}/api/user/logout`, {
                // ⬅️ FIX: Changed method to DELETE
                method: 'DELETE', 
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the refresh token in the request body, matching your backend
                body: JSON.stringify({ token: refreshToken }), 
            });
            
            // The request finishes (success or failure), and we proceed.
            
        } catch (error) {
            console.error('Server-side logout failed:', error);
            // We continue with client-side cleanup regardless of this server error.
        }
    }

    // 2. CLIENT-SIDE CLEANUP (Essential)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); 
    localStorage.removeItem('userData');
    
    // Redirect the user
    navigate('/login');
    }, [navigate]);
  
  // Confirms logout from the modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  // 2. DATA FETCHING AND AUTHENTICATION LOGIC
  useEffect(() => {
    // ⚠️ DEVELOPMENT OVERRIDE: Bypass authentication check
    if (DEV_OVERRIDES_ACTIVE) {
      console.warn('🚨 DEVELOPMENT MODE: Authentication bypassed for dashboard access');
      setUserName(DEV_USER_DATA.name || 'Developer');
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    // PRODUCTION AUTHENTICATION CHECK
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // If neither token exists, force login
    if (!accessToken && !refreshToken) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        // Use the wrapper function for all authenticated requests
        const response = await fetchWithRefresh('/dashboard', { 
            method: 'GET',
        });
        
        // Check if the response is valid before parsing JSON
        if (!response.ok) {
            // Handle non-401 errors (e.g., 403 Forbidden, 500 Internal Error)
            console.error(`Dashboard fetch failed with status: ${response.status}`);
            // If the failure is persistent and not network/refresh-related, force logout
            handleLogout(); 
            return;
        }

        const data = await response.json();
        const user: UserData = data.user;

        if (user) {
          // Save and set display name
          localStorage.setItem('userData', JSON.stringify(user));
          
          // Safe name concatenation logic:
          const nameParts = [user.firstname, user.middlename, user.lastname].filter(Boolean) as string[];
          let displayUsername: string;

          if (nameParts.length > 0) {
            displayUsername = nameParts.join(' ');
          } else if (user.role) {
            displayUsername = user.role.charAt(0).toUpperCase() + user.role.slice(1);
          } else {
            displayUsername = 'Student';
          }
          
          setUserName(displayUsername);
          
        } else {
          console.error('API responded successfully, but user data is missing.');
          handleLogout();
        }
      } catch (error) {
        // This catch handles network errors or the error thrown by fetchWithRefresh 
        // if the session is fully expired (refresh token failed).
        console.error('Error fetching user or session expired:', error);
        // fetchWithRefresh handles the redirect on session expiration, 
        // but we handle network errors here.
        if (!navigator.onLine) {
            alert('Network error. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate, handleLogout]);


  // 3. RENDER LOGIC
  if (isLoading) {
    return (
      <div className="loading-dashboard">
        <div className="spinner"></div>
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dev Warning Banner */}
      {DEV_OVERRIDES_ACTIVE && (
        <div className="warning-banner">
          🚨 DEVELOPMENT MODE: Authentication is bypassed.
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal-content">
            <h2 className="logout-modal-title">Confirm Sign Out</h2>
            <p className="logout-modal-description" id="logout-modal-description">
              Are you sure you want to sign out of your account?
            </p>
            <div className="logout-modal-actions">
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

      {/* Dashboard Header */}
      <header className="header">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <img src={SFACLogo} alt="SFAC Logo" />
          </Link>
          <nav className="nav">
            <ul className="nav-list">
              <li><Link to="/dashboard" className="nav-link active">Dashboard</Link></li>
              <li><Link to="/profile" className="nav-link">Profile</Link></li>
              <li><Link to="/grades" className="nav-link">Grades</Link></li>
            </ul>
          </nav>
          <div className="user-info">
            <span className="user-name" aria-label={`Welcome, ${userName}`}>{userName}</span> 
            <div className="user-avatar" title={userName}>
              <span>{userName.charAt(0)}</span>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="logout-btn"
              aria-label="Sign Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (Customize this area) */}
      <main className="main-content">
        <section className="welcome-section">
          <h1>Welcome Back, {userName}</h1>
          <p>This is your personalized dashboard. Check your profile, grades, and latest announcements.</p>
        </section>
        
        {/* Example Dashboard Modules */}
        <section className="modules-grid">
          <div className="module card">
            <h2>Announcements</h2>
            <p>No new announcements today.</p>
          </div>
          <div className="module card">
            <h2>Course Load</h2>
            <p>You are currently enrolled in 5 courses.</p>
          </div>
          <div className="module card">
            <h2>Quick Links</h2>
            <ul>
              <li><Link to="/profile">View Profile</Link></li>
              <li><Link to="/grades">Check Grades</Link></li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-box">
                <img src={SFACLogo} alt="SFAC Logo" />
              </div>
              <div className="footer-text">
                <p className="footer-text-p">© 2024 SFAC HUB. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;