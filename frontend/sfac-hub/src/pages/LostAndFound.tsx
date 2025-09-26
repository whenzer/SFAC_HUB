import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';

const LostAndFound = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <ProtectedLayout endpoint="/protected/lostandfound">
      {({ user, isLoading, logout }) => {
        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Lost & Found</div>
              <div className="loading-spinner"></div>
            </div>
          );
        }

        // Safe display name construction
        const nameParts = [
          user?.firstname,
          user?.middlename,
          user?.lastname,
        ].filter(Boolean) as string[];
        let displayName = "Student";

        if (nameParts.length > 0) {
          displayName = nameParts.join(" ");
        } else if (user?.role) {
          displayName =
            user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }

        const confirmLogout = async () => {
          setShowLogoutModal(false);
          await logout(); // logout comes from ProtectedLayout
        };

        return (
          <div className="dashboard">
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
                    <span className="user-name">{displayName}</span>
                    <div className="user-avatar">
                      <span>{displayName.charAt(0)}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowLogoutModal(true)} className="logout-btn" title="Logout">
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
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                  <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">Lost & Found</span>
                </nav>

                {/* Page Header */}
                <div className="page-header">
                  <div className="page-title-section">
                    <div className="page-icon lost-found-icon">
                      <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="page-title">Lost & Found</h1>
                      <p className="page-subtitle">Report or find lost items</p>
                    </div>
                  </div>
                </div>

                {/* Under Development Content */}
                <div className="under-development">
                  <div className="development-card">
                    <div className="development-icon">
                      <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h2 className="development-title">Under Development</h2>
                    <p className="development-description">
                      We're working hard to bring you the Lost & Found feature. This page will allow you to:
                    </p>
                    <ul className="development-features">
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Report lost items with detailed descriptions
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Browse found items to locate your belongings
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Get notified when matching items are found
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Connect with others who found your items
                      </li>
                    </ul>
                    <div className="development-actions">
                      <Link to="/dashboard" className="btn btn-primary">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                        </svg>
                        Back to Dashboard
                      </Link>
                      <Link to="/dashboard/stock" className="btn btn-secondary">
                        Check Stock
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Logout confirmation modal */}
            {showLogoutModal && (
              <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Confirm Logout</h3>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to logout?</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={confirmLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default LostAndFound;
