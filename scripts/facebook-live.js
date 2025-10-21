/**
 * Facebook Live Stream Handler
 * Works with Facebook SDK to display page timeline with videos
 */

// Wait for Facebook SDK to load
window.fbAsyncInit = function() {
    FB.init({
        xfbml: true,
        version: 'v18.0'
    });
    
    logger.success('Facebook SDK loaded');
};

// Manual refresh function
function refreshFacebookPlugin() {
    if (typeof FB !== 'undefined') {
        logger.log('Refreshing Facebook plugin...');
        FB.XFBML.parse();
    }
}

// Auto-refresh every 5 minutes
setInterval(() => {
    refreshFacebookPlugin();
}, 5 * 60 * 1000);

// Export for manual use
window.refreshFacebookLive = refreshFacebookPlugin;

logger.log('Facebook live handler initialized');
