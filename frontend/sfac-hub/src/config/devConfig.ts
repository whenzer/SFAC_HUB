/**
 * DEVELOPMENT CONFIGURATION
 * 
 * ⚠️  WARNING: THIS FILE CONTAINS DEVELOPMENT-ONLY OVERRIDES ⚠️
 * 
 * This configuration file is intended for development purposes only.
 * DO NOT deploy this configuration to production environments.
 * 
 * To disable development overrides:
 * 1. Set ENABLE_DEV_OVERRIDES to false
 * 2. Or remove this file entirely
 * 3. Or set NODE_ENV to 'production'
 * 
 * Current overrides:
 * - Bypasses authentication for dashboard access
 * - Allows direct access to protected routes without login
 */

// Development override flag - SET TO FALSE FOR PRODUCTION
export const ENABLE_DEV_OVERRIDES = true;

// Environment check - automatically disables overrides in production
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

// Final flag that determines if overrides should be active
export const DEV_OVERRIDES_ACTIVE = ENABLE_DEV_OVERRIDES && IS_DEVELOPMENT;

// Development user data for testing
export const DEV_USER_DATA = {
  name: 'Development User',
  email: 'dev@sfac.edu',
  id: 'dev-user-123'
};

// Console warning for development
if (DEV_OVERRIDES_ACTIVE) {
  console.warn('🚨 DEVELOPMENT OVERRIDES ACTIVE 🚨');
  console.warn('Authentication bypass is enabled for development purposes only.');
  console.warn('This should NEVER be active in production!');
}
