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
import { Atom } from 'react-loading-indicators';

// Define type for stock items
interface StockItem {
  _id: string;
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

const MakeReservation = () => {
  // State for selected item
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [email, setEmail] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [reservedItemName, setReservedItemName] = useState<string>('');
  const [reservedQuantity, setReservedQuantity] = useState<string>('');
  const [isPreSelected, setIsPreSelected] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we need to show the confirmation modal after a page refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastReservation = localStorage.getItem('lastReservation');
      if (lastReservation) {
        try {
          const reservation = JSON.parse(lastReservation);
          setReservationId(reservation.id);
          setReservedItemName(reservation.item || '');
          setReservedQuantity(reservation.quantity || '');
          setShowConfirmationModal(true);
          // Clear the stored reservation after showing the modal
          localStorage.removeItem('lastReservation');
        } catch (error) {
          console.error('Error parsing last reservation:', error);
        }
      }
    }
  }, []);

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

  // Handle outside clicks for modals
  useEffect(() => {
    const handleModalOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay')) {
        setShowSummaryModal(false);
        setShowConfirmationModal(false);
      }
    };

    document.addEventListener('mousedown', handleModalOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleModalOutsideClick);
    };
  }, []);

  // Preload images for better performance
  const preloadImages = async (imageUrls: string[]) => {
    const imagePromises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    await Promise.all(imagePromises);
  };

  // Calculate stock percentage
  const getStockPercentage = (currentStock: number, totalStock: number) => {
    if (totalStock === 0) return 0;
    return Math.round((currentStock / totalStock) * 100);
  };

  // Get status class based on stock
  const getStockStatusClass = (status: StockItem["status"]) => {
    switch (status) {
      case "Out":
        return "out";
      case "Low":
        return "low";
      case "Available":
      default:
        return "available";
    }
  };

  // Handle quantity change with validation
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string, numbers, and backspace
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
      
      // Validate quantity against available stock
      if (e.currentTarget && value !== '') {
        const numValue = parseInt(value);
        const currentItem = e.currentTarget;
        if (numValue > 0) {
          setErrors(prev => {
            const { quantity, ...rest } = prev;
            return rest;
          });
        } else {
          setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }));
        }
      } else {
        setErrors(prev => {
          const { quantity, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    return emailRegex.test(email);
  };

  // Validate the form before showing summary - Now with currentItem parameter for stock validation
  const validateForm = (currentItem: StockItem | null | undefined): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!selectedItem) {
      newErrors.selectedItem = 'Please select an item';
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    } else if (currentItem && parseInt(quantity) > currentItem.currentStock) {
      newErrors.quantity = `Maximum quantity is ${currentItem.currentStock}`;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle review reservation button click - Now passes currentItem to validateForm
  const handleReviewReservation = (currentItem: StockItem | null | undefined) => {
    if (validateForm(currentItem)) {
      setShowSummaryModal(true);
    }
  };
  
  // Handle confirm reservation - Now with actual API call and synchronous reset
  const handleConfirmReservation = async (currentItem: StockItem) => {
    if (!selectedItem || !currentItem || isSubmittingReservation) return;

    // Set loading state immediately to prevent duplicate submissions
    setIsSubmittingReservation(true);

    const newId = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setReservationId(newId);
    
    // Store reservation details to keep showing them in the modal after reset
    const reservationDetails = {
      id: newId,
      item: currentItem.name,
      quantity: quantity,
      email: email
    };

    try {
      // Make actual API call to reserve stock
      const response = await fetch("https://sfac-hub.fly.dev/protected/stock/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Attach token if your ProtectedLayout requires auth
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          reservationID: newId,
          productId: currentItem._id,
          quantity: parseInt(quantity),
          email,
          purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Reservation failed:", data.message);
        alert(data.message || "Reservation failed");
        setIsSubmittingReservation(false); // Reset loading state on error
        return;
      }

      console.log("Reservation successful:", data);

      // Clear all input fields immediately to reflect the reset state
      setSelectedItem(null);
      setQuantity('1');
      setEmail('');
      setPurpose('');
      setErrors({});
      setShowDropdown(false);
      
      // Store reservation details in localStorage temporarily to persist after refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastReservation', JSON.stringify(reservationDetails));
      }
      
      // Show confirmation modal immediately after resetting form fields
      setShowSummaryModal(false);
      setShowConfirmationModal(true);
      
      // Force a refresh of the current page to update stock levels
      // This will show the confirmation modal again after refresh
      window.location.reload();
    } catch (error) {
      console.error("Error reserving product:", error);
      alert("Something went wrong. Please try again.");
      setIsSubmittingReservation(false); // Reset loading state on error
    }
  };
  
  // Reset the form - used when making another reservation
  const resetForm = () => {
    setSelectedItem(null);
    setQuantity('1');
    setEmail('');
    setPurpose('');
    setErrors({});
    setShowDropdown(false);
    setShowConfirmationModal(false);
    setReservedItemName('');
    setReservedQuantity('');
    setIsSubmittingReservation(false);
  };
  
  // Navigate to reservations page
  const handleViewReservations = () => {
    // Reset the form before navigating to clear all input fields
    resetForm();
    navigate('/reservations');
  };

  return (
    <ProtectedLayout endpoint="/protected/stock">
      {({ user, isLoading, logout, extraData }) => {
        const stockItems: StockItem[] = extraData?.products ?? [];
        const currentItem = selectedItem ? stockItems.find(item => item._id === selectedItem) : null;

        // Handle pre-selection of item from navigation state
        useEffect(() => {
          const state = location.state as { itemId?: string } | null;
          if (state && state.itemId) {
            const itemId = state.itemId;
            // Check if the item exists in stockItems and is available
            const item = stockItems.find(item => item._id === itemId);
            if (item && item.currentStock > 0) {
              setSelectedItem(itemId);
              setIsPreSelected(true);
              // Clear the state to prevent re-selection on page refresh
              window.history.replaceState({}, document.title);
            }
          }
        }, [location.state, stockItems]);

        // Preload images for better performance
        useEffect(() => {
          const imageUrls = stockItems.map(item => item.image);
          preloadImages(imageUrls).catch(console.error);
        }, [stockItems]);





        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Make Reservation</div>
              <Atom color="#ffffff" size="medium"/>
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
                  <div className="rreservation-card">
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
                                key={item._id}
                                className={`dropdown-item ${selectedItem === item._id ? 'selected' : ''} ${item.currentStock === 0 ? 'out-of-stock' : ''}`}
                                onClick={() => {
                                  if (item.currentStock > 0) {
                                    setSelectedItem(item._id);
                                    setQuantity('1');
                                    setShowDropdown(false);
                                  }
                                }}
                              >
                                <span>{item.name}</span>
                                <span
                                    className={`dropdown-item-stock-badge ${getStockStatusClass(item.status)}`}
                                  >
                                    {item.status}
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
                                <div className="detail-value">{currentItem._id}</div>
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
                              className={`stock-indicator-fill ${getStockStatusClass(currentItem.status)}`}
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
                        className={`primary-btn ${!selectedItem || !quantity || parseInt(quantity) <= 0 || !email ? 'disabled' : ''}`}
                        onClick={() => handleReviewReservation(currentItem)}
                        disabled={!selectedItem || !quantity || parseInt(quantity) <= 0 || !email}
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
                    
                    <div className="view-reservations-container">
                      <button className="view-reservations-btn" onClick={handleViewReservations}>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        View My Reservations
                      </button>
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
                          className={`stock-indicator-fill ${getStockStatusClass(currentItem.status)}`}
                        
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
                    <button 
                      className="cancel-btn" 
                      onClick={() => setShowSummaryModal(false)}
                      disabled={isSubmittingReservation}
                    >
                      Cancel
                    </button>
                    <button 
                      className={`confirm-btn ${isSubmittingReservation ? 'loading' : ''}`}
                      onClick={() => handleConfirmReservation(currentItem)}
                      disabled={isSubmittingReservation}
                    >
                      {isSubmittingReservation ? (
                        <>
                          Processing...
                        </>
                      ) : (
                        'Confirm Reservation'
                      )}
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
                        {reservedItemName && (
                          <>
                            <div className="ticket-row">
                              <div className="ticket-label">Item</div>
                              <div className="ticket-value">{reservedItemName}</div>
                            </div>
                            <div className="ticket-row">
                              <div className="ticket-label">Quantity</div>
                              <div className="ticket-value">{reservedQuantity}</div>
                            </div>
                          </>
                        )}
                    <div className="ticket-row">
                     
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
