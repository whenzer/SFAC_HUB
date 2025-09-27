import React, { useState, useEffect } from 'react';
import { getPerformanceMetrics, getPerformanceReport, getMemoryUsage, getNetworkInfo } from '../utils/performanceMonitor';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [memoryUsage, setMemoryUsage] = useState(getMemoryUsage());
  const [networkInfo, setNetworkInfo] = useState(getNetworkInfo());

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setMetrics(getPerformanceMetrics());
        setMemoryUsage(getMemoryUsage());
        setNetworkInfo(getNetworkInfo());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="performance-dashboard-overlay" onClick={onClose}>
      <div className="performance-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="performance-header">
          <h3>Performance Monitor</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="performance-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Page Load Time</div>
              <div className="metric-value">{metrics.pageLoadTime}ms</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Avg Image Load</div>
              <div className="metric-value">{Math.round(metrics.imageLoadTime)}ms</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Cache Hit Rate</div>
              <div className="metric-value">{metrics.cacheHitRate.toFixed(1)}%</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Total Images</div>
              <div className="metric-value">{metrics.totalImages}</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Failed Images</div>
              <div className="metric-value error">{metrics.failedImages}</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Success Rate</div>
              <div className="metric-value">
                {metrics.totalImages > 0 
                  ? ((metrics.totalImages - metrics.failedImages) / metrics.totalImages * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>

          {memoryUsage && (
            <div className="memory-section">
              <h4>Memory Usage</h4>
              <div className="memory-info">
                <div>Used: {formatBytes(memoryUsage.usedJSHeapSize)}</div>
                <div>Total: {formatBytes(memoryUsage.totalJSHeapSize)}</div>
                <div>Limit: {formatBytes(memoryUsage.jsHeapSizeLimit)}</div>
              </div>
            </div>
          )}

          {networkInfo && (
            <div className="network-section">
              <h4>Network Info</h4>
              <div className="network-info">
                <div>Connection: {networkInfo.effectiveType}</div>
                <div>Downlink: {networkInfo.downlink} Mbps</div>
                <div>RTT: {networkInfo.rtt}ms</div>
                <div>Save Data: {networkInfo.saveData ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          <div className="performance-report">
            <h4>Performance Report</h4>
            <pre className="report-text">{getPerformanceReport()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
