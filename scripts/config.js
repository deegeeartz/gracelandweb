/**
 * Shared Configuration
 * API Base URL configuration for all scripts
 */

// Determine API base URL based on environment
window.API_BASE = (() => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    
    // GitHub Pages - point to Railway backend
    if (hostname.includes('github.io')) {
        return 'https://gracelandweb-production.up.railway.app';
    }
    
    // Production (Railway or custom domain)
    return '';
})();

// Log configuration
if (typeof logger !== 'undefined') {
    logger.log('API Base URL:', window.API_BASE || 'Same origin');
}
