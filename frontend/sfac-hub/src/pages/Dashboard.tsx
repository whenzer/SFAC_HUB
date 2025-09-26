import { useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Define the expected structure for user data (adjust if your data is different)
interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any; // Allows for other properties like email, verified, etc.
}

const Dashboard = () => {
  return (
    <ProtectedLayout endpoint="/protected/dashboard">
      {({ user, isLoading, logout }) => {
        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Dashboard</div>
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
        
        // User display name construction happens inside Header component now;

        
          return (
    <div className="dashboard">
      {/* Reusable Header Component */}
      <Header user={user} logout={logout} />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {displayName}! 👋
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

      {/* Logout modal is now handled by Header component */}
      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
}
      }
    </ProtectedLayout>
  );
}




export default Dashboard;