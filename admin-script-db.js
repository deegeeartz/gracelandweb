// API Configuration - Uses environment-based config
const API_BASE = window.ENV ? window.ENV.apiBaseUrl : (window.location.origin + '/api');

// Auth helper class
class Auth {
    static getToken() {
        return localStorage.getItem('admin_token');
    }

    static setToken(token) {
        localStorage.setItem('admin_token', token);
    }

    static removeToken() {
        localStorage.removeItem('admin_token');
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    static async checkAuth() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE}/auth/verify`, {
                headers: this.getAuthHeaders()
            });
            return response.ok;
        } catch (error) {
            logger.error('Auth check failed:', error);
            return false;
        }
    }
}

// API helper class
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...Auth.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            logger.error('API request failed:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: data });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Updated Admin Panel Class
class AdminPanel {    constructor() {
        this.currentTab = 'dashboard';
        this.posts = [];
        this.sermons = [];
        this.categories = [];
        this.quillEditor = null;
        this.currentEditingPost = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.pendingQuillImages = []; // Store pending images from Quill editor
        
        this.init();
    }

    async init() {
        // Check authentication first
        const isAuthenticated = await Auth.checkAuth();
        if (!isAuthenticated) {
            this.showLoginForm();
            return;
        }

        this.setupEventListeners();
        this.initializeQuillEditor();
        await this.loadCategories();
        await this.loadDashboardData();
        await this.updateStats();
        await this.loadNotifications();
        setInterval(() => this.loadNotifications(), 30000);
    }

    showLoginForm() {
        document.body.innerHTML = `
            <div class="login-container" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--gray-50);">
                <div class="login-form" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <i class="fas fa-church" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <h2>RCCG Admin Login</h2>
                    </div>
                    <form id="loginForm">
                        <div style="margin-bottom: 1rem;">
                            <label for="username" style="display: block; margin-bottom: 0.5rem;">Username</label>
                            <input type="text" id="username" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label for="password" style="display: block; margin-bottom: 0.5rem;">Password</label>
                            <input type="password" id="password" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <button type="submit" style="width: 100%; padding: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Login
                        </button>
                    </form>
                    <div id="loginError" style="color: red; margin-top: 1rem; text-align: center; display: none;"></div>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await API.post('/auth/login', { username, password });
            Auth.setToken(response.token);
            
            // Reload the page to show the admin panel
            window.location.reload();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Create post button
        document.getElementById('createPostBtn').addEventListener('click', () => {
            this.openPostEditor();
        });

        // Add new button
        document.getElementById('addNewBtn').addEventListener('click', () => {
            if (this.currentTab === 'blog-posts') {
                this.openPostEditor();
            } else if (this.currentTab === 'sermons') {
                this.openSermonEditor();
            }
        });

        // Post form submission
        document.getElementById('postForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });

        // Modal close buttons
        document.getElementById('closeEditor').addEventListener('click', () => {
            this.closePostEditor();
        });

        document.getElementById('closeSocialShare').addEventListener('click', () => {
            this.closeSocialShareModal();
        });

        // Filter events
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterPosts();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterPosts();
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });        });

        // Image upload - REMOVED: Handled by scripts/admin-image-upload.js
        // This was causing double uploads!
        // document.getElementById('featuredImage').addEventListener('change', (e) => {
        //     this.handleImageUpload(e);
        // });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContent(e.target.value);
        });

        // Logout functionality
        document.querySelector('.logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Notification dropdown toggle
        const notifBtn = document.getElementById('notificationBtn');
        const dropdown = document.getElementById('notificationDropdown');
        if (notifBtn && dropdown) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.style.display = (dropdown.style.display === 'none' || !dropdown.style.display) ? 'block' : 'none';
            });
            document.addEventListener('click', () => {
                if (dropdown) dropdown.style.display = 'none';
            });
            dropdown.addEventListener('click', (e) => e.stopPropagation());
        }

        // Settings save button
        const saveSettingsBtn = document.querySelector('#settings .btn-primary');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    logout() {
        Auth.removeToken();
        window.location.reload();
    }

    async loadCategories() {
        try {
            this.categories = await API.get('/admin/categories');
            this.populateCategorySelects();
        } catch (error) {
            logger.error('Error loading categories:', error);
            this.showNotification('Failed to load categories', 'error');
        }
    }

    populateCategorySelects() {
        const selects = document.querySelectorAll('#postCategory, #categoryFilter');
        selects.forEach(select => {
            if (select.id === 'categoryFilter') {
                select.innerHTML = '<option value="">All Categories</option>';
            } else {
                select.innerHTML = '<option value="">Select Category</option>';
            }
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }    initializeQuillEditor() {
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ];        // Custom image handler to store images locally first
        const imageHandler = async () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    if (typeof showToast === 'function') {
                        showToast('Please select an image file', 'error');
                    } else {
                        alert('Please select an image file');
                    }
                    return;
                }

                // Validate file size (5MB maximum)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (file.size > maxSize) {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    if (typeof showToast === 'function') {
                        showToast(
                            `Image too large (${sizeMB}MB)`,
                            'error',
                            'Maximum size is 5MB. Please resize, compress, or choose a smaller file.'
                        );
                    } else {
                        alert(`Image too large (${sizeMB}MB). Maximum size is 5MB.\n\nPlease:\n- Resize the image\n- Compress it online\n- Choose a smaller file`);
                    }
                    return;
                }

                // Show processing indicator
                const range = this.quillEditor.getSelection(true);
                this.quillEditor.insertText(range.index, '⏳ Processing image...\n');
                
                try {
                    // Convert image to data URL for preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target.result;
                        
                        // Remove processing text
                        const currentRange = this.quillEditor.getSelection();
                        if (currentRange) {
                            this.quillEditor.deleteText(range.index, '⏳ Processing image...\n'.length);
                        }
                        
                        // Insert image as data URL temporarily
                        this.quillEditor.insertEmbed(range.index, 'image', dataUrl);
                        
                        // Store file for later upload
                        this.pendingQuillImages.push({
                            file: file,
                            dataUrl: dataUrl,
                            position: range.index
                        });
                        
                        // Move cursor after image
                        this.quillEditor.setSelection(range.index + 1);
                        
                        // Show info message
                        if (typeof showToast === 'function') {
                            showToast(
                                'Image added to post',
                                'info',
                                'Images will be uploaded when you save the post'
                            );
                        }
                        
                        logger.log('Image stored locally, will upload on save');
                    };
                    
                    reader.readAsDataURL(file);
                    
                } catch (error) {
                    logger.error('Error processing image:', error);
                    
                    // Remove processing text
                    this.quillEditor.deleteText(range.index, '⏳ Processing image...\n'.length);
                    
                    // Show error message
                    if (typeof showToast === 'function') {
                        showToast(
                            'Failed to process image',
                            'error',
                            `${error.message}. Please try again.`
                        );
                    } else {
                        alert(`Failed to process image: ${error.message}\n\nPlease try again.`);
                    }
                }
            };
        };

        this.quillEditor = new Quill('#postContent', {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        image: imageHandler
                    }
                }
            },
            placeholder: 'Write your blog post content here...'
        });
    }

    async switchTab(tab) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tab).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'blog-posts': 'Blog Posts',
            'sermons': 'Sermons',
            'events': 'Events',
            'fellowships': 'House Fellowships',
            'gallery': 'Gallery',
            'prayers': 'Prayer Requests',
            'members': 'Connect Cards',
            'comments': 'Comments',
            'social-media': 'Social Media',
            'hero': 'Hero Section Banner',
            'settings': 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[tab] || 'Admin';

        this.currentTab = tab;

        // Load tab-specific data
        if (tab === 'blog-posts') {
            await this.loadBlogPosts();
        } else if (tab === 'sermons') {
            await this.loadSermons();
        } else if (tab === 'events') {
            await this.loadEvents();
        } else if (tab === 'fellowships') {
            await this.loadFellowships();
        } else if (tab === 'gallery') {
            await this.loadGalleryAdmin();
        } else if (tab === 'prayers') {
            await this.loadPrayers();
        } else if (tab === 'members') {
            await this.loadMembers();
        } else if (tab === 'comments') {
            await this.loadComments();
        } else if (tab === 'ministries') {
            await this.loadMinistries();
        } else if (tab === 'hero') {
            await this.loadHeroTab();
        } else if (tab === 'settings') {
            await this.loadSettings();
        }
    }

    async loadDashboardData() {
        try {
            const stats = await API.get('/admin/stats');
            
            // Update dashboard stats
            document.getElementById('totalPosts').textContent = stats.totalPosts;
            document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString();
            document.getElementById('totalShares').textContent = stats.totalLikes;
            document.getElementById('totalComments').textContent = '0'; // Comments not implemented yet

            // Load recent posts
            const recentPostsList = document.getElementById('recentPostsList');
            if (stats.recentPosts.length === 0) {
                recentPostsList.innerHTML = '<p style="color: var(--gray-500);">No recent posts.</p>';
            } else {
                recentPostsList.innerHTML = stats.recentPosts.map(post => `
                    <div class="recent-post-item" style="padding: 1rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin-bottom: 0.25rem; color: var(--gray-900);">${post.title}</h4>
                            <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0;">${this.formatDate(post.created_at)} • ${post.views || 0} views</p>
                        </div>
                        <span class="status-badge status-${post.status}">${post.status}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            logger.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async updateStats() {
        try {
            const stats = await API.get('/admin/stats');
            document.getElementById('totalPosts').textContent = stats.totalPosts;
            document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString();
            document.getElementById('totalShares').textContent = stats.totalLikes;
            document.getElementById('totalComments').textContent = '0';
        } catch (error) {
            logger.error('Error updating stats:', error);
        }
    }

    async loadBlogPosts() {
        try {
            const statusFilter = document.getElementById('statusFilter').value;
            const categoryFilter = document.getElementById('categoryFilter').value;
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10
            });
            
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);

            const response = await API.get(`/admin/posts?${params}`);
            this.posts = response.posts;
            this.totalPages = response.pagination.totalPages;
            
            this.renderPostsTable(this.posts);
        } catch (error) {
            logger.error('Error loading blog posts:', error);
            this.showNotification('Failed to load blog posts', 'error');
        }
    }

    renderPostsTable(posts) {
        const tbody = document.getElementById('postsTableBody');
        
        if (posts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        No blog posts found. <a href="#" onclick="adminPanel.openPostEditor()">Create your first post</a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <strong>${post.title}</strong>
                    <br>
                    <small style="color: var(--gray-500);">${(post.excerpt || '').substring(0, 50)}...</small>
                </td>
                <td>
                    <span class="category-badge">${post.category_name || 'Uncategorized'}</span>
                </td>
                <td>${post.author_name || 'Unknown'}</td>
                <td>
                    <span class="status-badge status-${post.status}">${post.status}</span>
                </td>
                <td>${this.formatDate(post.created_at)}</td>
                <td>${post.views || 0}</td>
                <td>
                    <div class="action-buttons-table">
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.openPostEditor(${post.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deletePost(${post.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openPostEditor(postId = null) {
        this.currentEditingPost = null;
        const modal = document.getElementById('postEditorModal');
        const title = document.getElementById('editorTitle');
        
        if (postId) {
            this.loadPostForEditing(postId);
            title.textContent = 'Edit Post';
        } else {
            title.textContent = 'Create New Post';
            this.clearPostForm();
        }
        
        modal.classList.add('active');
    }

    async loadPostForEditing(postId) {
        try {
            const post = await API.get(`/blog/${postId}`);
            this.currentEditingPost = post;
            this.populatePostForm(post);
        } catch (error) {
            logger.error('Error loading post for editing:', error);
            this.showNotification('Failed to load post', 'error');
        }
    }

    populatePostForm(post) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category_id || '';
        document.getElementById('postAuthor').value = post.author_name || '';
        document.getElementById('postExcerpt').value = post.excerpt || '';
        document.getElementById('postStatus').value = post.status;
        
        if (post.published_at) {
            const date = new Date(post.published_at);
            document.getElementById('publishDate').value = date.toISOString().slice(0, 16);
        }
        
        if (this.quillEditor && post.content) {
            this.quillEditor.root.innerHTML = post.content;
        }
    }

    clearPostForm() {
        document.getElementById('postForm').reset();
        if (this.quillEditor) {
            this.quillEditor.setContents([]);
        }
        document.getElementById('imagePreview').innerHTML = `
            <i class="fas fa-image"></i>
            <span>Click to upload image</span>
        `;
    }    closePostEditor() {
        document.getElementById('postEditorModal').classList.remove('active');
        this.currentEditingPost = null;
        this.pendingQuillImages = []; // Clear pending Quill images
        this.clearPostForm();
    }    async savePost() {
        try {
            // Show upload progress overlay
            this.showUploadProgressOverlay();
            
            // Prevent page unload during upload
            window.onbeforeunload = () => "Images are being uploaded. Are you sure you want to leave?";
            
            // Check if there's a pending image file that hasn't been uploaded yet
            const pendingFile = window.getPendingImageFile ? window.getPendingImageFile() : null;
            let uploadedImage = window.getUploadedImageData ? window.getUploadedImageData() : null;
            
            // Count total images to upload
            const quillImages = this.pendingQuillImages ? this.pendingQuillImages.length : 0;
            const totalImages = (pendingFile && !uploadedImage ? 1 : 0) + quillImages;
            let uploadedCount = 0;
            
            this.updateUploadProgress(uploadedCount, totalImages, 'Preparing to upload images...');
            
            // If there's a pending file, upload it now
            if (pendingFile && !uploadedImage) {
                this.updateUploadProgress(uploadedCount, totalImages, 'Uploading featured image...');
                
                try {
                    // Show upload progress in the preview
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.innerHTML = `
                            <div class="upload-loading">
                                <div class="spinner"></div>
                                <span>Uploading image...</span>
                                <div class="upload-progress-bar">
                                    <div class="upload-progress-fill" id="uploadProgress"></div>
                                </div>
                            </div>
                        `;
                    }
                    
                    // Create uploader and upload the file
                    const uploader = new ImageUploader({
                        apiBaseUrl: API_BASE,
                        onProgress: (percent) => {
                            const progressBar = document.getElementById('uploadProgress');
                            if (progressBar) {
                                progressBar.style.width = `${percent}%`;
                            }
                        },
                        onSuccess: (result) => {
                            uploadedImage = result;
                            window.currentUploadedImage = result;
                        },
                        onError: (error) => {
                            throw error;
                        }
                    });

                    // Compress if needed
                    let fileToUpload = pendingFile;
                    if (pendingFile.size > 1024 * 1024) { // If larger than 1MB
                        fileToUpload = await ImageUploader.compressImage(pendingFile, {
                            maxWidth: 1920,
                            maxHeight: 1080,
                            quality: 0.85
                        });
                    }

                    await uploader.upload(fileToUpload, {
                        type: 'blog',
                        maxSize: 5 * 1024 * 1024
                    });
                      // Wait a moment for the onSuccess callback to complete
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    uploadedCount++;
                    this.updateUploadProgress(uploadedCount, totalImages, 'Featured image uploaded successfully!');
                    
                } catch (uploadError) {
                    logger.error('Image upload failed:', uploadError);
                    this.hideUploadProgressOverlay();
                    window.onbeforeunload = null;
                    this.showNotification('Image upload failed: ' + uploadError.message, 'error');
                    return; // Don't save post if image upload fails
                }}
              // Upload any pending Quill editor images
            let contentHtml = this.quillEditor.root.innerHTML;
            if (this.pendingQuillImages && this.pendingQuillImages.length > 0) {
                let imageIndex = 0;
                
                for (const pendingImage of this.pendingQuillImages) {
                    imageIndex++;
                    this.updateUploadProgress(
                        uploadedCount + imageIndex,
                        totalImages,
                        `Uploading content image ${imageIndex} of ${this.pendingQuillImages.length}...`
                    );
                    
                    try {
                        // Create uploader
                        const uploader = new ImageUploader({
                            apiBaseUrl: API_BASE,
                            onProgress: (percent) => {
                                this.updateUploadProgress(
                                    uploadedCount + imageIndex,
                                    totalImages,
                                    `Uploading content image ${imageIndex} of ${this.pendingQuillImages.length}... ${Math.round(percent)}%`
                                );
                            },
                            onSuccess: (result) => {
                                // Replace data URL with Cloudinary URL in content
                                const cloudinaryUrl = result.optimized?.medium || result.url;
                                contentHtml = contentHtml.replace(pendingImage.dataUrl, cloudinaryUrl);
                                logger.log('Uploaded content image to Cloudinary');
                            },
                            onError: (error) => {
                                throw error;
                            }
                        });

                        // Compress if needed
                        let fileToUpload = pendingImage.file;
                        if (pendingImage.file.size > 1024 * 1024) {
                            this.updateUploadProgress(
                                uploadedCount + imageIndex,
                                totalImages,
                                `Compressing content image ${imageIndex}...`
                            );
                            fileToUpload = await ImageUploader.compressImage(pendingImage.file, {
                                maxWidth: 1920,
                                maxHeight: 1080,
                                quality: 0.85
                            });
                        }

                        await uploader.upload(fileToUpload, {
                            type: 'blog',
                            maxSize: 5 * 1024 * 1024
                        });
                        
                        // Wait for callback
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        uploadedCount++;
                        
                    } catch (uploadError) {
                        logger.error('Content image upload failed:', uploadError);
                        this.hideUploadProgressOverlay();
                        window.onbeforeunload = null;
                        this.showNotification('Content image upload failed: ' + uploadError.message, 'error');
                        return; // Stop if any image fails
                    }
                }
                
                // Clear pending images after upload
                this.pendingQuillImages = [];
            }
            
            // Update progress - all images uploaded
            this.updateUploadProgress(totalImages, totalImages, 'All images uploaded! Saving post...');
            
            const formData = {
                title: document.getElementById('postTitle').value,
                excerpt: document.getElementById('postExcerpt').value,
                content: contentHtml, // Use processed HTML with Cloudinary URLs
                category_id: document.getElementById('postCategory').value || null,
                status: document.getElementById('postStatus').value,
                published_at: document.getElementById('publishDate').value || null
            };

            // Add image URLs if uploaded
            if (uploadedImage) {
                formData.featured_image = uploadedImage.url;
                formData.image_public_id = uploadedImage.public_id;
                formData.image_urls = uploadedImage.urls; // Store all optimized URLs
            }

            if (!formData.title || !formData.content) {
                this.showNotification('Title and content are required', 'error');
                return;
            }            if (this.currentEditingPost) {
                await API.put(`/admin/posts/${this.currentEditingPost.id}`, formData);
                this.showNotification('Post updated successfully!', 'success');
            } else {
                await API.post('/admin/posts', formData);
                this.showNotification('Post created successfully!', 'success');
            }

            // Hide upload progress overlay
            this.hideUploadProgressOverlay();

            this.closePostEditor();
            await this.loadBlogPosts();
            await this.updateStats();
        } catch (error) {
            logger.error('Error saving post:', error);
            this.hideUploadProgressOverlay();
            this.showNotification(error.message, 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await API.delete(`/admin/posts/${postId}`);
            this.showNotification('Post deleted successfully!', 'success');
            await this.loadBlogPosts();
            await this.updateStats();
        } catch (error) {
            logger.error('Error deleting post:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async filterPosts() {
        this.currentPage = 1;
        await this.loadBlogPosts();
    }    async searchContent(query) {
        // Implement search functionality
        logger.log('Search:', query);
    }

    async loadSermons() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10
            });

            const response = await API.get(`/admin/sermons?${params}`);
            this.sermons = response.sermons;
            
            this.renderSermonsGrid(this.sermons);
        } catch (error) {
            logger.error('Error loading sermons:', error);
            this.showNotification('Failed to load sermons', 'error');
        }
    }

    renderSermonsGrid(sermons) {
        const sermonsGrid = document.getElementById('sermonsGrid');
        
        if (sermons.length === 0) {
            sermonsGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    No sermons uploaded yet. <button class="btn btn-primary" onclick="adminPanel.openSermonEditor()">Add your first sermon</button>
                </div>
            `;
            return;
        }

        sermonsGrid.innerHTML = sermons.map(sermon => `
            <div class="sermon-admin-card" style="background: var(--white); border-radius: var(--border-radius); box-shadow: var(--box-shadow); padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">${sermon.title}</h3>
                        <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${sermon.speaker}</p>
                        <p style="color: var(--gray-500); font-size: 0.9rem;">${this.formatDate(sermon.sermon_date)}</p>
                    </div>
                    <div class="action-buttons-table">
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.editSermon(${sermon.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteSermon(${sermon.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p style="color: var(--gray-600); line-height: 1.5;">${sermon.description || ''}</p>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); display: flex; gap: 1rem;">
                    <span style="font-size: 0.9rem; color: var(--gray-500);">
                        <i class="fas fa-eye"></i> ${sermon.listens || 0} listens
                    </span>
                    <span style="font-size: 0.9rem; color: var(--gray-500);">
                        <i class="fas fa-download"></i> ${sermon.downloads || 0} downloads
                    </span>
                </div>
            </div>
        `).join('');
    }

    openSermonEditor() {
        this.showNotification('Sermon editor coming soon!', 'info');
    }

    editSermon(id) {
        this.showNotification('Edit sermon functionality coming soon!', 'info');
    }

    async deleteSermon(id) {
        if (!confirm('Are you sure you want to delete this sermon?')) {
            return;
        }

        try {
            await API.delete(`/admin/sermons/${id}`);
            this.showNotification('Sermon deleted successfully!', 'success');
            await this.loadSermons();
        } catch (error) {
            logger.error('Error deleting sermon:', error);
            this.showNotification(error.message, 'error');
        }
    }

    openSocialShareModal(postId) {
        this.showNotification('Social sharing functionality coming soon!', 'info');
    }

    closeSocialShareModal() {
        document.getElementById('socialShareModal').classList.remove('active');
    }

    handleQuickAction(action) {
        switch(action) {
            case 'new-post':
                this.openPostEditor();
                break;
            case 'new-sermon':
                this.openSermonEditor();
                break;
            case 'share-social':
                this.switchTab('social-media');
                break;
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: Auth.getAuthHeaders(),
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${result.url}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);">
                `;
                this.showNotification('Image uploaded successfully!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            logger.error('Image upload error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out'
        });

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // --- EVENTS MANAGEMENT ---
    async loadEvents() {
        try {
            const events = await API.get('/events');
            this.renderEvents(events);
        } catch (error) {
            logger.error('Error loading events:', error);
            if(typeof showToast === 'function') showToast('Failed to load events', 'error');
        }
    }

    renderEvents(events) {
        const tbody = document.getElementById('eventsList');
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No events found.</td></tr>';
            return;
        }
        tbody.innerHTML = events.map(event => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${this.escapeHtml(event.title)}</td>
                <td style="padding: 10px;">${new Date(event.event_date).toLocaleString()}</td>
                <td style="padding: 10px;">${this.escapeHtml(event.location || '')}</td>
                <td style="padding: 10px;">${event.rsvp_count || 0}</td>
                <td style="padding: 10px;">
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteEvent(${event.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    async deleteEvent(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await API.delete(`/events/${id}`);
            if(typeof showToast === 'function') showToast('Event deleted successfully', 'success');
            await this.loadEvents();
        } catch (error) {
            logger.error('Error deleting event:', error);
            if(typeof showToast === 'function') showToast('Failed to delete event', 'error');
        }
    }

    // --- FELLOWSHIPS MANAGEMENT ---
    async loadFellowships() {
        try {
            const fellowships = await API.get('/fellowships');
            this.renderFellowships(fellowships);
        } catch (error) {
            logger.error('Error loading fellowships:', error);
            if(typeof showToast === 'function') showToast('Failed to load fellowships', 'error');
        }
    }

    renderFellowships(fellowships) {
        const tbody = document.getElementById('fellowshipsList');
        if (fellowships.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No fellowships found.</td></tr>';
            return;
        }
        tbody.innerHTML = fellowships.map(f => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${this.escapeHtml(f.name)}</td>
                <td style="padding: 10px;">${this.escapeHtml(f.leader_name)}</td>
                <td style="padding: 10px;">${this.escapeHtml(f.contact_phone || '')}</td>
                <td style="padding: 10px;">
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteFellowship(${f.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    async deleteFellowship(id) {
        if (!confirm('Are you sure you want to delete this fellowship?')) return;
        try {
            await API.delete(`/fellowships/${id}`);
            if(typeof showToast === 'function') showToast('Fellowship deleted successfully', 'success');
            await this.loadFellowships();
        } catch (error) {
            logger.error('Error deleting fellowship:', error);
            if(typeof showToast === 'function') showToast('Failed to delete fellowship', 'error');
        }
    }

    // --- PRAYER REQUESTS MANAGEMENT ---
    async loadPrayers() {
        try {
            const prayers = await API.get('/prayer');
            this.renderPrayers(prayers);
        } catch (error) {
            logger.error('Error loading prayers:', error);
            this.showNotification('Failed to load prayer requests', 'error');
        }
    }

    renderPrayers(prayers) {
        const tbody = document.getElementById('prayersList');
        if (!tbody) return;
        if (!Array.isArray(prayers) || prayers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No prayer requests found.</td></tr>';
            return;
        }
        tbody.innerHTML = prayers.map(p => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${new Date(p.created_at).toLocaleDateString()}</td>
                <td style="padding: 10px;">${this.escapeHtml(p.name)}</td>
                <td style="padding: 10px;">${this.escapeHtml(p.request_text || p.request || '')}</td>
                <td style="padding: 10px;">${p.is_public ? 'Yes' : 'No'}</td>
                <td style="padding: 10px;"><span class="status-badge status-${p.status}">${p.status}</span></td>
                <td style="padding: 10px;">
                    ${p.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="adminPanel.updatePrayerStatus(${p.id}, 'approved')"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deletePrayer(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    async updatePrayerStatus(id, status) {
        try {
            await API.put(`/prayer/${id}/status`, { status });
            this.showNotification('Prayer status updated', 'success');
            await this.loadPrayers();
            await this.loadNotifications();
        } catch (error) {
            logger.error('Error updating prayer status:', error);
            this.showNotification('Failed to update prayer', 'error');
        }
    }

    async deletePrayer(id) {
        if (!confirm('Are you sure you want to delete this prayer request?')) return;
        try {
            await API.delete(`/prayer/${id}`);
            this.showNotification('Prayer request deleted', 'success');
            await this.loadPrayers();
            await this.loadNotifications();
        } catch (error) {
            logger.error('Error deleting prayer:', error);
            this.showNotification('Failed to delete prayer', 'error');
        }
    }

    // --- MEMBERS MANAGEMENT ---
    async loadMembers() {
        try {
            const members = await API.get('/members');
            this.renderMembers(members);
        } catch (error) {
            logger.error('Error loading members:', error);
            this.showNotification('Failed to load members', 'error');
        }
    }

    renderMembers(members) {
        const tbody = document.getElementById('membersList');
        if (!tbody) return;
        if (!Array.isArray(members) || members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No connect cards found.</td></tr>';
            return;
        }
        tbody.innerHTML = members.map(m => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${this.escapeHtml(m.first_name)} ${this.escapeHtml(m.last_name)}</td>
                <td style="padding: 10px;">${this.escapeHtml(m.email || '')}</td>
                <td style="padding: 10px;">${this.escapeHtml(m.phone || '')}</td>
                <td style="padding: 10px;">${this.escapeHtml(m.address || '')}</td>
                <td style="padding: 10px;">${new Date(m.created_at || m.joined_date).toLocaleDateString()}</td>
                <td style="padding: 10px;">
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteMember(${m.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    async deleteMember(id) {
        if (!confirm('Are you sure you want to delete this connect card?')) return;
        try {
            await API.delete(`/members/${id}`);
            this.showNotification('Connect card deleted', 'success');
            await this.loadMembers();
        } catch (error) {
            logger.error('Error deleting member:', error);
            this.showNotification('Failed to delete member', 'error');
        }
    }

    // --- COMMENTS MANAGEMENT ---
    async loadComments() {
        try {
            const comments = await API.get('/admin/comments');
            this.renderComments(comments);
        } catch (error) {
            logger.error('Error loading comments:', error);
            this.showNotification('Failed to load comments', 'error');
        }
    }

    renderComments(comments) {
        const tbody = document.getElementById('commentsList');
        if (!tbody) return;
        if (!Array.isArray(comments) || comments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No comments found.</td></tr>';
            return;
        }
        tbody.innerHTML = comments.map(c => `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${new Date(c.created_at).toLocaleDateString()}</td>
                <td style="padding: 10px;">${this.escapeHtml(c.name || c.author_name || '')}</td>
                <td style="padding: 10px;">${this.escapeHtml(c.comment || c.content || '')}</td>
                <td style="padding: 10px;"><span class="status-badge status-${c.status}">${c.status}</span></td>
                <td style="padding: 10px;">
                    ${c.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="adminPanel.updateCommentStatus(${c.id}, 'approved')"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteComment(${c.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    async updateCommentStatus(id, status) {
        try {
            await API.put(`/admin/comments/${id}/status`, { status });
            this.showNotification('Comment status updated', 'success');
            await this.loadComments();
            await this.loadNotifications();
        } catch (error) {
            logger.error('Error updating comment status:', error);
            this.showNotification('Failed to update comment', 'error');
        }
    }

    async deleteComment(id) {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await API.delete(`/admin/comments/${id}`);
            this.showNotification('Comment deleted', 'success');
            await this.loadComments();
            await this.loadNotifications();
        } catch (error) {
            logger.error('Error deleting comment:', error);
            this.showNotification('Failed to delete comment', 'error');
        }
    }

    // --- GALLERY MANAGEMENT ---
    async loadGalleryAdmin() {
        try {
            const items = await API.get('/gallery');
            this.renderGalleryAdmin(items);
        } catch (error) {
            logger.error('Error loading gallery admin:', error);
            if(typeof showToast === 'function') showToast('Failed to load gallery items', 'error');
        }
    }

    renderGalleryAdmin(items) {
        const grid = document.getElementById('galleryAdminList');
        if (items.length === 0) {
            grid.innerHTML = '<p>No images in gallery.</p>';
            return;
        }
        grid.innerHTML = items.map(item => `
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <img src="${item.image_url}" alt="${this.escapeHtml(item.title)}" style="width: 100%; height: 150px; object-fit: cover; display: block;">
                <div style="padding: 10px; background: #fff;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 0.9em;">${this.escapeHtml(item.title)}</p>
                    <span style="font-size: 0.8em; color: var(--primary-color); display: block; margin-bottom: 10px;">${this.escapeHtml(item.category)}</span>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteGalleryItem(${item.id})" style="width: 100%;"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `).join('');
    }

    async deleteGalleryItem(id) {
        if (!confirm('Are you sure you want to delete this gallery item?')) return;
        try {
            await API.delete(`/gallery/${id}`);
            if(typeof showToast === 'function') showToast('Gallery item deleted', 'success');
            await this.loadGalleryAdmin();
        } catch (error) {
            logger.error('Error deleting gallery item:', error);
            if(typeof showToast === 'function') showToast('Failed to delete gallery item', 'error');
        }
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showUploadProgressOverlay() {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('uploadProgressOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'uploadProgressOverlay';
            overlay.className = 'upload-progress-overlay';
            overlay.innerHTML = `
                <div class="upload-progress-modal">
                    <div class="upload-progress-header">
                        <h2><i class="fas fa-cloud-upload-alt"></i> Uploading Images</h2>
                        <p class="upload-warning">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Please don't close this page while uploading
                        </p>
                    </div>
                    <div class="upload-progress-body">
                        <div class="upload-status-text" id="uploadStatusText">Preparing...</div>
                        <div class="upload-progress-counter" id="uploadProgressCounter">0 of 0 images</div>
                        <div class="upload-main-progress">
                            <div class="upload-main-progress-fill" id="uploadMainProgressFill"></div>
                        </div>
                        <div class="upload-percentage" id="uploadPercentage">0%</div>
                    </div>
                    <div class="upload-progress-spinner">
                        <div class="spinner-large"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
    }

    updateUploadProgress(current, total, message) {
        const overlay = document.getElementById('uploadProgressOverlay');
        if (!overlay) return;

        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        
        document.getElementById('uploadStatusText').textContent = message;
        document.getElementById('uploadProgressCounter').textContent = `${current} of ${total} images`;
        document.getElementById('uploadMainProgressFill').style.width = `${percentage}%`;
        document.getElementById('uploadPercentage').textContent = `${percentage}%`;
    }

    hideUploadProgressOverlay() {
        const overlay = document.getElementById('uploadProgressOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
        // Remove beforeunload warning
        window.onbeforeunload = null;
    }

    // --- MINISTRIES MANAGEMENT ---
    async loadMinistries() {
        try {
            const ministries = await API.get('/ministries');
            const tbody = document.getElementById('ministriesList');
            if (!tbody) return;
            
            if (!Array.isArray(ministries) || ministries.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #888;">No ministries found. Click "Add Ministry" to create one.</td></tr>';
                return;
            }
            tbody.innerHTML = ministries.map(m => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px 10px;">
                        ${m.image_url ? `
                            <img src="${m.image_url}" alt="${this.escapeHtml(m.name)}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: block;" onerror="this.src='https://via.placeholder.com/52?text=No+Img';">
                        ` : `
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: #f0f2f5; color: #888; border-radius: 6px; font-size: 0.75rem; border: 1px dashed #ccc;">
                                <i class="fas fa-image" style="font-size: 1.2rem;"></i>
                            </span>
                        `}
                    </td>
                    <td style="padding: 12px 10px; font-weight: 600; color: #333;">${this.escapeHtml(m.name)}</td>
                    <td style="padding: 12px 10px; color: #666; font-size: 0.9rem; max-width: 300px;">${this.escapeHtml(m.description || 'No description')}</td>
                    <td style="padding: 12px 10px; white-space: nowrap;">
                        <button class="btn btn-sm btn-secondary" onclick='openEditMinistry(${JSON.stringify(m).replace(/'/g, "&#39;")})' style="margin-right: 5px; padding: 5px 10px;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteMinistry(${m.id})" style="padding: 5px 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            logger.error('Error loading ministries:', error);
            this.showNotification('Failed to load ministries', 'error');
        }
    }

    async deleteMinistry(id) {
        if (!confirm('Are you sure you want to delete this ministry?')) return;
        try {
            await API.delete(`/ministries/${id}`);
            this.showNotification('Ministry deleted successfully', 'success');
            await this.loadMinistries();
        } catch (error) {
            logger.error('Error deleting ministry:', error);
            this.showNotification('Failed to delete ministry', 'error');
        }
    }

    // --- HERO BANNER MANAGEMENT ---
    async loadHeroTab() {
        try {
            const settings = await API.get('/settings');
            const heroUrl = settings?.hero_image || '';
            const urlInput = document.getElementById('heroTabUrlInput');
            const previewImg = document.getElementById('heroTabPreviewImg');
            const emptyPreview = document.getElementById('heroTabEmptyPreview');
            
            if (urlInput) urlInput.value = heroUrl;
            if (previewImg && emptyPreview) {
                if (heroUrl) {
                    previewImg.src = heroUrl;
                    previewImg.style.display = 'block';
                    emptyPreview.style.display = 'none';
                } else {
                    previewImg.src = '';
                    previewImg.style.display = 'none';
                    emptyPreview.style.display = 'block';
                }
            }
        } catch (error) {
            logger.error('Error loading hero banner settings:', error);
            this.showNotification('Failed to load hero banner configuration', 'error');
        }
    }

    // --- SETTINGS MANAGEMENT ---
    async loadSettings() {
        try {
            const settings = await API.get('/settings');
            if (settings) {
                if(settings.site_name && document.getElementById('siteName')) document.getElementById('siteName').value = settings.site_name;
                if(settings.site_description && document.getElementById('siteDescription')) document.getElementById('siteDescription').value = settings.site_description;
                if(settings.hero_image && document.getElementById('heroImage')) {
                    document.getElementById('heroImage').value = settings.hero_image;
                    const preview = document.getElementById('heroImagePreview');
                    if (preview) {
                        preview.src = settings.hero_image;
                        preview.style.display = 'block';
                    }
                }
                if(settings.facebook_page && document.getElementById('facebookPage')) document.getElementById('facebookPage').value = settings.facebook_page;
                if(settings.instagram_handle && document.getElementById('instagramHandle')) document.getElementById('instagramHandle').value = settings.instagram_handle;
            }
        } catch (error) {
            logger.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        const settings = {
            site_name: document.getElementById('siteName')?.value || '',
            site_description: document.getElementById('siteDescription')?.value || '',
            hero_image: document.getElementById('heroImage')?.value || '',
            facebook_page: document.getElementById('facebookPage')?.value || '',
            instagram_handle: document.getElementById('instagramHandle')?.value || ''
        };
        try {
            await API.put('/settings', settings);
            this.showNotification('Settings saved successfully', 'success');
        } catch (error) {
            logger.error('Error saving settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    // --- NOTIFICATIONS MANAGEMENT ---
    async loadNotifications() {
        try {
            const [prayers, comments] = await Promise.all([
                API.get('/prayer').catch(() => []),
                API.get('/admin/comments').catch(() => [])
            ]);
            
            const pendingPrayers = Array.isArray(prayers) ? prayers.filter(p => p.status === 'pending').length : 0;
            const pendingComments = Array.isArray(comments) ? comments.filter(c => c.status === 'pending').length : 0;
            const total = pendingPrayers + pendingComments;
            
            const badge = document.getElementById('notificationBadge');
            const list = document.getElementById('notificationList');
            
            if (badge) {
                badge.textContent = total;
                badge.style.display = total > 0 ? 'inline-block' : 'none';
            }
            
            if (list) {
                let html = '';
                if (pendingPrayers > 0) {
                    html += `<li style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="adminPanel.switchTab('prayers')">
                        <i class="fas fa-praying-hands" style="color: #007bff; margin-right: 5px;"></i> ${pendingPrayers} pending prayer request(s)
                    </li>`;
                }
                if (pendingComments > 0) {
                    html += `<li style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="adminPanel.switchTab('comments')">
                        <i class="fas fa-comments" style="color: #28a745; margin-right: 5px;"></i> ${pendingComments} pending comment(s)
                    </li>`;
                }
                if (total === 0) {
                    html = '<li style="padding: 10px; color: #888;">No new notifications</li>';
                }
                list.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading notifications', error);
        }
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .category-badge {
        background: var(--primary-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Global Submit Handlers for Modals
window.submitEvent = async function(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        event_date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value
    };
    try {
        await API.post('/events', data);
        adminPanel.showNotification('Event created successfully', 'success');
        document.getElementById('eventEditorModal').style.display = 'none';
        document.getElementById('eventForm').reset();
        adminPanel.loadEvents();
    } catch (error) {
        logger.error('Error saving event:', error);
        adminPanel.showNotification('Failed to save event', 'error');
    }
};

window.submitFellowship = async function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('fellowshipName').value,
        leader_name: document.getElementById('fellowshipLeader').value,
        address: document.getElementById('fellowshipAddress').value,
        meeting_time: document.getElementById('fellowshipTime').value,
        contact_phone: document.getElementById('fellowshipPhone').value
    };
    try {
        await API.post('/fellowships', data);
        adminPanel.showNotification('Fellowship created successfully', 'success');
        document.getElementById('fellowshipEditorModal').style.display = 'none';
        document.getElementById('fellowshipForm').reset();
        adminPanel.loadFellowships();
    } catch (error) {
        logger.error('Error saving fellowship:', error);
        adminPanel.showNotification('Failed to save fellowship', 'error');
    }
};

// Universal file upload helper using /api/upload (Cloudinary integration)
async function uploadFileToServer(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = Auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: headers,
        body: formData
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
        throw new Error(data.error || data.message || 'Image upload failed');
    }
    return data.url;
}

window.uploadHeroImageFile = async function() {
    const fileInput = document.getElementById('heroImageFile');
    if (!fileInput || !fileInput.files[0]) {
        adminPanel.showNotification('Please select an image file first', 'error');
        return;
    }

    adminPanel.showUploadProgressOverlay();
    adminPanel.updateUploadProgress(1, 1, 'Uploading Hero section image...');
    
    try {
        const url = await uploadFileToServer(fileInput.files[0]);
        const heroInput = document.getElementById('heroImage');
        if (heroInput) heroInput.value = url;
        const preview = document.getElementById('heroImagePreview');
        if (preview) {
            preview.src = url;
            preview.style.display = 'block';
        }
        adminPanel.showNotification('Hero image uploaded! Click "Save Settings" below to save.', 'success');
    } catch (err) {
        logger.error('Error uploading hero image:', err);
        adminPanel.showNotification(err.message || 'Failed to upload hero image', 'error');
    } finally {
        adminPanel.hideUploadProgressOverlay();
    }
};

// Hero Section Tab Handlers
window.uploadHeroFromTab = async function() {
    const fileInput = document.getElementById('heroTabFileInput');
    if (!fileInput || !fileInput.files[0]) {
        adminPanel.showNotification('Please select an image file first', 'error');
        return;
    }

    adminPanel.showUploadProgressOverlay();
    adminPanel.updateUploadProgress(1, 2, 'Uploading hero banner image...');
    try {
        const url = await uploadFileToServer(fileInput.files[0]);
        adminPanel.updateUploadProgress(2, 2, 'Saving hero banner...');
        await API.put('/settings', { hero_image: url });
        
        const urlInput = document.getElementById('heroTabUrlInput');
        const previewImg = document.getElementById('heroTabPreviewImg');
        const emptyPreview = document.getElementById('heroTabEmptyPreview');
        if (urlInput) urlInput.value = url;
        if (previewImg) {
            previewImg.src = url;
            previewImg.style.display = 'block';
        }
        if (emptyPreview) emptyPreview.style.display = 'none';
        
        fileInput.value = '';
        adminPanel.showNotification('Hero banner updated and applied successfully!', 'success');
    } catch (err) {
        logger.error('Error uploading hero banner:', err);
        adminPanel.showNotification(err.message || 'Failed to upload hero banner', 'error');
    } finally {
        adminPanel.hideUploadProgressOverlay();
    }
};

window.saveHeroUrlFromTab = async function() {
    const urlInput = document.getElementById('heroTabUrlInput');
    const url = urlInput ? urlInput.value.trim() : '';
    if (!url) {
        adminPanel.showNotification('Please enter an image URL', 'error');
        return;
    }

    adminPanel.showUploadProgressOverlay();
    adminPanel.updateUploadProgress(1, 1, 'Saving hero banner URL...');
    try {
        await API.put('/settings', { hero_image: url });
        const previewImg = document.getElementById('heroTabPreviewImg');
        const emptyPreview = document.getElementById('heroTabEmptyPreview');
        if (previewImg) {
            previewImg.src = url;
            previewImg.style.display = 'block';
        }
        if (emptyPreview) emptyPreview.style.display = 'none';
        adminPanel.showNotification('Hero banner URL saved successfully!', 'success');
    } catch (err) {
        logger.error('Error saving hero banner URL:', err);
        adminPanel.showNotification(err.message || 'Failed to save hero banner URL', 'error');
    } finally {
        adminPanel.hideUploadProgressOverlay();
    }
};

window.submitGalleryUpload = async function(e) {
    e.preventDefault();
    const title = document.getElementById('galleryTitle').value;
    const category = document.getElementById('galleryCategory').value;
    const fileInput = document.getElementById('galleryFile');
    
    if (!fileInput || !fileInput.files[0]) {
        adminPanel.showNotification('Please select a file', 'error');
        return;
    }
    
    adminPanel.showUploadProgressOverlay();
    adminPanel.updateUploadProgress(1, 2, 'Uploading gallery image...');
    try {
        const url = await uploadFileToServer(fileInput.files[0]);
        adminPanel.updateUploadProgress(2, 2, 'Saving gallery record...');
        await API.post('/gallery', { title, category, image_url: url });
        adminPanel.showNotification('Image uploaded successfully', 'success');
        document.getElementById('galleryUploadModal').style.display = 'none';
        document.getElementById('galleryForm').reset();
        await adminPanel.loadGalleryAdmin();
    } catch (error) {
        logger.error('Error uploading gallery image:', error);
        adminPanel.showNotification(error.message || 'Failed to upload image', 'error');
    } finally {
        adminPanel.hideUploadProgressOverlay();
    }
};

// Ministry Management Handlers
window.previewMinistryFile = function(input) {
    if (input && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('ministryImagePreview');
            const container = document.getElementById('ministryImagePreviewContainer');
            if (preview && container) {
                preview.src = e.target.result;
                container.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.previewMinistryUrl = function(url) {
    const preview = document.getElementById('ministryImagePreview');
    const container = document.getElementById('ministryImagePreviewContainer');
    if (preview && container) {
        if (url && url.trim()) {
            preview.src = url.trim();
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
};

window.openAddMinistry = function() {
    const form = document.getElementById('ministryForm');
    if (form) form.reset();
    document.getElementById('ministryId').value = '';
    document.getElementById('ministryModalTitle').textContent = 'Add Ministry';
    document.getElementById('ministrySubmitBtn').textContent = 'Create Ministry';
    const previewContainer = document.getElementById('ministryImagePreviewContainer');
    if (previewContainer) previewContainer.style.display = 'none';
    document.getElementById('ministryEditorModal').style.display = 'flex';
};

window.openEditMinistry = function(ministry) {
    document.getElementById('ministryId').value = ministry.id;
    document.getElementById('ministryName').value = ministry.name || '';
    document.getElementById('ministryDescription').value = ministry.description || '';
    document.getElementById('ministryImageUrl').value = ministry.image_url || '';
    document.getElementById('ministryImageFile').value = '';
    document.getElementById('ministryModalTitle').textContent = 'Edit Ministry';
    document.getElementById('ministrySubmitBtn').textContent = 'Update Ministry';
    
    const preview = document.getElementById('ministryImagePreview');
    const container = document.getElementById('ministryImagePreviewContainer');
    if (preview && container) {
        if (ministry.image_url) {
            preview.src = ministry.image_url;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
    document.getElementById('ministryEditorModal').style.display = 'flex';
};

window.submitMinistry = async function(e) {
    e.preventDefault();
    const id = document.getElementById('ministryId').value;
    const name = document.getElementById('ministryName').value.trim();
    const description = document.getElementById('ministryDescription').value.trim();
    const fileInput = document.getElementById('ministryImageFile');
    const urlInput = document.getElementById('ministryImageUrl');
    
    adminPanel.showUploadProgressOverlay();
    adminPanel.updateUploadProgress(1, 2, id ? 'Updating ministry...' : 'Creating ministry...');
    
    try {
        let imageUrl = urlInput ? urlInput.value.trim() : null;
        if (fileInput && fileInput.files[0]) {
            adminPanel.updateUploadProgress(1, 2, 'Uploading ministry image...');
            imageUrl = await uploadFileToServer(fileInput.files[0]);
        }
        
        adminPanel.updateUploadProgress(2, 2, 'Saving ministry details...');
        if (id) {
            await API.put(`/ministries/${id}`, { name, description, image_url: imageUrl });
            adminPanel.showNotification('Ministry updated successfully!', 'success');
        } else {
            await API.post('/ministries', { name, description, image_url: imageUrl });
            adminPanel.showNotification('Ministry created successfully!', 'success');
        }
        
        document.getElementById('ministryEditorModal').style.display = 'none';
        document.getElementById('ministryForm').reset();
        await adminPanel.loadMinistries();
    } catch (error) {
        logger.error('Error saving ministry:', error);
        adminPanel.showNotification(error.message || 'Failed to save ministry', 'error');
    } finally {
        adminPanel.hideUploadProgressOverlay();
    }
};

// Initialize the admin panel when the page loads
let adminPanel;
function initAdmin() {
    if (!adminPanel) {
        adminPanel = new AdminPanel();
        window.adminPanel = adminPanel;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}
