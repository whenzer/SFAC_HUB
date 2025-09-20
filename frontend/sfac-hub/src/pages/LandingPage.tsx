import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
        <div className="loading-text">Welcome to SFAC Hub</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-elements"></div>
        <div className="hero-bg-elements"></div>
        
        <div className="hero-container">
          {/* Logo - SF Placeholder */}
          <div className="hero-logo">
          <img src={SFACLogo} alt="SFAC Logo" />
          </div>
          
          {/* Title */}
          <h1 className="hero-title">SFAC Hub</h1>
          
          {/* Subtitle */}
          <h2 className="hero-subtitle">Saint Francis of Assisi College - Bacoor Campus</h2>
          
          {/* Description */}
          <p className="hero-description">
            Your centralized platform for campus resources. Check stock, make reservations, 
            and connect with the community through our integrated lost & found system.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link to="/login" className="hero-btn hero-btn-primary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.114 11.114 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Get Started
            </Link>
            
            <Link to="/dashboard" className="hero-btn hero-btn-secondary">
              View Dashboard
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Everything You Need in One Place</h2>
            <p className="features-subtitle">
              SFAC Hub streamlines campus life by combining essential student services into a single, 
              easy-to-use platform designed for efficiency and convenience.
            </p>
          </div>
          
          <div className="features-grid">
            {/* Stock Availability Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="feature-title">Stock Availability</h3>
              <p className="feature-description">
                Check real-time availability of school resources, uniforms, books, and supplies across campus.
              </p>
              <ul className="feature-list">
                <li>Real-time stock levels</li>
                <li>Multiple locations</li>
                <li>Instant updates</li>
              </ul>
              <button className="feature-btn">
                Explore Feature
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Reservation System Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="feature-title">Reservation System</h3>
              <p className="feature-description">
                Reserve items for pickup with our convenient 3-day deadline system to ensure availability.
              </p>
              <ul className="feature-list">
                <li>3-day pickup window</li>
                <li>Automated reminders</li>
                <li>Confirmed reservations</li>
              </ul>
              <button className="feature-btn">
                Explore Feature
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Lost & Found Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="feature-title">Lost & Found</h3>
              <p className="feature-description">
                Community-driven platform to report lost items and help others find their missing belongings.
              </p>
              <ul className="feature-list">
                <li>Social feed interface</li>
                <li>Admin approval</li>
                <li>Success tracking</li>
              </ul>
              <button className="feature-btn">
                Explore Feature
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="process-container">
          <div className="process-header">
            <h2 className="process-title">Simple Process, Maximum Efficiency</h2>
            <p className="process-subtitle">Get started in just a few easy steps</p>
          </div>
          
          <div className="process-grid">
            {/* Step 1 */}
            <div className="process-step">
              <div className="process-step-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <div className="process-step-number">01</div>
              </div>
              <h3 className="process-step-title">Sign In & Verify</h3>
              <p className="process-step-description">
                Log in with your student/staff credentials and complete account verification
              </p>
            </div>

            {/* Step 2 */}
            <div className="process-step">
              <div className="process-step-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <div className="process-step-number">02</div>
              </div>
              <h3 className="process-step-title">Browse & Reserve</h3>
              <p className="process-step-description">
                Check stock availability and reserve items with our 3-day pickup guarantee
              </p>
            </div>

            {/* Step 3 */}
            <div className="process-step">
              <div className="process-step-icon">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
                <div className="process-step-number">03</div>
              </div>
              <h3 className="process-step-title">Connect & Find</h3>
              <p className="process-step-description">
                Use our community platform to report and recover lost items efficiently
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Streamline Your Campus Experience?</h2>
          <p className="cta-subtitle">
            Join hundreds of students and staff already using SFAC Hub to save time and stay connected.
          </p>
          
          <div className="cta-buttons">
            <Link to="/login" className="cta-btn cta-btn-primary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.114 11.114 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Start Using SFAC Hub
            </Link>
            
            <Link to="/about" className="cta-btn cta-btn-secondary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-box">
                <img src={SFACLogo} alt="SFAC Logo" />
              </div>
              <div className="footer-text">
                <p className="footer-copyright">
                   2024 SFAC Hub - Saint Francis of Assisi College, Bacoor Campus
                </p>
                <p className="footer-developer">
                  Developed by SFAC Students  Making campus life more efficient
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
