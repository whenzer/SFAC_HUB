import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Atom } from 'react-loading-indicators';

const Reservations = () => {
  return (
    <ProtectedLayout endpoint="/protected/reservations">
      {({ user, isLoading, logout }) => {
        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Reservations</div>
              <Atom color="#ffffff" size="medium"/>
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

        return (
          <div className="dashboard">
            {/* Reusable Header Component */}
            {user && <Header user={user} logout={logout} />}

            {/* Main Content */}
            <main className="dashboard-main">
              <div className="dashboard-container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                  <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">My Reservations</span>
                </nav>

                {/* Page Header */}
                <div className="page-header">
                  <div className="page-title-section">
                    <div className="page-icon reservation-icon">
                      <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="page-title">My Reservations</h1>
                      <p className="page-subtitle">Manage and track your equipment reservations</p>
                    </div>
                  </div>
                </div>

                {/* Under Development Content */}
                <div className="under-development">
                  <div className="development-card">
                    <div className="development-icon">
                      <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.98 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h2 className="development-title">Under Development</h2>
                    <p className="development-description">
                      We're working hard to bring you the Reservations feature. This page will allow you to:
                    </p>
                    <ul className="development-features">
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        View all your current and past reservations
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Track the status of your pending reservations
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Cancel or modify existing reservations
                      </li>
                      <li>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Get notifications about reservation expirations
                      </li>
                    </ul>
                    <div className="development-actions">
                      <Link to="/dashboard" className="btn btn-primary">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                        </svg>
                        Back to Dashboard
                      </Link>
                      <Link to="/make-reservation" className="btn btn-secondary">
                        Make a Reservation
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Reusable Footer Component */}
            <Footer />
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default Reservations;