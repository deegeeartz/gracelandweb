/**
 * Facebook Live Stream Auto-Loader
 * Automatically fetches and displays the most recent live/video content from Facebook page
 */

const FACEBOOK_PAGE_ID = 'RCCGLP4GRACELAND';
const FACEBOOK_PAGE_URL = `https://www.facebook.com/${FACEBOOK_PAGE_ID}`;

// Initialize Facebook SDK
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); 
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Load Facebook live stream embed
function loadFacebookLiveStream() {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    if (!videoWrapper) {
        logger.warn('Video wrapper not found');
        return;
    }

    // Method 1: Facebook Page Plugin (shows latest videos/live streams)
    const pagePluginHTML = `
        <div class="fb-page" 
             data-href="${FACEBOOK_PAGE_URL}"
             data-tabs="timeline"
             data-width="734"
             data-height="500"
             data-small-header="false"
             data-adapt-container-width="true"
             data-hide-cover="false"
             data-show-facepile="false">
            <blockquote cite="${FACEBOOK_PAGE_URL}" class="fb-xfbml-parse-ignore">
                <a href="${FACEBOOK_PAGE_URL}">RCCG Graceland Area HQ</a>
            </blockquote>
        </div>
    `;

    // Method 2: Embedded Video Player (for live streams)
    const videoPlayerHTML = `
        <div class="fb-video" 
             data-href="${FACEBOOK_PAGE_URL}/live"
             data-width="734"
             data-height="500"
             data-show-text="false"
             data-autoplay="false"
             data-allowfullscreen="true">
        </div>
    `;

    // Check if live stream is active, otherwise show page plugin
    checkLiveStatus()
        .then(isLive => {
            if (isLive) {
                logger.success('Live stream detected, loading video player');
                videoWrapper.innerHTML = videoPlayerHTML;
            } else {
                logger.log('No live stream active, showing recent videos');
                videoWrapper.innerHTML = pagePluginHTML;
            }
            
            // Parse Facebook plugins
            if (typeof FB !== 'undefined') {
                FB.XFBML.parse();
            }
        })
        .catch(error => {
            logger.error('Error checking live status:', error);
            // Fallback to page plugin
            videoWrapper.innerHTML = pagePluginHTML;
            if (typeof FB !== 'undefined') {
                FB.XFBML.parse();
            }
        });
}

// Check if page is currently live streaming
async function checkLiveStatus() {
    // Note: This requires Facebook Graph API access token
    // For now, we'll default to showing the page plugin which automatically handles this
    return false; // Default to page plugin
}

// Alternative: Simple iframe embed that shows latest content
function loadSimpleFacebookEmbed() {
    const videoWrapper = document.querySelector('.video-wrapper');
    
    if (!videoWrapper) return;

    // Facebook Page Plugin iframe (automatically shows latest content)
    const iframeHTML = `
        <iframe 
            src="https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK_PAGE_URL)}&tabs=timeline&width=734&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
            width="734"
            height="500"
            style="border:none;overflow:hidden;width:100%;max-width:734px;"
            scrolling="no"
            frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
    `;

    videoWrapper.innerHTML = iframeHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    logger.log('Initializing Facebook live stream...');
    
    // Use simple iframe method (works without SDK/API)
    loadSimpleFacebookEmbed();
    
    // Refresh every 5 minutes to check for new content
    setInterval(() => {
        logger.log('Refreshing Facebook embed...');
        loadSimpleFacebookEmbed();
    }, 5 * 60 * 1000);
});

// Export for manual refresh
window.refreshFacebookLive = loadSimpleFacebookEmbed;
