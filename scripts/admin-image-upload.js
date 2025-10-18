/**
 * Admin Image Upload Integration
 * Integrates Cloudinary image upload with progress tracking and optimization
 */

// Initialize image uploader when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeImageUpload();
});

// Store uploaded image data
let currentUploadedImage = null;

function initializeImageUpload() {
    const imageInput = document.getElementById('featuredImage');
    const imagePreview = document.getElementById('imagePreview');

    if (!imageInput || !imagePreview) {
        console.warn('Image upload elements not found');
        return;
    }

    // Click on preview to trigger file input
    imagePreview.addEventListener('click', () => {
        imageInput.click();
    });    // Handle file selection
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            imageInput.value = ''; // Clear the input
            return;
        }

        // Check file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            showToast(
                `Image too large (${sizeMB}MB)`,
                'error',
                `Maximum size is 5MB. Please resize, compress, or choose a smaller file.`
            );
            imageInput.value = ''; // Clear the input
            return;
        }

        // Show preview immediately
        showImagePreview(file);

        // Upload image
        await uploadImage(file);
    });

    // Enable drag and drop
    imagePreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreview.classList.add('drag-over');
    });

    imagePreview.addEventListener('dragleave', () => {
        imagePreview.classList.remove('drag-over');
    });    imagePreview.addEventListener('drop', async (e) => {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Validate dropped file
        if (!file.type.startsWith('image/')) {
            showToast('Please drop an image file', 'error');
            return;
        }

        // Check file size for drag & drop too
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            showToast(
                `Image too large (${sizeMB}MB)`,
                'error',
                `Maximum size is 5MB. Please resize, compress, or choose a smaller file.`
            );
            return;
        }

        imageInput.files = e.dataTransfer.files;
        showImagePreview(file);
        await uploadImage(file);
    });
}

// Toast notification system
function showToast(message, type = 'info', subtitle = '') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.upload-toast');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `upload-toast upload-toast-${type}`;
    
    const icon = {
        success: '✓',
        error: '⚠',
        warning: '⚠',
        info: 'ℹ'
    }[type] || 'ℹ';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
            ${subtitle ? `<div class="toast-subtitle">${subtitle}</div>` : ''}
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showImagePreview(file) {
    const imagePreview = document.getElementById('imagePreview');
    
    // Show loading state
    imagePreview.innerHTML = `
        <div class="upload-loading">
            <div class="spinner"></div>
            <span>Uploading...</span>
            <div class="upload-progress-bar">
                <div class="upload-progress-fill" id="uploadProgress"></div>
            </div>
        </div>
    `;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.style.backgroundImage = `url(${e.target.result})`;
        imagePreview.style.backgroundSize = 'cover';
        imagePreview.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
}

async function uploadImage(file) {
    const imagePreview = document.getElementById('imagePreview');
    const progressBar = document.getElementById('uploadProgress');

    try {
        // Create uploader with progress tracking
        const uploader = new ImageUploader({
            apiBaseUrl: API_BASE,
            onProgress: (percent) => {
                if (progressBar) {
                    progressBar.style.width = `${percent}%`;
                }
            },
            onSuccess: (result) => {
                console.log('Upload successful:', result);
                currentUploadedImage = result;
                showUploadSuccess(result);
            },
            onError: (error) => {
                console.error('Upload failed:', error);
                showUploadError(error);
            }
        });

        // Optional: Compress image before upload
        let fileToUpload = file;
        if (file.size > 1024 * 1024) { // If larger than 1MB
            console.log('Compressing image...');
            fileToUpload = await ImageUploader.compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.85
            });
            console.log(`Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(fileToUpload.size / 1024).toFixed(1)}KB`);
        }

        // Upload with type specification
        await uploader.upload(fileToUpload, {
            type: 'blog',
            maxSize: 5 * 1024 * 1024
        });

    } catch (error) {
        console.error('Upload error:', error);
        showUploadError(error);
    }
}

function showUploadSuccess(result) {
    const imagePreview = document.getElementById('imagePreview');
    
    // Use thumbnail or medium size for preview
    const previewUrl = result.urls?.thumbnail || result.url;
    
    imagePreview.innerHTML = `
        <div class="upload-success">
            <img src="${previewUrl}" alt="Uploaded image" class="preview-image">
            <div class="upload-actions">
                <button type="button" class="btn-remove" onclick="removeUploadedImage()">
                    <i class="fas fa-times"></i> Remove
                </button>
                <button type="button" class="btn-change" onclick="document.getElementById('featuredImage').click()">
                    <i class="fas fa-sync"></i> Change
                </button>
            </div>
            <div class="upload-info">
                <small>
                    <i class="fas fa-check-circle"></i> 
                    Optimized & uploaded to CDN
                </small>
            </div>
        </div>
    `;
}

function showUploadError(error) {
    const imagePreview = document.getElementById('imagePreview');
    
    imagePreview.innerHTML = `
        <div class="upload-error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Upload failed: ${error.message || 'Unknown error'}</span>
            <button type="button" class="btn-retry" onclick="document.getElementById('featuredImage').click()">
                Try Again
            </button>
        </div>
    `;
    
    currentUploadedImage = null;
}

function removeUploadedImage() {
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('featuredImage');
    
    imagePreview.style.backgroundImage = '';
    imagePreview.innerHTML = `
        <i class="fas fa-image"></i>
        <span>Click to upload image</span>
    `;
    
    imageInput.value = '';
    currentUploadedImage = null;
}

function getUploadedImageData() {
    return currentUploadedImage;
}

// Add styles for upload UI
const uploadStyles = document.createElement('style');
uploadStyles.textContent = `
    .image-preview {
        min-height: 200px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .image-preview:hover {
        border-color: var(--primary-color, #4CAF50);
        background-color: rgba(76, 175, 80, 0.05);
    }

    .image-preview.drag-over {
        border-color: var(--primary-color, #4CAF50);
        background-color: rgba(76, 175, 80, 0.1);
    }

    .upload-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color, #4CAF50);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .upload-progress-bar {
        width: 200px;
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
        overflow: hidden;
    }

    .upload-progress-fill {
        height: 100%;
        background: var(--primary-color, #4CAF50);
        transition: width 0.3s ease;
        width: 0%;
    }

    .upload-success {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .preview-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
    }

    .upload-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 0.5rem;
    }

    .upload-actions button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .upload-actions button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .btn-remove {
        color: #f44336;
    }

    .btn-change {
        color: #2196F3;
    }

    .upload-info {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.75rem;
    }

    .upload-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem;
        color: #f44336;
    }

    .upload-error i {
        font-size: 3rem;
    }

    .btn-retry {
        padding: 0.5rem 1.5rem;
        background: var(--primary-color, #4CAF50);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s ease;
    }    .btn-retry:hover {
        background: #45a049;
        transform: translateY(-2px);
    }

    /* Toast Notifications */
    .upload-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 320px;
        max-width: 450px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .upload-toast.show {
        opacity: 1;
        transform: translateX(0);
    }

    .upload-toast-success {
        border-left: 4px solid #4CAF50;
    }

    .upload-toast-error {
        border-left: 4px solid #f44336;
    }

    .upload-toast-warning {
        border-left: 4px solid #ff9800;
    }

    .upload-toast-info {
        border-left: 4px solid #2196F3;
    }

    .toast-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .upload-toast-success .toast-icon {
        background: #e8f5e9;
        color: #4CAF50;
    }

    .upload-toast-error .toast-icon {
        background: #ffebee;
        color: #f44336;
    }

    .upload-toast-warning .toast-icon {
        background: #fff3e0;
        color: #ff9800;
    }

    .upload-toast-info .toast-icon {
        background: #e3f2fd;
        color: #2196F3;
    }

    .toast-content {
        flex: 1;
    }

    .toast-message {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        margin-bottom: 4px;
    }

    .toast-subtitle {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
    }

    .toast-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .toast-close:hover {
        color: #333;
        transform: rotate(90deg);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .upload-toast {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
            max-width: none;
        }
    }
`;

document.head.appendChild(uploadStyles);

// Export for use in admin panel
window.getUploadedImageData = getUploadedImageData;
window.removeUploadedImage = removeUploadedImage;
