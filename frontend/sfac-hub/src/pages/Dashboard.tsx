import { useState } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PerformanceDashboard from '../components/PerformanceDashboard';
import { Atom } from 'react-loading-indicators';

// Define the expected structure for user data (adjust if your data is different)
interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any; // Allows for other properties like email, verified, etc.
}

interface CategoryData {
  Category: string;
  Total: number;
}

interface ProductData {
  ProductName: string;
  Category: string;
  Total: number;
}

const Dashboard = () => {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // Helper function to get consistent colors for categories
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'School Uniforms': '#dc2626',
      'Textbooks': '#10b981',
      'Laboratory Equipment': '#f59e0b',
      'Stationery': '#3b82f6',
      'Electronics': '#8b5cf6',
      'Sports Equipment': '#ec4899',
      'Art Supplies': '#06b6d4',
      'default': '#6b7280'
    };
    
    return colors[category] || colors.default;
  };

  // Helper function to flexibly get property values
  const getProperty = (obj: any, possibleKeys: string[], defaultValue: any = 'Unknown') => {
    if (!obj) return defaultValue;
    
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return defaultValue;
  };

  return (
    <ProtectedLayout endpoint="/protected/dashboard">
      {({ user, isLoading, logout, extraData }) => {
        const perCategory = extraData?.perCategory as CategoryData[];
        const perProduct = extraData?.perProduct as ProductData[];
        const overallTotal = extraData?.perProduct?.reduce(
          (sum: number, item: any) => sum + (item.Total || item.total || 0),
          0
        ) || 0;
        
        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Dashboard</div>
              <Atom color="#ffffff" size="medium"/>
            </div>
          );
        }

        // Safe display name construction
        const nameParts = [
          user?.firstname,
          user?.middlename,
          user?.lastname,
        ].filter(Boolean) as string[];
        let displayName = "Student";

        if (nameParts.length > 0) {
          displayName = nameParts.join(" ");
        } else if (user?.role) {
          displayName =
            user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
        
        return (
          <div className="dashboard">
            {/* Reusable Header Component */}
            {user && <Header user={user} logout={logout} />}

            {/* Main Content */}
            <main className="dashboard-main">
              <div className="dashboard-container">
                {/* Welcome Section */}
                <div className="welcome-section">
                  <h1 className="welcome-title welcome-message">
                    Welcome back, {displayName}! 👋
                  </h1>
                  <p className="welcome-subtitle today-update">
                    Here's what's happening at SFAC today
                  </p>
                </div>

                {/* Quick Actions */}
                <section className="quick-actions-section">
                  <h2 className="section-title">Quick Actions</h2>
                  <p className="section-subtitle feature-access">
                    Access the most common features
                  </p>
                  
                  <div className="quick-actions-grid">
                    {/* Stock Availability Card */}
                    <Link to="/stock-availability" className="dashboard-action-card dashboard-stock-card">
                      <div className="dashboard-card-icon-container">
                        <div className="dashboard-card-icon">
                          <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="dashboard-card-content">
                        <h3 className="dashboard-card-title">Stock Availability</h3>
                        <p className="dashboard-card-description">
                          Check what's currently available
                        </p>
                        <div className="dashboard-card-action">
                          <span>Access</span>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </Link>

                    {/* Make Reservation Card */}
                    <Link to="/make-reservation" className="dashboard-action-card dashboard-reservation-card">
                      <div className="dashboard-card-icon-container">
                        <div className="dashboard-card-icon">
                          <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                      <div className="dashboard-card-content">
                        <h3 className="dashboard-card-title">Make Reservation</h3>
                        <p className="dashboard-card-description">
                          Reserve items for pickup
                        </p>
                        <div className="dashboard-card-action">
                          <span>Access</span>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </Link>

                    {/* Lost & Found Card */}
                    <Link to="/lost-and-found" className="dashboard-action-card dashboard-lost-found-card">
                      <div className="dashboard-card-icon-container">
                        <div className="dashboard-card-icon">
                          <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                      <div className="dashboard-card-content">
                        <h3 className="dashboard-card-title">Lost & Found</h3>
                        <p className="dashboard-card-description">
                          Report or find lost items
                        </p>
                        <div className="dashboard-card-action">
                          <span>Access</span>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                </section>

                {/* Popular Items - Now using real data */}
                <section className="popular-items-section">
                  <h2 className="section-title">Popular Items</h2>
                  <p className="section-subtitle">
                    Most requested items this week
                  </p>
                  
                  {perProduct && perProduct.length > 0 ? (
                    <div className="popular-items-list">
                      {perProduct.slice(0, 4).map((item: any, index: number) => {
                        const productName = getProperty(item, [
                          'ProductName', 'productName', 'Name', 'name', 
                          'Item', 'item', 'Product', 'product', 'title', 'Title'
                        ], 'Unknown Item');
                        
                        const category = getProperty(item, [
                          'Category', 'category', 'Type', 'type', 'group', 'Group'
                        ], 'default');
                        
                        const total = getProperty(item, [
                          'Total', 'total', 'Count', 'count', 'Requests', 'requests',
                          'Quantity', 'quantity', 'Amount', 'amount'
                        ], 0);

                        return (
                          <div key={index} className="popular-item">
                            <div 
                              className="item-indicator"
                              style={{
                                backgroundColor: getCategoryColor(category)
                              }}
                            ></div>
                            <div className="item-info">
                              <span className="item-name">{productName}</span>
                              <span className="item-count">{total} requests</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <p>No popular items data available</p>
                    </div>
                  )}
                </section>

                {/* This Week Stats - Now using real data */}
                <section className="stats-section">
                  <h2 className="section-title">This Week</h2>
                  
                  <div className="stats-grid">
                    <div className="stat-card items-reserved">
                      <div className="stat-number">{overallTotal}</div>
                      <div className="stat-label">Total Items Reserved</div>
                    </div>
                    
                    <div className="stat-card items-found">
                      <div className="stat-number">
                        {perCategory ? perCategory.length : 0}
                      </div>
                      <div className="stat-label">Active Categories</div>
                    </div>
                  </div>
                </section>

                {/* Additional Category Stats */}
                {perCategory && perCategory.length > 0 && (
                  <section className="stats-section">
                    <h2 className="section-title">By Category</h2>
                    
                    <div className="stats-grid category-stats-grid">
                      {perCategory.slice(0, 4).map((category: any, index: number) => {
                        const categoryName = getProperty(category, [
                          'Category', 'category', 'Name', 'name', 'Type', 'type'
                        ], 'Unknown Category');
                        
                        const categoryTotal = getProperty(category, [
                          'Total', 'total', 'Count', 'count', 'Amount', 'amount'
                        ], 0);

                        return (
                          <div key={index} className="stat-card category-stat-card">
                            <div className="stat-number">{categoryTotal}</div>
                            <div className="stat-label">{categoryName}</div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </main>

            {/* Reusable Footer Component */}
            <Footer />
            
            {/* Performance Dashboard */}
            <PerformanceDashboard 
              isVisible={showPerformanceDashboard}
              onClose={() => setShowPerformanceDashboard(false)}
            />
            
            {/* Performance Toggle Button */}
            <button 
              className="performance-toggle-btn"
              onClick={() => setShowPerformanceDashboard(true)}
              title="Open Performance Monitor"
            >
              📊
            </button>
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default Dashboard;