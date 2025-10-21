/**
 * Facebook Video Embed Handler
 * Manages responsive video embedding from Facebook page
 */

document.addEventListener('DOMContentLoaded', function() {
    logger.log('Facebook video embed initialized');
    
    const videoContainer = document.querySelector('.video-embed-container');
    const videoFallback = document.querySelector('.video-fallback');
    
    if (!videoContainer) {
        logger.warn('Video container not found');
        return;
    }
    
    // Check if iframe loads successfully
    const iframe = videoContainer.querySelector('iframe');
    
    if (iframe) {
        iframe.addEventListener('load', function() {
            logger.success('Facebook video loaded');
        });
        
        iframe.addEventListener('error', function() {
            logger.warn('Video failed to load, showing fallback');
            if (videoContainer && videoFallback) {
                videoContainer.style.display = 'none';
                videoFallback.style.display = 'flex';
            }
        });
    }
    
    // Auto-refresh iframe every 5 minutes to check for new content
    setInterval(() => {
        if (iframe) {
            logger.log('Refreshing video embed...');
            const currentSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => {
                iframe.src = currentSrc;
            }, 100);
        }
    }, 5 * 60 * 1000);
});

// Manual refresh function
function refreshFacebookVideo() {
    const iframe = document.querySelector('.video-embed-container iframe');
    if (iframe) {
        logger.log('Manually refreshing video...');
        const currentSrc = iframe.src;
        iframe.src = '';
        setTimeout(() => {
            iframe.src = currentSrc;
        }, 100);
    }
}

// Export for manual use
window.refreshFacebookLive = refreshFacebookVideo;
