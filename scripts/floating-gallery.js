/**
 * Floating Gallery Component - RCCG Graceland Website
 * Displays ambient background photos wandering smoothly across the entire screen.
 * Transparent, behind content, and non-intrusive.
 * Includes client-side session caching to prevent unnecessary database queries and network traffic.
 */

(function() {
    'use strict';

    const CACHE_KEY = 'graceland_floating_gallery_v2';
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

    const DEFAULT_FALLBACK_PHOTOS = [
        { image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', title: 'Sunday Worship' },
        { image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80', title: 'Youth Praise' },
        { image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80', title: 'Moments of Grace' },
        { image: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=600&q=80', title: 'Community Outreach' }
    ];

    /**
     * Retrieve cached photos from sessionStorage if still fresh
     */
    function getSessionCachedPhotos() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const isFresh = (Date.now() - parsed.timestamp) < CACHE_TTL_MS;
            if (isFresh && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
                return parsed.photos;
            }
        } catch (e) {
            // Ignore sessionStorage errors
        }
        return null;
    }

    /**
     * Store photos in sessionStorage
     */
    function setSessionCachedPhotos(photos) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                photos: photos
            }));
        } catch (e) {
            // Ignore quota errors
        }
    }

    /**
     * Fetch random gallery photos with client-side and server-side cache support
     */
    async function loadFloatingGalleryPhotos() {
        const cached = getSessionCachedPhotos();
        if (cached) {
            return cached;
        }

        try {
            const apiUrl = (typeof environment !== 'undefined' && environment.getApiUrl)
                ? `${environment.getApiUrl()}/gallery/random?limit=8`
                : '/api/gallery/random?limit=8';

            const res = await fetch(apiUrl);
            if (res.ok) {
                let items = await res.json();
                if (Array.isArray(items) && items.length > 0) {
                    const normalized = items.map(item => ({
                        id: item.id,
                        image: item.image_url,
                        title: item.title || 'Church Life'
                    }));
                    setSessionCachedPhotos(normalized);
                    return normalized;
                }
            }
        } catch (error) {
            console.warn('Could not fetch gallery for floating cards, using default photos:', error);
        }

        return DEFAULT_FALLBACK_PHOTOS;
    }

    /**
     * Create an ambient background roaming photo item
     */
    function createRoamingItem(item, index) {
        const div = document.createElement('div');
        div.className = `floating-gallery-item floating-slot-${index + 1}`;

        const imageUrl = item.image || item.thumbnail || '';
        const title = item.title || 'Graceland';

        div.innerHTML = `<img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Graceland';">`;

        return div;
    }

    /**
     * Initialize the floating gallery
     */
    async function initFloatingGallery() {
        const container = document.querySelector('.floating-gallery-bg');
        if (!container) return;

        container.innerHTML = '';

        let photos = await loadFloatingGalleryPhotos();

        // Populate 6 roaming slots by cycling if fewer than 6 photos exist
        while (photos.length < 6) {
            photos = photos.concat(photos);
        }

        // Shuffle randomly
        const shuffled = [...photos].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);

        selected.forEach((item, index) => {
            const el = createRoamingItem(item, index);
            container.appendChild(el);
        });
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingGallery);
    } else {
        initFloatingGallery();
    }

    window.refreshFloatingGallery = initFloatingGallery;
})();
