// Environment Configuration
// Automatically detects if running locally or in production

const environment = {
    // Detect environment
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    },

    // API Base URLs
    getApiUrl: () => {
        if (environment.isDevelopment()) {
            // Local development
            return 'http://localhost:3000/api';
        } else {
            // Production - Replace with your actual backend URL
            // IMPORTANT: Update this to your Railway backend URL, NOT GitHub Pages!
            return 'https://gracelandweb-production.up.railway.app/api';
            // Or: 'https://your-app.onrender.com/api'
        }
    },

    // Get base URL (for non-API requests like post.html)
    getBaseUrl: () => {
        if (environment.isDevelopment()) {
            return 'http://localhost:3000';
        } else {
            // Production - this should be your frontend URL (GitHub Pages or Railway)
            return window.location.origin; // Use current domain
        }
    },

    // Get current environment name
    getEnvironment: () => {
        return environment.isDevelopment() ? 'development' : 'production';
    },

    // Configuration object
    config: {
        get apiBaseUrl() {
            return environment.getApiUrl();
        },
        get baseUrl() {
            return environment.getBaseUrl();
        },
        get environment() {
            return environment.getEnvironment();
        },
        get isDev() {
            return environment.isDevelopment();
        }
    }
};

// Export for use in other scripts
window.ENV = environment.config;

// Log current environment
console.log(`🌍 Environment: ${window.ENV.environment}`);
console.log(`🔗 API URL: ${window.ENV.apiBaseUrl}`);
console.log(`🏠 Base URL: ${window.ENV.baseUrl}`);
