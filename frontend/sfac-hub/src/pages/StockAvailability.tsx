import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import './StockAvailability.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from "../utils/ProtectedLayout";
import "./dashboard.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import mockStockItems from './mockStockItems';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimization';
import { trackImageLoad, trackImageError } from '../utils/performanceMonitor';

// Define type for stock items
export interface StockItem {
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

// Optimized image component for stock items
const StockItemImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  useEffect(() => {
    const optimized = getOptimizedImageUrl(src, {
      width: 200,
      height: 150,
      quality: 75,
      format: 'webp'
    });
    setOptimizedSrc(optimized);
    setLoadStartTime(Date.now());
  }, [src]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    trackImageLoad(loadStartTime, false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
    trackImageError();
  };

  return (
    <div className={`item-image ${className}`}>
      {!imageLoaded && (
        <div className="image-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      {imageError ? (
        <div className="image-error">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
          </svg>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`optimized-image ${imageLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

const StockAvailability = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationItem, setReservationItem] = useState<StockItem | null>(null);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Preload images for better performance
  useEffect(() => {
    const imageUrls = mockStockItems.map(item => item.image);
    preloadImages(imageUrls).catch(console.error);
  }, []);

  return (
    <ProtectedLayout endpoint="/protected/stock">
      {({ user, isLoading, logout }) => {
          if (isLoading) {
            return (
              <div className="loading-screen">
                <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
                <div className="loading-text">Loading Stock Availability</div>
                <div className="loading-spinner"></div>
              </div>
            );
          }

        // User display name construction happens inside Header component now

        // DITO NA YUNG CODE MO

          // Filter and search logic
  const filteredItems = mockStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = ['All Categories', ...new Set(mockStockItems.map(item => item.category))];
  const statuses = ['All Status', 'Available', 'Low', 'Out'];

  // Handle item card click
  const handleItemClick = (item: StockItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  // Handle reserve button click
  const handleReserveClick = (item: StockItem) => {
    setReservationItem(item);
    setShowReservationModal(true);
    setShowItemModal(false);
  };

  // Get stock level color
  const getStockLevelColor = (status: 'Available' | 'Low' | 'Out') => {
    switch (status) {
      case 'Available': return '#28a745';
      case 'Low': return '#ffc107';
      case 'Out': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get stock level width percentage
  const getStockLevelWidth = (current: number, total: number) => {
    return Math.max((current / total) * 100, 0);
  };



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
            <span className="breadcrumb-current">Stock Availability</span>
          </nav>

          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <div className="page-icon stock-icon">
                <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="page-title">Stock Availability</h1>
                <p className="page-subtitle">Check what's currently available</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="items-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`item-card ${item.status.toLowerCase()}`}
                onClick={() => handleItemClick(item)}
              >
                <StockItemImage src={item.image} alt={item.name} />
                
                <div className="item-content">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-location">📍 {item.location}</p>
                  
                  <div className="stock-info">
                    <div className="stock-level">
                      <div className="stock-level-bar">
                        <div
                          className="stock-level-fill"
                          style={{
                            width: `${getStockLevelWidth(item.currentStock, item.totalStock)}%`,
                            backgroundColor: getStockLevelColor(item.status)
                          }}
                        />
                      </div>
                      <span className="stock-text">
                        {item.currentStock} / {item.totalStock}
                      </span>
                    </div>
                    
                    <div className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status === 'Out' ? 'Out of stock' : item.status}
                    </div>
                  </div>
                  
                  <div className="item-footer">
                    <span className="last-updated">Updated {item.lastUpdated}</span>
                    <button
                      className={`reserve-btn ${item.status === 'Out' ? 'disabled' : ''}`}
                      disabled={item.status === 'Out'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReserveClick(item);
                      }}
                    >
                      {item.status === 'Out' ? 'Out of stock' : 'Reserve Item'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="no-results">
              <p>No items found matching your search criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal-content item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem.name}</h2>
              <button className="close-btn" onClick={() => setShowItemModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="item-detail-image">
                <StockItemImage 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="modal-image"
                />
              </div>
              
              <div className="item-details">
                <p className="item-detail-description">{selectedItem.description}</p>
                
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedItem.category}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedItem.location}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Stock Level:</span>
                  <span className="detail-value">
                    {selectedItem.currentStock} / {selectedItem.totalStock}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedItem.status.toLowerCase()}`}>
                    {selectedItem.status === 'Out' ? 'Out of stock' : selectedItem.status}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{selectedItem.lastUpdated}</span>
                </div>
                
                <div className="stock-level-detail">
                  <div className="stock-level-bar">
                    <div
                      className="stock-level-fill"
                      style={{
                        width: `${getStockLevelWidth(selectedItem.currentStock, selectedItem.totalStock)}%`,
                        backgroundColor: getStockLevelColor(selectedItem.status)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className={`reserve-btn-modal ${selectedItem.status === 'Out' ? 'disabled' : ''}`}
                disabled={selectedItem.status === 'Out'}
                onClick={() => handleReserveClick(selectedItem)}
              >
                {selectedItem.status === 'Out' ? 'Out of stock' : 'Reserve this item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Confirmation Modal */}
      {showReservationModal && reservationItem && (
        <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
          <div className="modal-content reservation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Reservation</h2>
              <button className="close-btn" onClick={() => setShowReservationModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="reservation-item-info">
                <h3>{reservationItem.name}</h3>
                <p>{reservationItem.description}</p>
              </div>
              
              <div className="reservation-warning">
                <p>⚠️ Are you sure you want to reserve this item?</p>
                <p>This action will reduce the available stock by 1 unit.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowReservationModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => {
                  setShowReservationModal(false);
                  // Redirect to MakeReservation page with the selected item ID
                  navigate('/make-reservation', {
                    state: { itemId: reservationItem.id }
                  });
                }}
              >
                Confirm Reservation
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

export default StockAvailability;