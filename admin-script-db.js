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
            console.error('Auth check failed:', error);
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
            console.error('API request failed:', error);
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
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.posts = [];
        this.sermons = [];
        this.categories = [];
        this.quillEditor = null;
        this.currentEditingPost = null;
        this.currentPage = 1;
        this.totalPages = 1;
        
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
            });
        });

        // Image upload
        document.getElementById('featuredImage').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContent(e.target.value);
        });

        // Logout functionality
        document.querySelector('.logout-btn').addEventListener('click', () => {
            this.logout();
        });
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
            console.error('Error loading categories:', error);
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
    }

    initializeQuillEditor() {
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
        ];

        this.quillEditor = new Quill('#postContent', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
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
            'social-media': 'Social Media',
            'settings': 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[tab];

        this.currentTab = tab;

        // Load tab-specific data
        if (tab === 'blog-posts') {
            await this.loadBlogPosts();
        } else if (tab === 'sermons') {
            await this.loadSermons();
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
            console.error('Error loading dashboard data:', error);
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
            console.error('Error updating stats:', error);
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
            console.error('Error loading blog posts:', error);
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
            console.error('Error loading post for editing:', error);
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
    }

    closePostEditor() {
        document.getElementById('postEditorModal').classList.remove('active');
        this.currentEditingPost = null;
        this.clearPostForm();
    }    async savePost() {
        try {
            // Get uploaded image data if available
            const uploadedImage = window.getUploadedImageData ? window.getUploadedImageData() : null;
            
            const formData = {
                title: document.getElementById('postTitle').value,
                excerpt: document.getElementById('postExcerpt').value,
                content: this.quillEditor.root.innerHTML,
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
            }

            if (this.currentEditingPost) {
                await API.put(`/admin/posts/${this.currentEditingPost.id}`, formData);
                this.showNotification('Post updated successfully!', 'success');
            } else {
                await API.post('/admin/posts', formData);
                this.showNotification('Post created successfully!', 'success');
            }

            this.closePostEditor();
            await this.loadBlogPosts();
            await this.updateStats();
        } catch (error) {
            console.error('Error saving post:', error);
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
            console.error('Error deleting post:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async filterPosts() {
        this.currentPage = 1;
        await this.loadBlogPosts();
    }

    async searchContent(query) {
        // Implement search functionality
        console.log('Search:', query);
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
            console.error('Error loading sermons:', error);
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
            console.error('Error deleting sermon:', error);
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
            console.error('Image upload error:', error);
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
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

// Initialize the admin panel when the page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// Global functions for onclick handlers
window.adminPanel = {
    openPostEditor: (postId) => adminPanel.openPostEditor(postId),
    deletePost: (id) => adminPanel.deletePost(id),
    deleteSermon: (id) => adminPanel.deleteSermon(id),
    editSermon: (id) => adminPanel.editSermon(id)
};
