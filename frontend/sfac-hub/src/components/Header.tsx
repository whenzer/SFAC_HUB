import { useState } from 'react';
import { Link } from 'react-router-dom';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import './Header.css';

interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any;
}

interface HeaderProps {
  user: UserData;
  logout: () => Promise<void>;
  className?: string;
  hidden?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, logout, className = "dashboard-header", hidden = false }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Safe display name construction - only show first name
  let displayName = "Student";

  if (user?.firstname) {
    displayName = user.firstname;
  } else if (user?.role) {
    displayName = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout(); // logout comes from ProtectedLayout
  };

  return (
    <>
      {/* Header */}
      <header className={className} style={{ display: (hidden || showLogoutModal) ? 'none' : 'block' }}>
        <div className="header-container">
          <div className="header-left">
            <div className="logo-container">
              <Link to="/dashboard" className="logo-link">
                <img src={SFACLogo} alt="SFAC Logo" className="header-logo" />
                <span className="logo-text">SFAC Hub</span>
              </Link>
            </div>
          </div>
          
          <div className="header-right">
            <div className="uuser-info">
              <span className="uuser-name">{displayName}</span>
              <div className="uuser-avatar">
                <span>{displayName.charAt(0)}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="llogout-btn" 
              title="Logout"
              aria-label="Logout"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

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
    </>
  );
};

export default Header;