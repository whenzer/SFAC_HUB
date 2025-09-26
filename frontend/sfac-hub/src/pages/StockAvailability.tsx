import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import './StockAvailability.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from "../utils/ProtectedLayout";
import "./dashboard.css";
import Header from '../components/Header';
import Footer from '../components/Footer';

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

// Mock data for stock items
const mockStockItems: StockItem[] = [ 
  {
    id: 1,
    name: 'School Uniform - Small',
    description: 'Official SFAC uniform shirt, size small',
    category: 'Uniforms',
    location: 'Storage Room A',
    currentStock: 25,
    totalStock: 30,
    status: 'Available',
    lastUpdated: '2 hours ago',
    image: 'https://picsum.photos/200?random=1'
  },
  {
    id: 2,
    name: 'Programming Fundamentals Textbook',
    description: 'Latest edition programming textbook',
    category: 'Books & Materials',
    location: 'Library - Section B',
    currentStock: 3,
    totalStock: 20,
    status: 'Low',
    lastUpdated: '1 day ago',
    image: 'https://picsum.photos/200?random=2'
  },
  {
    id: 3,
    name: 'Scientific Calculator',
    description: 'TI-84 Plus scientific calculator',
    category: 'Laboratory Equipment',
    location: 'Equipment Room',
    currentStock: 0,
    totalStock: 15,
    status: 'Out',
    lastUpdated: '3 days ago',
    image: 'https://picsum.photos/200?random=3'
  },
  {
    id: 4,
    name: 'Chemistry Lab Kit',
    description: 'Complete chemistry experiment kit',
    category: 'Laboratory Equipment',
    location: 'Science Lab 1',
    currentStock: 12,
    totalStock: 15,
    status: 'Available',
    lastUpdated: '1 hour ago',
    image: 'https://picsum.photos/200?random=4'
  },
  {
    id: 5,
    name: 'Art Supplies Bundle',
    description: 'Pencils, erasers, and drawing materials',
    category: 'School Supplies',
    location: 'Art Room',
    currentStock: 8,
    totalStock: 25,
    status: 'Low',
    lastUpdated: '5 hours ago',
    image: 'https://picsum.photos/200?random=5'
  },
  {
    id: 6,
    name: 'School Uniform - Large',
    description: 'Official SFAC uniform shirt, size large',
    category: 'Uniforms',
    location: 'Storage Room A',
    currentStock: 18,
    totalStock: 20,
    status: 'Available',
    lastUpdated: '30 minutes ago',
    image: 'https://picsum.photos/200?random=6'
  }
];

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
            <Header user={user} logout={logout} />

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
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
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
                <img src={selectedItem.image} alt={selectedItem.name} />
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
                  // Handle reservation logic here
                  alert('Item reserved successfully!');
                  setShowReservationModal(false);
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