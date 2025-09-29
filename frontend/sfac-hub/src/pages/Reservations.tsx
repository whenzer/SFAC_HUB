import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import './Reservations.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Atom } from 'react-loading-indicators';

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

const Reservations: React.FC = () => {
  return (
    <ProtectedLayout endpoint="/protected/reservations">
      {({ user, isLoading, logout, extraData }) => {
        const reservations: ReservationItem[] = extraData?.reservations ?? [];

        const counts = useMemo(() => {
          const base = { Pending: 0, Collected: 0, Cancelled: 0, Expired: 0 } as Record<string, number>;
          for (const r of reservations) {
            if (r.status === 'Pending') base.Pending += 1;
            if (r.status === 'Collected') base.Collected += 1;
            if (r.status === 'Cancelled') base.Cancelled += 1;
            if (r.status === 'Expired') base.Expired += 1;
          }
          return base;
        }, [reservations]);

        const activeReservations = useMemo(
          () => reservations
            .filter(r => r.status === 'Pending')
            .sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()),
          [reservations]
        );

        const pastReservations = useMemo(
          () => reservations
            .filter(r => r.status === 'Collected' || r.status === 'Cancelled' || r.status === 'Expired')
            .sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()),
          [reservations]
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

                    {activeReservations.map((r, idx) => (
                      <div key={r._id} className="res-reservation-card res-slide-in" style={{ ['--d' as any]: `${idx * 60}ms` }}>
                        <div className="reservation-left">
                          <div className="res-thumb">
                              <img src={r.item?.image} alt={r.item?.name} />
                            </div>
                            <div className="res-info">
                              <div className="res-title-row">
                                <div className="res-title">{r.item?.name}</div>
                                <span className={`res-badge res-${r.status.toLowerCase()}`}>{r.status}</span>
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
                    ))}
                  </div>
                </section>

                <section className="res-reservations-section">
                  <div className="res-section-header">
                    <div className="res-section-title-with-icon">
                      <span className="res-dot" />
                      <h2 className="res-section-title">Past Reservations</h2>
                    </div>
                    <span className="res-section-sub">Completed and expired reservations</span>
                  </div>

                  <div className="res-reservations-list">
                    {pastReservations.length === 0 && (
                      <div className="res-empty-state res-fade-in">
                        <div className="res-empty-title">No past reservations</div>
                        <div className="res-empty-sub">Collected, cancelled, or expired reservations will appear here.</div>
                      </div>
                    )}

                    {pastReservations.map((r, idx) => (
                      <div key={r._id} className="res-reservation-card res-slide-in" style={{ ['--d' as any]: `${idx * 60}ms` }}>
                        <div className="res-reservation-left">
                          <div className="res-thumb">
                            <img src={r.item?.image} alt={r.item?.name} />
                          </div>
                          <div className="res-info">
                            <div className="res-title-row">
                              <div className="res-title">{r.item?.name}</div>
                              <span className={`res-badge res-${r.status.toLowerCase()}`}>{r.status}</span>
                            </div>
                            <div className="res-sub">{r.status === 'Collected' ? 'Collected' : r.status === 'Cancelled' ? 'Cancelled' : 'Expired'}</div>
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
                    ))}
                  </div>
                </section>
              </div>
            </main>

            <Footer />
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default Reservations;