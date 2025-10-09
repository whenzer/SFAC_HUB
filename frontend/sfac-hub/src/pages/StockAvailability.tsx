import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import './StockAvailability.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from "../utils/ProtectedLayout";
import "./dashboard.css";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimization';
import { trackImageLoad, trackImageError } from '../utils/performanceMonitor';
import { Atom } from 'react-loading-indicators';
import { TbBrandStocktwits } from 'react-icons/tb';
import { CiCirclePlus } from 'react-icons/ci';
import fetchWithRefresh from '../utils/apiService';

// Define type for stock items
export interface StockItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  currentStock: number;
  totalStock: number;
  status: 'Available' | 'Low' | 'Out';
  updatedAt: string;
  image: string;
}

// Format date function
const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

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
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [additionalStock, setAdditionalStock] = useState<string>('');
  const [newTotalStock, setNewTotalStock] = useState<string>('');
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);
  const [capacityError, setCapacityError] = useState<boolean>(false);
  const [items, setItems] = useState<StockItem[]>([]);
  // Create Product modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    location: '',
    name: '',
    totalStock: '',
    currentStock: '',
    description: '',
    price: '',
    category: '',
    imageBase64: ''
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const readFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFiles = async (filesOrFile: FileList | File | null) => {
    const file = (filesOrFile instanceof File) ? filesOrFile : filesOrFile?.[0] || null;
    if (!file) return;
    const base64 = await readFileToBase64(file);
    setCreateForm(prev => ({ ...prev, imageBase64: base64 }));
    setCreateErrors(prev => ({ ...prev, imageBase64: '' }));
  };

  // Preload product images when products change


  return (
    <ProtectedLayout endpoint="/protected/stock">
      {({ user, isLoading, logout, extraData, refetch}) => {
        const products: StockItem[] = extraData?.products ?? []; 
        useEffect(() => { setItems(products); }, [products]);
          useEffect(() => {
            if (products.length > 0) {
              const imageUrls = products.map((item) => item.image);
              preloadImages(imageUrls).catch(console.error);
            }
          }, [products]);



          
        // DITO NA YUNG CODE MO

          // Filter and search logic
  const filteredItems = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Status' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = ['All Categories', ...new Set(products.map(item => item.category))];
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
    if (total <= 0) return 0;
    return Math.max((current / total) * 100, 0);
  };

  const isPrivileged = (role?: string) => ['admin', 'staff'].includes((role || '').toLowerCase());

  const openRestockForItem = (item: StockItem) => {
    setRestockItem(item);
    setAdditionalStock('');
    setNewTotalStock('');
    setCapacityError(false);
    setShowRestockModal(true);
    setActiveMenuItem(null);
  };

  const exceedsCapacity = (addStr: string, totalStr: string, item: StockItem): boolean => {
    const addQty = parseInt(addStr, 10);
    const totalQty = parseInt(totalStr, 10);
    if (Number.isNaN(addQty) || addQty <= 0) return false;
    const effectiveTotal = !Number.isNaN(totalQty) && totalQty >= 0 ? totalQty : item.totalStock;
    return item.currentStock + addQty > effectiveTotal;
  };

  const handleCreateSubmit = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!createForm.name.trim()) errors.name = 'Name is required';
    if (!createForm.category.trim()) errors.category = 'Category is required';
    if (!createForm.location.trim()) errors.location = 'Location is required';
    const currNum = parseInt(createForm.currentStock, 10);
    if (createForm.currentStock.trim() === '') errors.currentStock = 'Current stock is required';
    else if (Number.isNaN(currNum) || currNum < 0) errors.currentStock = 'Current stock must be a non-negative integer';
    const totalNum = parseInt(createForm.totalStock, 10);
    if (createForm.totalStock.trim() === '') errors.totalStock = 'Total stock is required';
    else if (Number.isNaN(totalNum) || totalNum < 0) errors.totalStock = 'Total stock must be a non-negative integer';
    else if (!Number.isNaN(currNum) && currNum > totalNum) errors.totalStock = 'Total stock cannot be less than current stock';
    const priceNum = parseFloat(createForm.price);
    if (createForm.price.trim() === '') errors.price = 'Price is required';
    else if (Number.isNaN(priceNum) || priceNum < 0) errors.price = 'Price must be a non-negative number';
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    // Submit to server
    try {
      setIsSubmittingCreate(true);

      const response = await fetchWithRefresh('/api/staff/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          category: createForm.category.trim(),
          location: createForm.location.trim(),
          currentStock: currNum,
          totalStock: totalNum,
          description: createForm.description.trim(),
          price: priceNum,
          imageData: createForm.imageBase64 || undefined
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
      // Success
      setShowCreateModal(false);
      setCreateForm({
        location: '',
        name: '',
        totalStock: '',
        currentStock: '',
        description: '',
        price: '',
        category: '',
        imageBase64: ''
      });
      setCreateErrors({});
      await refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };


  const handleRestockSubmit = async () => {
    if (!restockItem) return;
    const addQty = parseInt(additionalStock, 10);
    const totalQty = parseInt(newTotalStock, 10);
    if (Number.isNaN(addQty) && Number.isNaN(totalQty)) {
      alert('Please enter at least one valid number.');
      return;
    }
    // Inline validation: do not exceed total stock when adding to current
    if (exceedsCapacity(additionalStock, newTotalStock, restockItem)) {
      setCapacityError(true);
      return;
    }
    try {
      setIsSubmittingRestock(true);
      // Perform calls based on provided fields
      if (!Number.isNaN(addQty) && addQty > 0) {
        await fetchWithRefresh('/api/staff/products/restock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: restockItem._id, additionalStock: addQty })
        });
      }
      if (!Number.isNaN(totalQty) && totalQty >= 0) {
        await fetchWithRefresh('/api/staff/products/set-total-stock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: restockItem._id, newTotalStock: totalQty })
        });
      }
      // Optimistically update local UI
      setItems(prev => prev.map(it => {
        if (it._id !== restockItem._id) return it;
        const updatedTotal = !Number.isNaN(totalQty) && totalQty >= 0 ? totalQty : it.totalStock;
        const updatedCurrent = !Number.isNaN(addQty) && addQty > 0 ? Math.min(it.currentStock + addQty, updatedTotal) : it.currentStock;
        return { ...it, totalStock: updatedTotal, currentStock: updatedCurrent };
      }));
      setRestockItem(prev => prev ? { ...prev,
        totalStock: (!Number.isNaN(totalQty) && totalQty >= 0) ? totalQty : prev.totalStock,
        currentStock: (!Number.isNaN(addQty) && addQty > 0) ? Math.min(prev.currentStock + addQty, (!Number.isNaN(totalQty) && totalQty >= 0 ? totalQty : prev.totalStock)) : prev.currentStock
      } : prev);
      // Refresh products from server but keep modal open
      await refetch();
    } catch (e) {
      console.error(e);
      alert('Failed to update stock. Please try again.');
    } finally {
      setIsSubmittingRestock(false);
    }
  };

          if (isLoading) {
            return (
              <div className="loading-screen">
                <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
                <div className="loading-text">Loading Stock Availability</div>
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
              {isPrivileged(user?.role) && (
                <button
                  className="confirm-btn btn-with-icon"
                  style={{ marginLeft: 12 }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <CiCirclePlus size={18} />
                  <span>Create New Product</span>
                </button>
              )}
            </div>
          </div>

          {/* Items Grid */}
          <div className="items-grid">
            {filteredItems.map(item => (
              <div
                key={item._id}
                className={`item-card ${item.status.toLowerCase()}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="item-image">
                  <StockItemImage src={item.image} alt={item.name} />
                  {isPrivileged(user?.role) && (
                    <div className="item-menu-overlay" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="three-dot-menu vertical"
                        aria-label="More actions"
                        onClick={() => setActiveMenuItem(activeMenuItem === item._id ? null : item._id)}
                      >
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </button>
                      {activeMenuItem === item._id && (
                        <div className="item-menu-dropdown item-menu-dropdown--overlay">
                          <button className="item-menu-option" onClick={() => openRestockForItem(item)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <TbBrandStocktwits size={18} />
                              <span>Restock</span>
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                    <span className="last-updated">Updated {formatDate(item.updatedAt)}</span>
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
                    {/* Menu moved to image overlay */}
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
                  <span className="detail-value">{formatDate(selectedItem.updatedAt)}</span>
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
                className={`confirm-btn ${isNavigating ? 'loading' : ''}`}
                disabled={isNavigating}
                onClick={() => {
                  setIsNavigating(true);
                  setShowReservationModal(false);
                  // Redirect to MakeReservation page with the selected item ID
                  navigate('/make-reservation', {
                    state: { itemId: reservationItem._id }
                  });
                }}
              >
                {isNavigating ? 'Redirecting...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockItem && (
        <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="modal-content restock-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Restock: {restockItem.name}</h2>
              <button className="close-btn" onClick={() => setShowRestockModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="item-detail-image">
                <StockItemImage 
                  src={restockItem.image} 
                  alt={restockItem.name} 
                  className="modal-image" 
                />
              </div>
              
              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{restockItem.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{restockItem.location}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${restockItem.status.toLowerCase()}`}>
                    {restockItem.status === 'Out' ? 'Out of stock' : restockItem.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{formatDate(restockItem.updatedAt)}</span>
                </div>
                
                <div className="stock-level-detail">
                  <div className="detail-row">
                  <span className="detail-label">Stock Level:</span>
                  <span className="detail-value">{restockItem.currentStock} / {restockItem.totalStock}</span>
                </div>
                  <div className="stock-level-bar">
                    <div
                      className="stock-level-fill"
                      style={{
                        width: `${getStockLevelWidth(restockItem.currentStock, restockItem.totalStock)}%`,
                        backgroundColor: getStockLevelColor(restockItem.status)
                      }}
                    />
                  </div>
                </div>

                <div className="restock-inputs">
                  <div className="input-group">
                    <label htmlFor="additionalStock">Add to current stock</label>
                    <input
                      id="additionalStock"
                      type="number"
                      min="0"
                      placeholder={`e.g., ${Math.max(0, restockItem.totalStock - restockItem.currentStock)}`}
                      value={additionalStock}
                      className={capacityError ? 'input-error' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdditionalStock(val);
                        if (restockItem) {
                          setCapacityError(exceedsCapacity(val, newTotalStock, restockItem));
                        }
                      }}
                    />
                    {capacityError && (
                      <div className="input-error-text">Additional stock exceeds the total stock capacity.</div>
                    )}
                  </div>
                  <div className="input-group">
                    <label htmlFor="newTotalStock">Set new total stock</label>
                    <input
                      id="newTotalStock"
                      type="number"
                      min="0"
                      placeholder={`e.g., ${restockItem.totalStock}`}
                      value={newTotalStock}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewTotalStock(val);
                        if (restockItem) {
                          setCapacityError(exceedsCapacity(additionalStock, val, restockItem));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowRestockModal(false)}>
                Cancel
              </button>
              <button
                className={`confirm-btn ${isSubmittingRestock ? 'loading' : ''}`}
                disabled={isSubmittingRestock || capacityError}
                onClick={handleRestockSubmit}
              >
                {isSubmittingRestock ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header create-modal__header">
              <div className="modal-header-title">
                <span className="modal-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.185 2.136a1 1 0 00-.37 0l-6 1.2A1 1 0 003 4.31V15a1 1 0 00.789.977l6 1.2a1 1 0 00.422 0l6-1.2A1 1 0 0017 15V4.31a1 1 0 00-.815-.974l-6-1.2zM5 6.382l4-1.2v9.436l-4 1.2V6.382zm6 8.236V5.182l4 1.2v9.436l-4-1.2z"/>
                  </svg>
                </span>
                <div>
                  <h2>Create New Product</h2>
                  <p className="modal-subtitle">Add inventory with clear details and an optional image.</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="create-form-grid">
                {/* Section: Basic Info */}
                <div className="form-section-card grid-span-2">
                  <div className="section-title">Basic Information</div>
                  <div className="create-form-grid">
                    <div className="input-group">
                      <label htmlFor="create-name">Name</label>
                      <input id="create-name" type="text" value={createForm.name}
                        className={createErrors.name ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, name: val });
                          setCreateErrors(prev => ({ ...prev, name: !val.trim() ? 'Name is required' : '' }));
                        }} />
                      <small className="field-hint">Product name visible to users.</small>
                      {createErrors.name && <div className="input-error-text">{createErrors.name}</div>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="create-category">Category</label>
                      {(() => {
                        const availableCategories = categories.filter(c => c !== 'All Categories');
                        const showSelect = availableCategories.length > 0 && !useCustomCategory;
                        return (
                          <>
                            {showSelect && (
                              <select
                                id="create-category"
                                value={createForm.category}
                                className={createErrors.category ? 'input-error' : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '__custom__') {
                                    setUseCustomCategory(true);
                                    setCreateForm({ ...createForm, category: '' });
                                    setCreateErrors(prev => ({ ...prev, category: 'Category is required' }));
                                  } else {
                                    setUseCustomCategory(false);
                                    setCreateForm({ ...createForm, category: val });
                                    setCreateErrors(prev => ({ ...prev, category: !val.trim() ? 'Category is required' : '' }));
                                  }
                                }}
                              >
                                <option value="">Select category</option>
                                {availableCategories.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__custom__">Custom category…</option>
                              </select>
                            )}
                            {!showSelect && (
                              <input
                                id="create-category"
                                type="text"
                                placeholder="Enter category"
                                value={createForm.category}
                                className={createErrors.category ? 'input-error' : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCreateForm({ ...createForm, category: val });
                                  setCreateErrors(prev => ({ ...prev, category: !val.trim() ? 'Category is required' : '' }));
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                      {createErrors.category && <div className="input-error-text">{createErrors.category}</div>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="create-location">Location</label>
                      <input id="create-location" type="text" value={createForm.location}
                        className={createErrors.location ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, location: val });
                          setCreateErrors(prev => ({ ...prev, location: !val.trim() ? 'Location is required' : '' }));
                        }} />
                      {createErrors.location && <div className="input-error-text">{createErrors.location}</div>}
                    </div>
                  </div>
                </div>

                {/* Section: Inventory */}
                <div className="form-section-card grid-span-2">
                  <div className="section-title">Inventory</div>
                  <div className="create-form-grid">
                    <div className="input-group">
                      <label htmlFor="create-currentStock">Current Stock</label>
                      <input id="create-currentStock" type="number" min="0" value={createForm.currentStock}
                        className={createErrors.currentStock ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, currentStock: val });
                          const num = parseInt(val, 10);
                          const total = parseInt(createForm.totalStock || '0', 10);
                          let msg = '';
                          if (val.trim() === '') msg = 'Current stock is required';
                          else if (Number.isNaN(num) || num < 0) msg = 'Current stock must be a non-negative integer';
                          else if (!Number.isNaN(total) && num > total) msg = 'Current stock cannot exceed total stock';
                          setCreateErrors(prev => ({ ...prev, currentStock: msg }));
                        }} />
                      {createErrors.currentStock && <div className="input-error-text">{createErrors.currentStock}</div>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="create-totalStock">Total Stock</label>
                      <input id="create-totalStock" type="number" min="0" value={createForm.totalStock}
                        className={createErrors.totalStock ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, totalStock: val });
                          const num = parseInt(val, 10);
                          let msg = '';
                          if (val.trim() === '') msg = 'Total stock is required';
                          else if (Number.isNaN(num) || num < 0) msg = 'Total stock must be a non-negative integer';
                          else if (createForm.currentStock && parseInt(createForm.currentStock, 10) > num) msg = 'Total stock must be ≥ current stock';
                          setCreateErrors(prev => ({ ...prev, totalStock: msg }));
                          const c = parseInt(createForm.currentStock || '0', 10);
                          setCreateErrors(prev => ({ ...prev, currentStock: c > num ? 'Current stock cannot exceed total stock' : prev.currentStock || '' }));
                        }} />
                      {createErrors.totalStock && <div className="input-error-text">{createErrors.totalStock}</div>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="create-price">Price</label>
                      <input id="create-price" type="number" min="0" value={createForm.price}
                        className={createErrors.price ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, price: val });
                          const num = parseFloat(val);
                          setCreateErrors(prev => ({ ...prev, price: val && (Number.isNaN(num) || num < 0) ? 'Price must be a non-negative number' : '' }));
                        }} />
                      <small className="field-hint">Optional. Leave blank if not applicable.</small>
                      {createErrors.price && <div className="input-error-text">{createErrors.price}</div>}
                    </div>
                  </div>
                </div>

                {/* Section: Description & Media */}
                <div className="form-section-card grid-span-2">
                  <div className="section-title">Description & Media</div>
                  <div className="create-form-grid">
                    <div className="input-group grid-span-2">
                      <label htmlFor="create-description">Description</label>
                      <textarea id="create-description" value={createForm.description}
                        className={createErrors.description ? 'input-error' : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCreateForm({ ...createForm, description: val });
                          setCreateErrors(prev => ({ ...prev, description: !val.trim() ? 'Description is required' : '' }));
                        }} />
                      {createErrors.description && <div className="input-error-text">{createErrors.description}</div>}
                    </div>
                    <div className="input-group grid-span-2"
                      onPaste={async (e) => {
                        const items = e.clipboardData?.items;
                        if (!items) return;
                        for (let i = 0; i < items.length; i++) {
                          const item = items[i];
                          if (item.kind === 'file' && item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) { await handleImageFiles(file); break; }
                          }
                        }
                      }}
                    >
                      <label htmlFor="create-image">Image</label>
                      <label htmlFor="create-image" className="file-dropzone" role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (document.getElementById('create-image') as HTMLInputElement)?.click(); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await handleImageFiles(e.dataTransfer?.files || null);
                        }}
                      >
                        <div className="file-dropzone__icon" aria-hidden="true">📷</div>
                        <div>
                          <div className="file-dropzone__title">Click to upload</div>
                          <div className="file-dropzone__hint">PNG, JPG up to 5MB</div>
                        </div>
                      </label>
                      <input id="create-image" ref={fileInputRef} type="file" accept="image/*" className="file-input visually-hidden"
                        onChange={async (e) => {
                          await handleImageFiles(e.target.files);
                        }} />
                      {createErrors.imageBase64 && <div className="input-error-text">{createErrors.imageBase64}</div>}
                      {createForm.imageBase64 && (
                        <div className="image-preview-container">
                          <div className="image-preview-wrapper">
                            <img src={createForm.imageBase64} alt="Selected preview" className="image-preview" />
                            <button
                              type="button"
                              className="image-remove-btn"
                              aria-label="Remove selected image"
                              title="Remove image"
                              onClick={() => setCreateForm({ ...createForm, imageBase64: '' })}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer sticky-modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button
                className={`confirm-btn ${isSubmittingCreate ? 'loading' : ''}`}
                disabled={isSubmittingCreate}
                onClick={handleCreateSubmit}
              >
                {isSubmittingCreate ? 'Creating...' : 'Create Product'}
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