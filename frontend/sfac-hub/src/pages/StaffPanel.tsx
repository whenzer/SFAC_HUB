import { useState, useEffect } from 'react';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import fetchWithRefresh from '../utils/apiService';
import { Atom } from 'react-loading-indicators';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import './staffPanel.css';

interface Reservation {
  _id: string;
  item: {
    name: string;
    category: string;
    price: number;
  };
  user: {
    _id: string;
    firstname: string;
    middlename?: string;
    lastname: string;
    email: string;
  };
  email: string;
  quantity: number;
  reservationID: string;
  purpose?: string;
  status: string;
  reservedAt: string;
  collected?: boolean;
  collectedAt?: string;
}

const StaffPanel = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('reservedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchReservations = async () => {
    try {
      const response = await fetchWithRefresh('/api/staff/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const collectReservation = async (reservationId: string) => {
    try {
      const response = await fetchWithRefresh(`/api/staff/reservations/${reservationId}/collect`, {
        method: 'PUT'
      });
      if (response.ok) {
        // Refresh reservations
        await fetchReservations();
      } else {
        console.error('Failed to collect reservation');
      }
    } catch (error) {
      console.error('Error collecting reservation:', error);
    }
  };

  const openDetailsModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReservation(null);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    let filtered = reservations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(res =>
        res.user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.reservationID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'reservedAt':
          aVal = new Date(a.reservedAt);
          bVal = new Date(b.reservedAt);
          break;
        case 'user':
          aVal = `${a.user.firstname} ${a.user.lastname}`.toLowerCase();
          bVal = `${b.user.firstname} ${b.user.lastname}`.toLowerCase();
          break;
        case 'item':
          aVal = a.item.name.toLowerCase();
          bVal = b.item.name.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Collected': return 'status-collected';
      case 'Cancelled': return 'status-cancelled';
      case 'Expired': return 'status-expired';
      default: return 'status-expired';
    }
  };

  // Calculate stats
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const collectedReservations = reservations.filter(r => r.status === 'Collected').length;
  const totalItems = reservations.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <ProtectedLayout endpoint="/api/staff">
      {({ user, isLoading: authLoading, logout }) => {
        if (authLoading || isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Staff Panel</div>
              <Atom color="#ffffff" size="medium"/>
            </div>
          );
        }

        return (
          <div className="staff-panel">
            <Header user={user!} logout={logout} className="dashboard-header" hidden={showDetailsModal} />

            <main className="staff-main">
              <div className="staff-container">
                {/* Hero Section */}
                <section className="staff-hero">
                  <h1 className="staff-hero-title">Staff Control Center</h1>
                  <p className="staff-hero-subtitle">Manage reservations, track inventory, and oversee operations with powerful insights</p>
                </section>

                {/* Stats Dashboard */}
                <section className="staff-stats">
                  <div className="stat-card-modernn">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="stat-value">{totalReservations}</div>
                    <div className="stat-label">Total Reservations</div>
                    <div className="stat-trend positive">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Active management
                    </div>
                  </div>

                  <div className="stat-card-modernn">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-value">{pendingReservations}</div>
                    <div className="stat-label">Pending Collection</div>
                    <div className="stat-trend" style={{ color: pendingReservations > 0 ? '#f59e0b' : '#10b981' }}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Requires attention
                    </div>
                  </div>

                  <div className="stat-card-modernn">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="stat-value">{collectedReservations}</div>
                    <div className="stat-label">Items Collected</div>
                    <div className="stat-trend positive">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Successfully processed
                    </div>
                  </div>

                  <div className="stat-card-modernn">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="stat-value">{totalItems}</div>
                    <div className="stat-label">Total Items</div>
                    <div className="stat-trend positive">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Items managed
                    </div>
                  </div>
                </section>

                {/* Controls Section */}
                <section className="staff-controls">
                  <div className="controls-header">
                    <h2 className="ccontrols-title">Reservation Management</h2>
                    <div className="controls-actions">
                      <div className="search-container">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search reservations"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="isearch-input"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-selects"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Collected">Collected</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Expired">Expired</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-selects"
                      >
                        <option value="reservedAt">Sort by Date</option>
                        <option value="user">Sort by User</option>
                        <option value="item">Sort by Item</option>
                        <option value="status">Sort by Status</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-buttonn"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                        <span>Sort</span>
                      </button>
                    </div>
                  </div>

                  <div className="controls-meta">
                    <div className="results-count">
                      Showing {filteredReservations.length} of {reservations.length} reservations
                    </div>
                    <div className="view-togglee">
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Reservations Display */}
                {viewMode === 'cards' ? (
                  <section className="reservations-grid">
                    {filteredReservations.map((reservation) => (
                      <div 
                        key={reservation._id} 
                        className="reservation-card clickable"
                        onClick={() => openDetailsModal(reservation)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="reservation-header">
                          <div>
                            <div className="reservation-id">{reservation.reservationID}</div>
                            <div className={`reservation-status ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </div>
                          </div>
                        </div>

                        <div className="reservation-user">
                          <h3 className="user-namee">
                            {reservation.user.firstname} {reservation.user.lastname}
                          </h3>
                          <p className="user-email">{reservation.user.email}</p>
                        </div>

                        <div className="reservation-item">
                          <h4 className="item-name">{reservation.item.name}</h4>
                          <p className="item-category">{reservation.item.category}</p>
                        </div>

                        <div className="reservation-details">
                          <div className="detail-item">
                            <div className="detail-label">Quantity</div>
                            <div className="ddetail-value">{reservation.quantity}</div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Reserved</div>
                            <div className="ddetail-value">
                              {new Date(reservation.reservedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="reservation-actions">
                          {reservation.status === 'Pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                collectReservation(reservation._id);
                              }}
                              className="action-btnn primary"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              Collect
                            </button>
                          )}
                          <button 
                            className="action-btnn secondary" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsModal(reservation);
                            }}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </section>
                ) : (
                  <section className="reservations-table-container">
                    <table className="reservations-table">
                      <thead className="table-header">
                        <tr>
                          <th>Reservation ID</th>
                          <th>User</th>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {filteredReservations.map((reservation) => (
                          <tr key={reservation._id}>
                            <td>
                              <div className="reservation-id">{reservation.reservationID}</div>
                            </td>
                            <td>
                              <div className="table-user-info">
                                <div className="table-user-namee">
                                  {reservation.user.firstname} {reservation.user.lastname}
                                </div>
                                <div className="table-user-email">{reservation.user.email}</div>
                              </div>
                            </td>
                            <td>
                              <div className="table-item-info">
                                <div className="table-item-name">{reservation.item.name}</div>
                                <div className="table-item-category">{reservation.item.category}</div>
                              </div>
                            </td>
                            <td>{reservation.quantity}</td>
                            <td>
                              <span className={`table-status ${getStatusColor(reservation.status)}`}>
                                {reservation.status}
                              </span>
                            </td>
                            <td>{new Date(reservation.reservedAt).toLocaleDateString()}</td>
                            <td>
                              <div className="table-actions">
                                {reservation.status === 'Pending' && (
                                  <button
                                    onClick={() => collectReservation(reservation._id)}
                                    className="action-btnn primary"
                                  >
                                    Collect
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {/* Empty State */}
                {filteredReservations.length === 0 && (
                  <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="empty-title">No reservations found</h3>
                    <p className="empty-description">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'There are no reservations to display at the moment.'}
                    </p>
                  </div>
                )}
              </div>
            </main>

            <Footer />

            {/* Reservation Details Modal */}
            {showDetailsModal && selectedReservation && (
              <div
                className="reservation-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reservation-modal-title"
                onClick={(e) => e.target === e.currentTarget && closeDetailsModal()}
              >
                <div className="reservation-modal-content">
                  <div className="reservation-modal-header">
                    <div className="reservation-modal-icon">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="reservation-modal-text">
                      <h2 id="reservation-modal-title" className="reservation-modal-title">
                        Reservation Details
                      </h2>
                      <p className="reservation-modal-subtitle">
                        {selectedReservation.reservationID}
                      </p>
                    </div>
                    <button
                      onClick={closeDetailsModal}
                      className="reservation-modal-close"
                      aria-label="Close modal"
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="reservation-modal-body">
                    {/* Status and Actions */}
                    <div className="reservation-status-section">
                      <div className={`reservation-status-large ${getStatusColor(selectedReservation.status)}`}>
                        {selectedReservation.status}
                      </div>
                      <div className="reservation-actions-large">
                        {selectedReservation.status === 'Pending' && (
                          <button
                            onClick={() => {
                              collectReservation(selectedReservation._id);
                              closeDetailsModal();
                            }}
                            className="action-btnn-large primary"
                          >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Mark as Collected
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reservation Info Grid */}
                    <div className="reservation-info-grid">
                      <div className="info-card">
                        <div className="info-card-headerr">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <h3 className='userinf'>User Information</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="info-roww">
                            <span className="info-label">Name:</span>
                            <span className="info-valuee">{selectedReservation.user.firstname} {selectedReservation.user.middlename || ''} {selectedReservation.user.lastname}</span>
                          </div>
                          <div className="info-roww">
                            <span className="info-label">Email:</span>
                            <span className="info-valuee">{selectedReservation.user.email}</span>
                          </div>
                          <div className="info-roww">
                            <span className="info-label">User ID:</span>
                            <span className="info-valuee">{selectedReservation.user._id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-headerr">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <h3>Item Details</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="info-roww">
                            <span className="info-label">Item:</span>
                            <span className="info-valuee">{selectedReservation.item.name}</span>
                          </div>
                          <div className="info-roww">
                            <span className="info-label">Category:</span>
                            <span className="info-valuee">{selectedReservation.item.category}</span>
                          </div>
                          <div className="info-roww">
                            <span className="info-label">Price:</span>
                            <span className="info-valuee">₱{selectedReservation.item.price}</span>
                          </div>
                          <div className="info-roww">
                            <span className="info-label">Quantity:</span>
                            <span className="info-valuee">{selectedReservation.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-headerr">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3>Timeline</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="timeline">
                            <div className="timeline-item">
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <div className="timeline-title">Reservation Created</div>
                                <div className="timeline-date">{new Date(selectedReservation.reservedAt).toLocaleString()}</div>
                              </div>
                            </div>
                            {selectedReservation.status === 'Collected' && selectedReservation.collectedAt && (
                              <div className="timeline-item">
                                <div className="timeline-dot collected"></div>
                                <div className="timeline-content">
                                  <div className="timeline-title">Item Collected</div>
                                  <div className="timeline-date">{new Date(selectedReservation.collectedAt).toLocaleString()}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-headerr">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3>Additional Info</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="info-roww">
                            <span className="info-label">Reservation ID:</span>
                            <span className="info-valuee">{selectedReservation.reservationID}</span>
                          </div>
                          {selectedReservation.purpose && (
                            <div className="info-roww">
                              <span className="info-label">Purpose:</span>
                              <span className="info-valuee">{selectedReservation.purpose}</span>
                            </div>
                          )}
                          <div className="info-roww">
                            <span className="info-label">Total Value:</span>
                            <span className="info-valuee">₱{(selectedReservation.item.price * selectedReservation.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="reservation-modal-footer">
                    <button
                      onClick={closeDetailsModal}
                      className="reservation-modal-btn secondary"
                    >
                      Close
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

export default StaffPanel;