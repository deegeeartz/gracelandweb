import React, { useState, useEffect } from 'react';

const DEFAULT_FALLBACK_PHOTOS = [
    { image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', title: 'Sunday Worship' },
    { image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80', title: 'Youth Praise' },
    { image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80', title: 'Moments of Grace' },
    { image: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=600&q=80', title: 'Community Outreach' }
];

export default function FloatingGallery() {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function loadPhotos() {
            try {
                // Try session storage first
                const cached = sessionStorage.getItem('graceland_floating_gallery_v2');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < 5 * 60 * 1000 && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
                        if (isMounted) populateSlots(parsed.photos);
                        return;
                    }
                }

                // Fetch from API
                const res = await fetch('/api/gallery/random?limit=8');
                if (res.ok) {
                    const items = await res.json();
                    if (Array.isArray(items) && items.length > 0) {
                        const normalized = items.map(item => ({
                            id: item.id,
                            image: item.image_url,
                            title: item.title || 'Church Life'
                        }));
                        sessionStorage.setItem('graceland_floating_gallery_v2', JSON.stringify({
                            timestamp: Date.now(),
                            photos: normalized
                        }));
                        if (isMounted) populateSlots(normalized);
                        return;
                    }
                }
            } catch (err) {
                console.warn('Could not fetch floating gallery photos, using fallbacks:', err);
            }

            if (isMounted) populateSlots(DEFAULT_FALLBACK_PHOTOS);
        }

        function populateSlots(sourcePhotos) {
            let pool = [...sourcePhotos];
            while (pool.length < 6) {
                pool = pool.concat(sourcePhotos);
            }
            const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 6);
            setPhotos(shuffled);
        }

        loadPhotos();

        return () => {
            isMounted = false;
        };
    }, []);

    if (photos.length === 0) return null;

    return (
        <div className="floating-gallery-bg" aria-hidden="true">
            {photos.map((item, index) => (
                <div 
                    key={index} 
                    className={`floating-gallery-item floating-slot-${index + 1}`}
                >
                    <img 
                        src={item.image} 
                        alt={item.title || 'Graceland'} 
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = DEFAULT_FALLBACK_PHOTOS[index % DEFAULT_FALLBACK_PHOTOS.length].image;
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
