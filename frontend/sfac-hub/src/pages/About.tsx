import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './landing.css'; // Using the same CSS as Landing page for consistency
import SFACLogo from '../assets/images/SFAC-Logo.png';
import { Atom } from 'react-loading-indicators';

const About = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
    details: string[];
  } | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const openModal = (type: 'vision' | 'mission' | 'values') => {
    const modalData = {
      vision: {
        title: 'Our Vision',
        content: 'To be the leading digital platform that fosters a connected, efficient, and resourceful campus environment where every member of the SFAC community can thrive and succeed.',
        details: [
          'Creating a unified digital ecosystem for all campus activities',
          'Fostering innovation and technological advancement in education',
          'Building bridges between students, faculty, and administration',
          'Establishing SFAC as a model for digital campus transformation',
          'Empowering every community member with accessible technology'
        ]
      },
      mission: {
        title: 'Our Mission',
        content: 'To provide an intuitive, comprehensive platform that centralizes campus resources, enhances community engagement, and streamlines academic and administrative processes for the entire SFAC community.',
        details: [
          'Simplifying access to academic resources and services',
          'Facilitating seamless communication across all departments',
          'Optimizing resource allocation and utilization',
          'Supporting student success through integrated tools',
          'Promoting transparency in campus operations'
        ]
      },
      values: {
        title: 'Our Values',
        content: 'Innovation, community, excellence, and integrity guide everything we do at SFAC Hub. These core values shape our decisions, drive our development, and define our commitment to the SFAC community.',
        details: [
          'Student-centered approach in all our solutions',
          'Continuous improvement and iterative development',
          'Collaborative spirit fostering teamwork',
          'Transparency and open communication',
          'Accessibility and inclusivity for all users',
          'Sustainability and long-term thinking'
        ]
      }
    };
    setModalContent(modalData[type]);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
        <div className="loading-text">Loading About SFAC Hub</div>
        <Atom color="#ffffff" size="medium"/>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Our Story Section (similar to Features Section) */}
      <section className="features-section" style={{ paddingTop: '4rem' }}>
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">About SFAC Hub</h2>
            <p className="features-subtitle">
              From a vision to transform campus life to a comprehensive platform serving the entire SFAC community, 
              discover how SFAC Hub came to be and what drives us forward.
            </p>
          </div>
          
          <div className="features-grid">
            {/* Vision Card */}
            <div className="feature-card" onClick={() => openModal('vision')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="feature-title">Our Vision</h3>
              <p className="feature-description">
                To be the leading digital platform that fosters a connected, efficient, and resourceful campus environment.
              </p>
              <ul className="feature-list">
                <li>Digital transformation</li>
                <li>Campus connectivity</li>
                <li>Student empowerment</li>
              </ul>
              <button className="feature-btn">
                Learn More
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Mission Card */}
            <div className="feature-card" onClick={() => openModal('mission')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="feature-title">Our Mission</h3>
              <p className="feature-description">
                To provide an intuitive platform that centralizes campus resources and enhances community engagement.
              </p>
              <ul className="feature-list">
                <li>Streamlined services</li>
                <li>Enhanced communication</li>
                <li>Resource optimization</li>
              </ul>
              <button className="feature-btn">
                Explore Mission
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Values Card */}
            <div className="feature-card" onClick={() => openModal('values')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="feature-title">Our Values</h3>
              <p className="feature-description">
                Innovation, community, excellence, and integrity guide everything we do at SFAC Hub.
              </p>
              <ul className="feature-list">
                <li>Student-centered approach</li>
                <li>Continuous improvement</li>
                <li>Collaborative spirit</li>
              </ul>
              <button className="feature-btn">
                See Values
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section> 

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Join Our Community</h2>
          <p className="cta-subtitle">
            Be part of the SFAC Hub family and experience a more connected, efficient campus life. 
            Join hundreds of students and staff already making the most of our platform.
          </p>
          
          <div className="cta-buttons">
            <Link to="/login" className="cta-btn cta-btn-primary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.114 11.114 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Start Using SFAC Hub
            </Link>
            
            <Link to="/" className="cta-btn cta-btn-secondary">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Back to Home
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

      {/* Modal */}
      {modalContent && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.5rem'
              }}
            >
              ×
            </button>
            
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937',
              paddingRight: '2rem'
            }}>
              {modalContent.title}
            </h2>
            
            <p style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
              marginBottom: '1.5rem',
              color: '#4b5563'
            }}>
              {modalContent.content}
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Key Focus Areas:
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {modalContent.details.map((detail, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                    fontSize: '1rem',
                    color: '#4b5563'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      marginTop: '0.5rem',
                      marginRight: '0.75rem',
                      flexShrink: 0
                    }}></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={closeModal}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
