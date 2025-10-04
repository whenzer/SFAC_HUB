import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import './Reservations.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Atom } from 'react-loading-indicators';
import fetchWithRefresh from '../utils/apiService';

// Types

type ReservationStatus = 'Pending' | 'Collected' | 'Cancelled' | 'Expired';

interface ProductRef {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  image: string;
  lastUpdated: string;
}

interface ReservationItem {
  _id: string;
  reservationID: string;
  item: ProductRef;
  email: string;
  quantity: number;
  purpose: string;
  reservedAt: string;
  status: ReservationStatus;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch {
    return iso;
  }
};

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

// Modal Component
interface ReservationModalProps {
  reservation: ReservationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelReservation: (reservationId: string) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ reservation, isOpen, onClose, onCancelReservation }) => {
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  
  if (!isOpen || !reservation) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const handleCancelClick = () => {
    setIsCancelConfirmOpen(true);
  };
  
  const handleConfirmCancel = () => {
    onCancelReservation(reservation._id);
    setIsCancelConfirmOpen(false);
  };
  
  const handleCancelModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsCancelConfirmOpen(false);
    }
  };

  const getStatusDescription = (status: ReservationStatus) => {
    switch (status) {
      case 'Pending':
        return 'Your reservation is pending and awaiting preparation.';
      case 'Collected':
        return 'This item has been successfully collected.';
      case 'Cancelled':
        return 'This reservation was cancelled.';
      case 'Expired':
        return 'This reservation has expired.';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Main Reservation Modal */}
      <div 
        className={`res-modal-backdrop ${isOpen ? 'res-modal-enter' : ''}`}
        onClick={handleBackdropClick}
      >
        <div className="res-modal-container">
          <div className="res-modal-content">
            {/* Header */}
            <div className="res-modal-header">
              <h2 className="res-modal-title">Reservation Details</h2>
              <button 
                className="res-modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="res-modal-body">
              {/* Item Information */}
              <div className="res-modal-section">
                <h3 className="res-modal-section-title">Item Information</h3>
                <div className="res-modal-item">
                  <div className="res-modal-thumb">
                    <img src={reservation.item?.image} alt={reservation.item?.name} />
                  </div>
                  <div className="res-modal-item-info">
                    <h4 className="res-modal-item-name">{reservation.item?.name}</h4>
                    <p className="res-modal-item-description">{reservation.item?.description}</p>
                    <div className="res-modal-item-meta">
                      <span className="res-modal-item-category">{reservation.item?.category}</span>
                      <span className="res-modal-item-location">{reservation.item?.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="res-modal-section">
                <h3 className="res-modal-section-title">Reservation Details</h3>
                <div className="res-modal-details-grid">
                  <div className="res-modal-detail">
                    <span className="res-modal-detail-label">Reservation ID</span>
                    <span className="res-modal-detail-value res-modal-mono">{reservation.reservationID}</span>
                  </div>
                  <div className="res-modal-detail">
                    <span className="res-modal-detail-label">Status</span>
                    <span className={`res-modal-status res-modal-status-${reservation.status.toLowerCase()}`}>
                      {reservation.status}
                    </span>
                  </div>
                  <div className="res-modal-detail">
                    <span className="res-modal-detail-label">Quantity</span>
                    <span className="res-modal-detail-value">{reservation.quantity}</span>
                  </div>
                  <div className="res-modal-detail">
                    <span className="res-modal-detail-label">Reserved Date</span>
                    <span className="res-modal-detail-value">{formatDateTime(reservation.reservedAt)}</span>
                  </div>
                  <div className="res-modal-detail res-modal-detail-full">
                    <span className="res-modal-detail-label">Purpose</span>
                    <span className="res-modal-detail-value">{reservation.purpose || 'Not specified'}</span>
                  </div>
                  <div className="res-modal-detail res-modal-detail-full">
                    <span className="res-modal-detail-label">Email</span>
                    <span className="res-modal-detail-value">{reservation.email}</span>
                  </div>
                </div>
              </div>

              {/* Status Description */}
              <div className="res-modal-section">
                <div className="res-modal-status-description">
                  <div className={`res-modal-status-icon res-modal-status-${reservation.status.toLowerCase()}`}>
                    {reservation.status === 'Pending' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {reservation.status === 'Collected' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {reservation.status === 'Cancelled' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {reservation.status === 'Expired' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="res-modal-status-text">
                    <p>{getStatusDescription(reservation.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="res-modal-footer">
              {reservation.status === 'Pending' && (
                <button 
                  className="res-modal-cancel-btn"
                  onClick={handleCancelClick}
                >
                  Cancel Reservation
                </button>
              )}
              <button 
                className="res-modal-action-btn"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelConfirmOpen && (
        <div 
          className="res-modal-backdrop res-modal-enter"
          onClick={handleCancelModalBackdropClick}
        >
          <div className="res-modal-container res-confirm-modal">
            <div className="res-modal-content">
              <div className="res-modal-header">
                <h2 className="res-modal-title">Confirm Cancellation</h2>
                <button 
                  className="res-modal-close-btn"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="res-modal-body">
                <div className="res-confirm-content">
                  <div className="res-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <h3 className="res-confirm-title">Are you sure you want to cancel this reservation?</h3>
                  <p className="res-confirm-description">
                    This action cannot be undone. Your reservation for "{reservation.item?.name}" will be cancelled immediately.
                  </p>
                </div>
              </div>
              
              <div className="res-modal-footer">
                <button 
                  className="res-modal-action-btn"
                  onClick={() => setIsCancelConfirmOpen(false)}
                >
                  Keep Reservation
                </button>
                <button 
                  className="res-modal-confirm-cancel-btn"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Reservations: React.FC = () => {
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);

  const handleReservationClick = (reservation: ReservationItem) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing the reservation to allow animation
    setTimeout(() => setSelectedReservation(null), 300);
  };

  // Handle cancellation of a reservation
  const handleCancelReservation = async (reservationId: string) => {
    try {
      // Make API call to cancel reservation
      const response = await fetchWithRefresh(`/protected/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel reservation');
      }
      
      // Update local state to reflect cancellation
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === reservationId 
            ? { ...res, status: 'Cancelled' }
            : res
        )
      );
      
      // Update selected reservation if it's the one being cancelled
      if (selectedReservation && selectedReservation._id === reservationId) {
        setSelectedReservation({ 
          ...selectedReservation, 
          status: 'Cancelled' 
        });
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      // In a real application, you would show an error message to the user
    }
  };

  return (
    <ProtectedLayout endpoint="/protected/reservations">
      {({ user, isLoading, logout, extraData }) => {
        // Initialize reservations state if not already set
        if (extraData?.reservations && reservations.length === 0) {
          setReservations(extraData.reservations);
        }
        
        // Use local state if available, otherwise fallback to extraData
        const displayReservations = reservations.length > 0 ? reservations : extraData?.reservations ?? [];

        const counts = useMemo(() => {
          const base = { Pending: 0, Collected: 0, Cancelled: 0, Expired: 0 } as Record<string, number>;
          for (const r of displayReservations) {
            if (r.status === 'Pending') base.Pending += 1;
            if (r.status === 'Collected') base.Collected += 1;
            if (r.status === 'Cancelled') base.Cancelled += 1;
            if (r.status === 'Expired') base.Expired += 1;
          }
          return base;
        }, [displayReservations]);

        const activeReservations = useMemo(
          () => displayReservations
            .filter((r: ReservationItem) => r.status === 'Pending')
            .sort((a: ReservationItem, b: ReservationItem) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()),
          [displayReservations]
        );

        const pastReservations = useMemo(
          () => displayReservations
            .filter((r: ReservationItem) => r.status === 'Collected' || r.status === 'Cancelled' || r.status === 'Expired')
            .sort((a: ReservationItem, b: ReservationItem) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()),
          [displayReservations]
        );

        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Reservations</div>
              <Atom color="#ffffff" size="medium" />
            </div>
          );
        }

        return (
          <div className="dashboard">
            {user && <Header user={user} logout={logout} />}

            <main className="dashboard-main">
              <div className="dashboard-container">
                <nav className="breadcrumb">
                  <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">My Reservations</span>
                </nav>

                <div className="page-header">
                  <div className="page-title-section">
                    <div className="page-icon reservation-icon">
                      <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="page-title">My Reservations</h1>
                      <p className="page-subtitle">View and manage all your item reservations</p>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="res-reservations-stats">
                  <div className="res-stat-card res-fade-up" data-delay="0">
                    <div className="res-stat-title">Pending</div>
                    <div className="res-stat-value">{counts.Pending}</div>
                  </div>
                  <div className="res-stat-card res-fade-up" data-delay="50">
                    <div className="res-stat-title">Collected</div>
                    <div className="res-stat-value">{counts.Collected}</div>
                  </div>
                  <div className="res-stat-card res-fade-up" data-delay="100">
                    <div className="res-stat-title">Cancelled</div>
                    <div className="res-stat-value">{counts.Cancelled}</div>
                  </div>
                  <div className="res-stat-card res-fade-up" data-delay="150">
                    <div className="res-stat-title">Expired</div>
                    <div className="res-stat-value">{counts.Expired}</div>
                  </div>
                </div>

                {/* Active Reservations Section */}
                <section className="res-reservations-section">
                  <div className="res-section-header">
                    <div className="res-section-title-with-icon">
                      <span className="res-dot res-active" />
                      <h2 className="res-section-title">Active Reservations</h2>
                    </div>
                    <span className="res-section-sub">Items currently reserved and awaiting pickup</span>
                  </div>

                  <div className="res-reservations-list">
                    {activeReservations.length === 0 && (
                      <div className="res-empty-state res-fade-in">
                        <div className="res-empty-title">No active reservations</div>
                        <div className="res-empty-sub">Make a reservation from Stock Availability.</div>
                      </div>
                    )}

                    {activeReservations.map((r: ReservationItem, idx: number) => (
                      <div 
                        key={r._id} 
                        className="res-reservation-card res-slide-in res-clickable" 
                        style={{ ['--d' as any]: `${idx * 60}ms` }}
                        onClick={() => handleReservationClick(r)}
                      >
                        <div className="res-reservation-left">
                          <div className="res-thumb">
                            <img src={r.item?.image} alt={r.item?.name} />
                          </div>
                          <div className="res-info">
                            <div className="res-title-row">
                              <div className="res-title">{r.item?.name}</div>
                            </div>
                            <div className="res-sub">Waiting for preparation</div>
                            <div className="res-meta">
                              <div className="res-meta-item">
                                <span className="res-meta-label">Reserved:</span>
                                <span className="res-meta-value">{formatDate(r.reservedAt)}</span>
                              </div>
                              <div className="res-meta-item">
                                <span className="res-meta-label">Purpose:</span>
                                <span className="res-meta-value">{r.purpose || 'N/A'}</span>
                              </div>
                              <div className="res-meta-item">
                                <span className="res-meta-label">Email:</span>
                                <span className="res-meta-value">{r.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="res-reservation-right">
                          <div className="res-status-display">
                            <div className={`res-status-badge-large res-${r.status.toLowerCase()}`}>
                              {r.status}
                            </div>
                            <div className="res-meta-line">
                              <span className="res-small-label">ID:</span>
                              <span className="res-mono">{r.reservationID}</span>
                            </div>
                            <div className="res-meta-line">
                              <span className="res-small-label">Qty:</span>
                              <span className="res-mono">{r.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Past Reservations Section */}
                <section className="res-reservations-section">
                  <div className="res-section-header">
                    <div className="res-section-title-with-icon">
                      <span className="res-dot" />
                      <h2 className="res-section-title">Past Reservations</h2>
                    </div>
                    <span className="res-section-sub">Completed, cancelled, and expired reservations</span>
                  </div>

                  <div className="res-reservations-list">
                    {pastReservations.length === 0 && (
                      <div className="res-empty-state res-fade-in">
                        <div className="res-empty-title">No past reservations</div>
                        <div className="res-empty-sub">Collected, cancelled, or expired reservations will appear here.</div>
                      </div>
                    )}

                    {pastReservations.map((r: ReservationItem, idx: number) => (
                      <div 
                        key={r._id} 
                        className="res-reservation-card res-slide-in res-clickable" 
                        style={{ ['--d' as any]: `${idx * 60}ms` }}
                        onClick={() => handleReservationClick(r)}
                      >
                        <div className="res-reservation-left">
                          <div className="res-thumb">
                            <img src={r.item?.image} alt={r.item?.name} />
                          </div>
                          <div className="res-info">
                            <div className="res-title-row">
                              <div className="res-title">{r.item?.name}</div>
                              <span className={`res-badge res-${r.status.toLowerCase()}`}>{r.status}</span>
                            </div>
                            <div className="res-sub">
                              {r.status === 'Collected' ? 'Item collected' : 
                               r.status === 'Cancelled' ? 'Reservation cancelled' : 
                               'Reservation expired'}
                            </div>
                            <div className="res-meta">
                              <div className="res-meta-item">
                                <span className="res-meta-label">Reserved:</span>
                                <span className="res-meta-value">{formatDate(r.reservedAt)}</span>
                              </div>
                              <div className="res-meta-item">
                                <span className="res-meta-label">Purpose:</span>
                                <span className="res-meta-value">{r.purpose || 'N/A'}</span>
                              </div>
                              <div className="res-meta-item">
                                <span className="res-meta-label">Email:</span>
                                <span className="res-meta-value">{r.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="res-reservation-right">
                          <div className="res-status-display">
                            <div className={`res-status-badge-large res-${r.status.toLowerCase()}`}>
                              {r.status}
                            </div>
                            <div className="res-meta-line">
                              <span className="res-small-label">ID:</span>
                              <span className="res-mono">{r.reservationID}</span>
                            </div>
                            <div className="res-meta-line">
                              <span className="res-small-label">Qty:</span>
                              <span className="res-mono">{r.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </main>

            <Footer />

            {/* Reservation Modal */}
            <ReservationModal 
              reservation={selectedReservation}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onCancelReservation={handleCancelReservation}
            />
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default Reservations;