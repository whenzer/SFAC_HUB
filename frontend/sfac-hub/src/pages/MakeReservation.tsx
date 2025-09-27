import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './dashboard.css';
import './MakeReservation.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimization';
import { trackImageLoad, trackImageError } from '../utils/performanceMonitor';

// Define type for stock items
interface StockItem {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  currentStock: number;
  totalStock: number;
  status: 'Available' | 'Low' | 'Out';
  lastUpdated: string;
  image: string;
}

// Image optimization component
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  quality?: number;
}> = ({ src, alt, className = '', loading = 'lazy', width, height, quality = 80 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  useEffect(() => {
    // Get optimized image URL
    const optimized = getOptimizedImageUrl(src, {
      width,
      height,
      quality,
      format: 'webp'
    });
    setOptimizedSrc(optimized);
    setLoadStartTime(Date.now());
  }, [src, width, height, quality]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    trackImageLoad(loadStartTime, false); // Track as cache miss for now
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
    trackImageError();
  };

  return (
    <div className={`image-container ${className}`}>
      {!imageLoaded && (
        <div className="image-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      {imageError ? (
        <div className="image-error">
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
          <span>Image unavailable</span>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`optimized-image ${imageLoaded ? 'loaded' : 'loading'}`}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </div>
  );
};

// Import the stock items
import stockItems from './mockStockItems';

const MakeReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State for form fields
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  
  // State for UI interactions
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPreSelected, setIsPreSelected] = useState<boolean>(false);
  
  // Generate a unique reservation ID
  const [reservationId, setReservationId] = useState<string>('');
  
  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle pre-selection of item from navigation state
  useEffect(() => {
    const state = location.state as { itemId?: number } | null;
    if (state && state.itemId) {
      const itemId = state.itemId;
      // Check if the item exists in stockItems and is available
      const item = stockItems.find(item => item.id === itemId);
      if (item && item.currentStock > 0) {
        setSelectedItem(itemId.toString());
        setIsPreSelected(true);
        // Clear the state to prevent re-selection on page refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  // Preload images for better performance
  useEffect(() => {
    const imageUrls = stockItems.map(item => item.image);
    preloadImages(imageUrls).catch(console.error);
  }, []);
  
  // Get current selected item data
  const currentItem = selectedItem ? stockItems.find(item => item.id === parseInt(selectedItem)) : null;
  
  // Get stock percentage for progress bar
  const getStockPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };
  
  // Get status class based on stock
  const getStockStatusClass = (current: number, total: number) => {
    const percentage = getStockPercentage(current, total);
    if (percentage === 0) return 'out';
    if (percentage < 30) return 'low';
    return 'available';
  };
  
  // Handle quantity change with validation
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, numbers, and backspace
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
      
      // Validate quantity against available stock
      if (currentItem && value !== '') {
        const numValue = parseInt(value);
        if (numValue > currentItem.currentStock) {
          setErrors(prev => ({ ...prev, quantity: `Maximum quantity is ${currentItem.currentStock}` }));
        } else if (numValue <= 0) {
          setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }));
        } else {
          setErrors(prev => {
            const { quantity, ...rest } = prev;
            return rest;
          });
        }
      } else {
        setErrors(prev => {
          const { quantity, ...rest } = prev;
          return rest;
        });
      }
    }
  };
  
  // Validate the form before showing summary
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!selectedItem) {
      newErrors.selectedItem = 'Please select an item';
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    } else if (currentItem && parseInt(quantity) > currentItem.currentStock) {
      newErrors.quantity = `Maximum quantity is ${currentItem.currentStock}`;
    }
    
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle review reservation button click
  const handleReviewReservation = () => {
    if (validateForm()) {
      setShowSummaryModal(true);
    }
  };
  
  // Handle confirm reservation
  const handleConfirmReservation = () => {
    // Generate a unique reservation ID
    const newId = 'RES' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setReservationId(newId);
    
    // Show confirmation modal
    setShowSummaryModal(false);
    setShowConfirmationModal(true);
  };
  
  // Reset the form
  const resetForm = () => {
    setSelectedItem(null);
    setQuantity('1');
    setName('');
    setEmail('');
    setPurpose('');
    setErrors({});
    setShowConfirmationModal(false);
  };
  
  // Navigate to reservations page
  const handleViewReservations = () => {
    navigate('/reservations');
  };

  return (
    <ProtectedLayout endpoint="/protected/reservation">
      {({ user, isLoading, logout }) => {
        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Make Reservation</div>
              <div className="loading-spinner"></div>
            </div>
          );
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
                  <span className="breadcrumb-current">Make Reservation</span>
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
                      <h1 className="page-title">Make Reservation</h1>
                      <p className="page-subtitle">Reserve items for pickup</p>
                    </div>
                  </div>
                </div>

                {/* Reservation Form */}
                <div className="reservation-layout">
                  <div className="reservation-card">
                    <div className="section-title">
                      <span className="section-icon">📋</span>
                      Reservation Form
                    </div>
                    
                    {/* Select Item Dropdown */}
                    <div className="form-row">
                      <label className="form-label">
                        Select item
                        {errors.selectedItem && <span className="error-msg"> * {errors.selectedItem}</span>}
                        {isPreSelected && selectedItem && (
                          <span className="preselected-indicator"> ✓ Pre-selected from Stock Availability</span>
                        )}
                      </label>
                      <div className="dropdown-container" ref={dropdownRef}>
                        <div 
                          className={`dropdown-selector ${errors.selectedItem ? 'error' : ''}`}
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <span>{selectedItem ? currentItem?.name : 'Select an item...'}</span>
                          <span>{showDropdown ? '▼' : '▲'}</span>
                        </div>
                        
                        {showDropdown && (
                          <div className="dropdown-menu">
                            {stockItems.map(item => (
                              <div
                                key={item.id}
                                className={`dropdown-item ${selectedItem === item.id.toString() ? 'selected' : ''} ${item.currentStock === 0 ? 'out-of-stock' : ''}`}
                                onClick={() => {
                                  if (item.currentStock > 0) {
                                    setSelectedItem(item.id.toString());
                                    setQuantity('1');
                                    setShowDropdown(false);
                                  }
                                }}
                              >
                                <span>{item.name}</span>
                                <span className={`dropdown-item-stock-badge ${getStockStatusClass(item.currentStock, item.totalStock)}`}>
                                  {item.currentStock === 0 ? 'Out of Stock' : `${item.currentStock} available`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Item Details Panel */}
                    {selectedItem && currentItem && (
                      <div className="item-details-panel fade-in">
                        <div className="details-container">
                          <div className="details-image">
                            <OptimizedImage 
                              src={currentItem.image} 
                              alt={currentItem.name} 
                              className="selected-item-image"
                              loading="eager"
                              width={300}
                              height={200}
                              quality={85}
                            />
                          </div>
                          <div className="details-content">
                            <h3 className="selected-item-name">{currentItem.name}</h3>
                            
                            <div className="detail-grid">
                              <div>
                                <div className="detail-label">Category</div>
                                <div className="detail-value">{currentItem.category}</div>
                              </div>
                              <div>
                                <div className="detail-label">Item ID</div>
                                <div className="detail-value">{currentItem.id}</div>
                              </div>
                              <div>
                                <div className="detail-label">Location</div>
                                <div className="detail-value">{currentItem.location}</div>
                              </div>
                              <div>
                                <div className="detail-label">Status</div>
                                <div className="detail-value">{currentItem.status}</div>
                              </div>
                              <div className="full">
                                <div className="detail-description">
                                  {currentItem.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stock Level Indicator */}
                        <div className="stock-level-indicator">
                          <div className="stock-indicator-title">Stock Availability</div>
                          <div className="stock-indicator-bar">
                            <div 
                              className={`stock-indicator-fill ${getStockStatusClass(currentItem.currentStock, currentItem.totalStock)}`}
                              style={{ width: `${getStockPercentage(currentItem.currentStock, currentItem.totalStock)}%` }}
                            />
                          </div>
                          <div className="stock-indicator-text">
                            <span>Available: <span className="value">{currentItem.currentStock}</span></span>
                            <span>Total: <span className="value">{currentItem.totalStock}</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Reservation Details */}
                    <div className="form-row">
                      <label className="form-label">
                        Quantity
                        {errors.quantity && <span className="error-msg"> * {errors.quantity}</span>}
                      </label>
                      <input
                        type="text"
                        className={`text-input ${errors.quantity ? 'input-error' : ''}`}
                        value={quantity}
                        onChange={handleQuantityChange}
                        placeholder="Enter quantity"
                        min="1"
                        max={currentItem?.currentStock || ''}
                      />
                      {currentItem && (
                        <div className="input-hint">
                          Maximum available: {currentItem.currentStock}
                        </div>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label className="form-label">
                        Your Full Name
                        {errors.name && <span className="error-msg"> * {errors.name}</span>}
                      </label>
                      <input
                        type="text"
                        className={`text-input ${errors.name ? 'input-error' : ''}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="form-row">
                      <label className="form-label">
                        Email Address
                        {errors.email && <span className="error-msg"> * {errors.email}</span>}
                      </label>
                      <input
                        type="email"
                        className={`text-input ${errors.email ? 'input-error' : ''}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="form-row">
                      <label className="form-label">
                        Purpose of Reservation (Optional)
                      </label>
                      <textarea
                        className="text-area"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Briefly describe the purpose of your reservation"
                        rows={4}
                      />
                    </div>
                    
                    <div className="deadline-banner">
                      <span className="banner-icon">⚠️</span>
                      <div>
                        <div className="banner-title">Pickup Deadline</div>
                        <div className="banner-text">
                          You have 3 days to pick up. Uncollected items will be released back to stock.
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="secondary-btn"
                        onClick={() => navigate('/dashboard')}
                      >
                        Cancel
                      </button>
                      <button 
                        className={`primary-btn ${!selectedItem || !quantity || parseInt(quantity) <= 0 ? 'disabled' : ''}`}
                        onClick={handleReviewReservation}
                        disabled={!selectedItem || !quantity || parseInt(quantity) <= 0}
                      >
                        Review Reservation
                      </button>
                    </div>
                  </div>
                  
                  {/* Side Information Panel */}
                  <div className="reservation-sidebar">
                    <div className="info-card">
                      <div className="info-title">Pickup Deadline</div>
                      <div className="info-text">
                        All reserved items must be collected within 3 days or they will be released back to stock.
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-title">Operating Hours</div>
                      <div className="info-text">
                        <ul className="list">
                          <li>Monday - Friday: 8:00 AM - 5:00 PM</li>
                          <li>Saturday: 8:00 AM - 12:00 PM</li>
                          <li>Sunday: Closed</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <div className="info-title">Pickup Requirements</div>
                      <div className="info-text">
                        <ul className="list">
                          <li>Valid student/staff ID</li>
                          <li>Reservation confirmation</li>
                          <li>Purpose verification (if required)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Reservation Summary Modal */}
            {showSummaryModal && selectedItem && currentItem && (
              <div className="modal-overlay" onClick={() => setShowSummaryModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Review Reservation</h2>
                    <button className="close-btn" onClick={() => setShowSummaryModal(false)}>&times;</button>
                  </div>
                  
                  <div className="modal-body">
                    <div className="reservation-summary">
                      <div className="summary-image-container">
                        <OptimizedImage 
                          src={currentItem.image} 
                          alt={currentItem.name} 
                          className="summary-image"
                          loading="eager"
                          width={250}
                          height={150}
                          quality={80}
                        />
                      </div>
                      
                      <div className="summary-details">
                        <h3 className="summary-item-name">{currentItem.name}</h3>
                        
                        <div className="summary-grid">
                          <div>
                            <div className="summary-label">Category</div>
                            <div className="summary-value">{currentItem.category}</div>
                          </div>
                          <div>
                            <div className="summary-label">Location</div>
                            <div className="summary-value">{currentItem.location}</div>
                          </div>
                          <div>
                            <div className="summary-label">Reserved Quantity</div>
                            <div className="summary-value">{quantity}</div>
                          </div>
                          <div>
                            <div className="summary-label">Remaining Stock</div>
                            <div className="summary-value">{currentItem.currentStock - parseInt(quantity)}</div>
                          </div>
                          <div>
                            <div className="summary-label">Reserved By</div>
                            <div className="summary-value">{name}</div>
                          </div>
                          <div>
                            <div className="summary-label">Contact Email</div>
                            <div className="summary-value">{email}</div>
                          </div>
                          {purpose && (
                            <div className="full">
                              <div className="summary-label">Purpose</div>
                              <div className="summary-value">{purpose}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stock Level Indicator in Summary */}
                    <div className="stock-level-indicator">
                      <div className="stock-indicator-title">Remaining Stock Availability</div>
                      <div className="stock-indicator-bar">
                        <div 
                          className={`stock-indicator-fill ${getStockStatusClass(
                            currentItem.currentStock - parseInt(quantity), 
                            currentItem.totalStock
                          )}`}
                          style={{ width: `${getStockPercentage(
                            currentItem.currentStock - parseInt(quantity), 
                            currentItem.totalStock
                          )}%` }}
                        />
                      </div>
                      <div className="stock-indicator-text">
                        <span>Remaining: <span className="value">{currentItem.currentStock - parseInt(quantity)}</span></span>
                        <span>Total: <span className="value">{currentItem.totalStock}</span></span>
                      </div>
                    </div>
                    
                    <div className="warning-message">
                      <span className="warning-icon">⚠️</span>
                      <div className="warning-content">
                        You have 3 days to pick up. Uncollected items will be released back to stock.
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setShowSummaryModal(false)}>
                      Cancel
                    </button>
                    <button className="confirm-btn" onClick={handleConfirmReservation}>
                      Confirm Reservation
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reservation Confirmed Modal */}
            {showConfirmationModal && (
              <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
                <div className="modal-content confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="confirmation-icon">✅</div>
                  <h2 className="confirmation-heading">Reservation Confirmed!</h2>
                  <p className="confirmation-message">
                    Your reservation has been successfully processed. Please collect your item within 3 days.
                  </p>
                  
                  <div className="reservation-ticket">
                    <div className="ticket-row">
                      <div className="ticket-label">Reservation ID</div>
                      <div className="ticket-value">{reservationId}</div>
                    </div>
                    {selectedItem && currentItem && (
                      <>
                        <div className="ticket-row">
                          <div className="ticket-label">Item</div>
                          <div className="ticket-value">{currentItem.name}</div>
                        </div>
                        <div className="ticket-row">
                          <div className="ticket-label">Quantity</div>
                          <div className="ticket-value">{quantity}</div>
                        </div>
                      </>
                    )}
                    <div className="ticket-row">
                      <div className="ticket-label">Reserved By</div>
                      <div className="ticket-value">{name}</div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button className="secondary-btn" onClick={resetForm}>
                      Make another Reservation
                    </button>
                    <button className="primary-btn" onClick={handleViewReservations}>
                      View my Reservations
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reusable Footer Component */}
            <Footer />
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default MakeReservation;
