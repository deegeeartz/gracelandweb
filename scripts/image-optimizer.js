/**
 * Optimized Image Component with Lazy Loading
 * Handles Cloudinary URLs, responsive images, and progressive loading
 */

class OptimizedImage {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // Set up Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px' // Start loading 50px before image is visible
                }
            );

            // Observe all lazy images
            this.observeLazyImages();
        } else {
            // Fallback for browsers without Intersection Observer
            this.loadAllImages();
        }
    }

    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        lazyImages.forEach(img => {
            this.observer.observe(img);
        });
    }

    loadImage(img) {
        const src = img.dataset.src || img.src;
        const srcset = img.dataset.srcset;

        // Create a new image to preload
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Swap to high-quality image with fade-in effect
            img.src = src;
            if (srcset) {
                img.srcset = srcset;
            }
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
        };

        tempImg.onerror = () => {
            console.error('Failed to load image:', src);
            img.classList.add('error');
        };

        // Start loading
        tempImg.src = src;
        if (srcset) {
            tempImg.srcset = srcset;
        }
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    /**
     * Generate optimized image HTML
     * @param {Object} options - Image options
     * @returns {string} HTML string
     */
    static generateHTML(options) {
        const {
            url,
            urls = {},
            alt = '',
            className = '',
            width,
            height,
            lazy = true,
            placeholder = true
        } = options;

        // If Cloudinary URLs available, use responsive images
        if (urls.webp && urls.medium) {
            const srcset = [
                `${urls.webp.small} 400w`,
                `${urls.webp.medium} 800w`,
                `${urls.webp.large} 1200w`
            ].join(', ');

            const fallbackSrcset = [
                `${urls.small} 400w`,
                `${urls.medium} 800w`,
                `${urls.large} 1200w`
            ].join(', ');

            // Generate LQIP (Low Quality Image Placeholder)
            const lqip = placeholder ? this.generateLQIP(url) : url;

            return `
                <picture class="optimized-image ${className}">
                    <source 
                        type="image/webp" 
                        ${lazy ? 'data-srcset' : 'srcset'}="${srcset}"
                        sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
                    >
                    <source 
                        type="image/jpeg" 
                        ${lazy ? 'data-srcset' : 'srcset'}="${fallbackSrcset}"
                        sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
                    >
                    <img 
                        src="${lqip}"
                        ${lazy ? `data-src="${urls.medium}"` : ''}
                        alt="${alt}"
                        ${width ? `width="${width}"` : ''}
                        ${height ? `height="${height}"` : ''}
                        ${lazy ? 'loading="lazy"' : ''}
                        class="optimized-img"
                    >
                </picture>
            `;
        }

        // Fallback for regular URLs
        return `
            <img 
                src="${placeholder ? this.generateLQIP(url) : url}"
                ${lazy ? `data-src="${url}"` : ''}
                alt="${alt}"
                ${width ? `width="${width}"` : ''}
                ${height ? `height="${height}"` : ''}
                ${lazy ? 'loading="lazy"' : ''}
                class="optimized-img ${className}"
            >
        `;
    }

    /**
     * Generate low quality image placeholder (blurred)
     */
    static generateLQIP(url) {
        // If Cloudinary URL, add blur transformation
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/w_50,q_1,e_blur:1000/');
        }
        // Otherwise return original (will be replaced on load)
        return url;
    }

    /**
     * Create responsive image element
     */
    static create(options) {
        const container = document.createElement('div');
        container.innerHTML = this.generateHTML(options);
        return container.firstElementChild;
    }

    /**
     * Update existing image with optimized version
     */
    static optimize(img, urls) {
        if (!urls || !urls.webp) return;

        // Add srcset for responsive images
        const srcset = [
            `${urls.webp.small} 400w`,
            `${urls.webp.medium} 800w`,
            `${urls.webp.large} 1200w`
        ].join(', ');

        img.srcset = srcset;
        img.sizes = '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px';
        
        // Add loading indicator
        img.classList.add('optimized-img');
    }
}

/**
 * Image Upload Handler with Progress
 */
class ImageUploader {
    constructor(options = {}) {
        this.apiBaseUrl = options.apiBaseUrl || '/api';
        this.onProgress = options.onProgress || (() => {});
        this.onSuccess = options.onSuccess || (() => {});
        this.onError = options.onError || (() => {});
    }

    async upload(file, options = {}) {
        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
            if (file.size > maxSize) {
                throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            if (options.type) {
                formData.append('type', options.type);
            }

            // Upload with progress tracking
            const response = await this.uploadWithProgress(formData);

            // Parse response
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            this.onSuccess(result);
            return result;

        } catch (error) {
            console.error('Upload error:', error);
            this.onError(error);
            throw error;
        }
    }

    uploadWithProgress(formData) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    this.onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(JSON.parse(xhr.responseText))
                    });
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            xhr.open('POST', `${this.apiBaseUrl}/upload`);
            xhr.send(formData);
        });
    }

    /**
     * Preview image before upload
     */
    static previewImage(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            callback(e.target.result);
        };

        reader.onerror = (error) => {
            console.error('Preview error:', error);
            callback(null);
        };

        reader.readAsDataURL(file);
    }

    /**
     * Compress image on client-side before upload
     */
    static async compressImage(file, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8
        } = options;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Initialize lazy loading on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.optimizedImage = new OptimizedImage();
    });
} else {
    window.optimizedImage = new OptimizedImage();
}

// Export for use in other scripts
window.OptimizedImage = OptimizedImage;
window.ImageUploader = ImageUploader;
