// Cloudinary Upload Service with Automatic Optimization
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const stream = require('stream');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

logger.success('Cloudinary Service Initialized');
logger.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Not configured');

// Image optimization settings
const OPTIMIZATION_PRESETS = {
    thumbnail: {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto'
    },
    small: {
        width: 400,
        height: 300,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto'
    },
    medium: {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto'
    },
    large: {
        width: 1200,
        height: 900,
        crop: 'limit',
        quality: 'auto:best',
        fetch_format: 'auto'
    },
    blog_featured: {
        width: 1200,
        height: 630,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto'
    },
    blog_thumbnail: {
        width: 400,
        height: 250,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto'
    }
};

/**
 * Optimize image locally before uploading to Cloudinary
 * Reduces upload time and bandwidth
 */
async function optimizeImageBuffer(buffer, options = {}) {
    try {
        const { maxWidth = 2000, quality = 85 } = options;

        const optimized = await sharp(buffer)
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();

        const originalSize = buffer.length;        const optimizedSize = optimized.length;
        const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        logger.log(`Image optimized: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (${savings}% savings)`);

        return optimized;
    } catch (error) {
        logger.error('Sharp optimization error:', error);
        // Return original buffer if optimization fails
        return buffer;
    }
}

/**
 * Upload image to Cloudinary with optimization
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URLs
 */
async function uploadImage(buffer, options = {}) {
    try {
        const {
            folder = process.env.CLOUDINARY_FOLDER || 'graceland-church',
            type = 'blog',
            optimizeLocally = true,
            resourceType = 'image'
        } = options;

        // Optimize locally first (optional but recommended)
        let uploadBuffer = buffer;
        if (optimizeLocally && resourceType === 'image') {
            uploadBuffer = await optimizeImageBuffer(buffer);
        }

        // Upload to Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resourceType,
                    transformation: [
                        {
                            quality: 'auto:good',
                            fetch_format: 'auto'
                        }
                    ],
                    // Generate responsive breakpoints
                    responsive_breakpoints: {
                        create_derived: true,
                        bytes_step: 20000,
                        min_width: 200,
                        max_width: 1200,
                        max_images: 5
                    }
                },
                (error, result) => {                if (error) {
                        logger.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        logger.success('Uploaded to Cloudinary:', result.public_id);
                        
                        // Generate all preset URLs
                        const urls = generateImageUrls(result.public_id, type);
                        
                        resolve({
                            success: true,
                            public_id: result.public_id,
                            url: result.secure_url,
                            urls: urls,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes,
                            responsive_breakpoints: result.responsive_breakpoints
                        });
                    }
                }
            );

            // Convert buffer to stream and pipe to Cloudinary
            const bufferStream = new stream.PassThrough();
            bufferStream.end(uploadBuffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

/**
 * Generate optimized URLs for different use cases
 */
function generateImageUrls(publicId, type = 'blog') {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const urls = {
        original: cloudinary.url(publicId, { secure: true }),
        thumbnail: cloudinary.url(publicId, OPTIMIZATION_PRESETS.thumbnail),
        small: cloudinary.url(publicId, OPTIMIZATION_PRESETS.small),
        medium: cloudinary.url(publicId, OPTIMIZATION_PRESETS.medium),
        large: cloudinary.url(publicId, OPTIMIZATION_PRESETS.large)
    };

    // Add type-specific URLs
    if (type === 'blog') {
        urls.featured = cloudinary.url(publicId, OPTIMIZATION_PRESETS.blog_featured);
        urls.card = cloudinary.url(publicId, OPTIMIZATION_PRESETS.blog_thumbnail);
    }

    // Generate WebP versions
    urls.webp = {
        thumbnail: cloudinary.url(publicId, { ...OPTIMIZATION_PRESETS.thumbnail, format: 'webp' }),
        small: cloudinary.url(publicId, { ...OPTIMIZATION_PRESETS.small, format: 'webp' }),
        medium: cloudinary.url(publicId, { ...OPTIMIZATION_PRESETS.medium, format: 'webp' }),
        large: cloudinary.url(publicId, { ...OPTIMIZATION_PRESETS.large, format: 'webp' })
    };

    return urls;
}

/**
 * Generate responsive srcset for <img> tag
 */
function generateSrcSet(publicId, options = {}) {
    const widths = options.widths || [400, 800, 1200, 1600];
    const quality = options.quality || 'auto:good';
    
    const srcset = widths.map(width => {
        const url = cloudinary.url(publicId, {
            width: width,
            crop: 'limit',
            quality: quality,
            fetch_format: 'auto'
        });
        return `${url} ${width}w`;
    }).join(', ');

    return srcset;
}

/**
 * Delete image from Cloudinary
 */
async function deleteImage(publicId) {
    try {        const result = await cloudinary.uploader.destroy(publicId);
        logger.success('Deleted from Cloudinary:', publicId);
        return result;
    } catch (error) {
        logger.error('Delete error:', error);
        throw error;
    }
}

/**
 * Get image details
 */
async function getImageDetails(publicId) {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('Get image details error:', error);
        throw error;
    }
}

/**
 * Upload video to Cloudinary with optimization
 */
async function uploadVideo(buffer, options = {}) {
    try {
        const {
            folder = process.env.CLOUDINARY_FOLDER || 'graceland-church/videos'
        } = options;

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'video',
                    transformation: [
                        {
                            quality: 'auto:good',
                            fetch_format: 'auto'
                        }
                    ]                },
                (error, result) => {
                    if (error) {
                        logger.error('Video upload error:', error);
                        reject(error);
                    } else {
                        logger.success('Video uploaded:', result.public_id);
                        resolve({
                            success: true,
                            public_id: result.public_id,
                            url: result.secure_url,
                            duration: result.duration,
                            format: result.format,
                            bytes: result.bytes
                        });
                    }
                }
            );

            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error('Video upload error:', error);
        throw error;
    }
}

/**
 * Generate lazy loading placeholder (blurred LQIP)
 */
function generateLQIP(publicId) {
    return cloudinary.url(publicId, {
        width: 50,
        quality: 1,
        effect: 'blur:1000',
        fetch_format: 'auto'
    });
}

/**
 * Validate Cloudinary configuration
 */
function isConfigured() {
    const configured = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (!configured) {
        console.warn('⚠️ Cloudinary is not configured. Using local file storage.');
    }

    return configured;
}

module.exports = {
    uploadImage,
    uploadVideo,
    deleteImage,
    getImageDetails,
    generateImageUrls,
    generateSrcSet,
    generateLQIP,
    isConfigured,
    cloudinary
};
