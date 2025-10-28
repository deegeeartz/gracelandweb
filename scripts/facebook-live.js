/**
 * Facebook Video Embed Handler
 * Dynamically fetches and displays latest video from Facebook timeline
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

document.addEventListener('DOMContentLoaded', function() {
    logger.log('Facebook video embed initialized');
    
    const videoContainer = document.querySelector('.video-embed-container');
    const videoFallback = document.querySelector('.video-fallback');
    
    if (!videoContainer) {
        logger.warn('Video container not found');
        return;
    }
    
    // Fetch and load latest video
    loadLatestVideo();
    
    // Auto-refresh every 5 minutes to check for new content
    setInterval(() => {
        loadLatestVideo();
    }, 5 * 60 * 1000);
});

/**
 * Fetch and load the latest video from Facebook
 */
async function loadLatestVideo() {
    const videoContainer = document.querySelector('.video-embed-container');
    const iframe = videoContainer?.querySelector('iframe');
    const videoFallback = document.querySelector('.video-fallback');
    
    if (!iframe) {
        logger.warn('Video iframe not found');
        return;
    }
    
    try {
        logger.log('Fetching latest Facebook video...');
        
        const response = await fetch(`${API_BASE}/api/facebook/latest-video`);
        const data = await response.json();
        
        if (data.success && data.video && data.video.embedUrl) {
            const newUrl = data.video.embedUrl;
            
            // Only update if URL has changed
            if (iframe.src !== newUrl) {
                logger.success('Loading new Facebook video:', data.video.id || 'latest');
                
                // Update iframe src
                iframe.src = '';
                setTimeout(() => {
                    iframe.src = newUrl;
                }, 100);
                
                // Hide fallback, show video
                if (videoContainer && videoFallback) {
                    videoContainer.style.display = 'block';
                    videoFallback.style.display = 'none';
                }
            } else {
                logger.log('Video URL unchanged, keeping current video');
            }
        } else {
            logger.warn('No video available, showing fallback');
            if (videoContainer && videoFallback) {
                videoContainer.style.display = 'none';
                videoFallback.style.display = 'flex';
            }
        }
    } catch (error) {
        logger.error('Failed to fetch Facebook video:', error.message);
        // Keep current video on error
    }
}

// Manual refresh function
function refreshFacebookVideo() {
    logger.log('Manually refreshing video...');
    loadLatestVideo();
}

// Export for manual use
window.refreshFacebookLive = refreshFacebookVideo;
window.loadLatestVideo = loadLatestVideo;

