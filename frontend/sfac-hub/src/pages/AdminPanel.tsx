import { useState, useEffect } from 'react';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import fetchWithRefresh from '../utils/apiService';
import { Atom } from 'react-loading-indicators';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import './adminPanel.css';

interface User {
  _id: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  role: string;
  verifiedEmail: boolean;
  verifiedID: boolean;
  idpic: {
    filename: string;
    image: string;
  };
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('firstname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithRefresh('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      const response = await fetchWithRefresh(`/api/admin/users/verify/${userId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        console.error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response = await fetchWithRefresh(`/api/admin/users/delete/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetUserPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password for the user:');
    if (!newPassword) return;
    try {
      const response = await fetchWithRefresh(`/api/admin/users/reset-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });
      if (response.ok) {
        alert('Password reset successfully');
      } else {
        console.error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const openDetailsModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified') {
        filtered = filtered.filter(user => user.verifiedEmail && user.verifiedID);
      } else if (verificationFilter === 'unverified') {
        filtered = filtered.filter(user => !user.verifiedEmail || !user.verifiedID);
      } else if (verificationFilter === 'email-only') {
        filtered = filtered.filter(user => user.verifiedEmail && !user.verifiedID);
      } else if (verificationFilter === 'id-only') {
        filtered = filtered.filter(user => !user.verifiedEmail && user.verifiedID);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'firstname':
          aVal = `${a.firstname} ${a.lastname}`.toLowerCase();
          bVal = `${b.firstname} ${b.lastname}`.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'verified':
          aVal = (a.verifiedEmail && a.verifiedID) ? 1 : 0;
          bVal = (b.verifiedEmail && b.verifiedID) ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, verificationFilter, sortBy, sortOrder]);

  const getVerificationStatus = (user: User) => {
    if (user.verifiedEmail && user.verifiedID) return 'Fully Verified';
    if (user.verifiedEmail) return 'Email Verified';
    if (user.verifiedID) return 'ID Verified';
    return 'Unverified';
  };

  const getVerificationColor = (user: User) => {
    if (user.verifiedEmail && user.verifiedID) return 'verified-full';
    if (user.verifiedEmail || user.verifiedID) return 'verified-partial';
    return 'verified-none';
  };

  // Calculate stats
  const totalUsers = users.length;
  const fullyVerifiedUsers = users.filter(u => u.verifiedEmail && u.verifiedID).length;
  const partiallyVerifiedUsers = users.filter(u => u.verifiedEmail !== u.verifiedID).length;
  const unverifiedUsers = users.filter(u => !u.verifiedEmail && !u.verifiedID).length;

  return (
    <ProtectedLayout endpoint="/api/admin">
      {({ user, isLoading: authLoading, logout }) => {
        if (authLoading || isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Admin Panel</div>
              <Atom color="#ffffff" size="medium"/>
            </div>
          );
        }

        return (
          <div className="admin-panel">
            <Header user={user!} logout={logout} className="dashboard-header" hidden={showDetailsModal} />

            <main className="admin-main">
              <div className="admin-container">
                {/* Hero Section */}
                <section className="admin-hero">
                  <h1 className="admin-hero-title">Admin Control Center</h1>
                  <p className="admin-hero-subtitle">Manage users, verify accounts, and oversee system administration</p>
                </section>

                {/* Stats Dashboard */}
                <section className="admin-stats">
                  <div className="stat-card-modern">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="stat-value">{totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-trend positive">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Registered users
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-value">{fullyVerifiedUsers}</div>
                    <div className="stat-label">Fully Verified</div>
                    <div className="stat-trend positive">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Complete verification
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="stat-value">{partiallyVerifiedUsers}</div>
                    <div className="stat-label">Partial Verification</div>
                    <div className="stat-trend warning">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Needs attention
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="stat-icon-container">
                      <svg className="stat-iconn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="stat-value">{unverifiedUsers}</div>
                    <div className="stat-label">Unverified</div>
                    <div className="stat-trend error">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pending verification
                    </div>
                  </div>
                </section>

                {/* Controls Section */}
                <section className="admin-controls">
                  <div className="controls-header">
                    <h2 className="controls-title">User Management</h2>
                    <div className="controls-actions">
                      <div className="search-container">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>

                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Roles</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>

                      <select
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Verification</option>
                        <option value="verified">Fully Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="email-only">Email Only</option>
                        <option value="id-only">ID Only</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                      >
                        <option value="firstname">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="role">Sort by Role</option>
                        <option value="verified">Sort by Verification</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-button"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                        <span>Sort</span>
                      </button>
                    </div>
                  </div>

                  <div className="controls-meta">
                    <div className="results-count">
                      Showing {filteredUsers.length} of {users.length} users
                    </div>
                    <div className="view-toggle">
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

                {/* Users Display */}
                {viewMode === 'cards' ? (
                  <section className="users-grid">
                    {filteredUsers.map((user) => (
                      <div key={user._id} className="user-card" onClick={() => openDetailsModal(user)}>
                        <div className="user-header">
                          <div className="user-avatarr">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="user-status-container">
                            <div className={`user-verification ${getVerificationColor(user)}`}>
                              {getVerificationStatus(user)}
                            </div>
                            <div className={`user-role-badge role-${user.role.toLowerCase()}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="user-info">
                          <h3 className="user-namme">
                            {user.firstname} {user.middlename || ''} {user.lastname}
                          </h3>
                          <p className="user-emaill">{user.email}</p>
                        </div>

                        <div className="user-details">
                          <div className="detail-item">
                            <div className="detail-label">Email Verified</div>
                            <div className="detail-valuee">
                              {user.verifiedEmail ? (
                                <span className="verified-badge">✓</span>
                              ) : (
                                <span className="unverified-badge">✗</span>
                              )}
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">ID Verified</div>
                            <div className="detail-valuee">
                              {user.verifiedID ? (
                                <span className="verified-badge">✓</span>
                              ) : (
                                <span className="unverified-badge">✗</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="user-actions">
                          <button className="action-btn secondary" onClick={() => openDetailsModal(user)}>
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
                  <section className="users-table-container">
                    <table className="users-table">
                      <thead className="table-header">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Verification</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {filteredUsers.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="table-user-info">
                                <div className="table-user-namme">
                                  {user.firstname} {user.middlename || ''} {user.lastname}
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="table-role">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td>
                              <span className={`table-verification ${getVerificationColor(user)}`}>
                                {getVerificationStatus(user)}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="action-btn secondary" onClick={() => openDetailsModal(user)}>
                                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                  </svg>
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                )}

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                  <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="empty-title">No users found</h3>
                    <p className="empty-description">
                      {searchTerm || roleFilter !== 'all' || verificationFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'There are no users to display at the moment.'}
                    </p>
                  </div>
                )}
              </div>
            </main>

            <Footer />

            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
              <div
                className="user-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-modal-title"
                onClick={(e) => e.target === e.currentTarget && closeDetailsModal()}
              >
                <div className="user-modal-content">
                  <div className="user-modal-header">
                    <div className="user-modall-icon">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="user-modal-text">
                      <h2 id="user-modal-title" className="user-modal-title">
                        User Details
                      </h2>
                      <p className="user-modal-subtitle">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </p>
                    </div>
                    <button
                      onClick={closeDetailsModal}
                      className="user-modal-close"
                      aria-label="Close modal"
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="user-modal-body">
                    {/* Verification Status and Actions */}
                    <div className="user-status-section">
                      <div className={`user-status-large ${getVerificationColor(selectedUser)}`}>
                        {getVerificationStatus(selectedUser)}
                      </div>
                      <div className="user-actions-large">
                        {(!selectedUser.verifiedEmail || !selectedUser.verifiedID) && (
                          <button
                            onClick={() => {
                              verifyUser(selectedUser._id);
                              closeDetailsModal();
                            }}
                            className="action-btn-large primary"
                          >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Verify User
                          </button>
                        )}
                        <button
                          onClick={() => resetUserPassword(selectedUser._id)}
                          className="action-btn-large warning"
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                          </svg>
                          Reset Password
                        </button>
                        <button
                          onClick={() => {
                            deleteUser(selectedUser._id);
                            closeDetailsModal();
                          }}
                          className="action-btn-large danger"
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          Delete User
                        </button>
                      </div>
                    </div>

                    {/* User Info Grid */}
                    <div className="user-info-grid">
                      <div className="info-card">
                        <div className="info-card-header">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <h3>Personal Information</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="info-row">
                            <span className="info-label">Full Name:</span>
                            <span className="info-value">{selectedUser.firstname} {selectedUser.middlename || ''} {selectedUser.lastname}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{selectedUser.email}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Role:</span>
                            <span className="info-value">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">User ID:</span>
                            <span className="info-value">{selectedUser._id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-header">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3>Verification Status</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="info-row">
                            <span className="info-label">Email Verified:</span>
                            <span className="info-value">
                              {selectedUser.verifiedEmail ? (
                                <span className="verified-text">✓ Verified</span>
                              ) : (
                                <span className="unverified-text">✗ Not Verified</span>
                              )}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">ID Verified:</span>
                            <span className="info-value">
                              {selectedUser.verifiedID ? (
                                <span className="verified-text">✓ Verified</span>
                              ) : (
                                <span className="unverified-text">✗ Not Verified</span>
                              )}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Overall Status:</span>
                            <span className="info-value">
                              <span className={`status-badge ${getVerificationColor(selectedUser)}`}>
                                {getVerificationStatus(selectedUser)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-card-header">
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3>ID Picture</h3>
                        </div>
                        <div className="info-card-content">
                          <div className="id-picture-container">
                            <img
                              src={selectedUser.idpic.image}
                              alt="User ID"
                              className="id-picture"
                            />
                            <p className="id-filename">{selectedUser.idpic.filename}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="user-modal-footer">
                    <button
                      onClick={closeDetailsModal}
                      className="user-modal-btn secondary"
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

export default AdminPanel;