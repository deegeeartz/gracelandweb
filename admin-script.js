// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.sermons = JSON.parse(localStorage.getItem('sermons')) || [];
        this.quillEditor = null;
        this.currentEditingPost = null;
        
        this.init();
        this.loadSampleData();
    }

    init() {
        this.setupEventListeners();
        this.initializeQuillEditor();
        this.loadDashboardData();
        this.loadBlogPosts();
        this.loadSermons();
        this.updateStats();
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

        // Social sharing
        document.getElementById('confirmShare').addEventListener('click', () => {
            this.shareToSocialMedia();
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

    switchTab(tab) {
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
            this.loadBlogPosts();
        } else if (tab === 'sermons') {
            this.loadSermons();
        } else if (tab === 'social-media') {
            this.loadSocialMediaData();
        }
    }

    openPostEditor(post = null) {
        this.currentEditingPost = post;
        const modal = document.getElementById('postEditorModal');
        const title = document.getElementById('editorTitle');
        
        if (post) {
            title.textContent = 'Edit Post';
            this.populatePostForm(post);
        } else {
            title.textContent = 'Create New Post';
            this.clearPostForm();
        }
        
        modal.classList.add('active');
    }

    closePostEditor() {
        document.getElementById('postEditorModal').classList.remove('active');
        this.currentEditingPost = null;
        this.clearPostForm();
    }

    populatePostForm(post) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postAuthor').value = post.author;
        document.getElementById('postExcerpt').value = post.excerpt;
        document.getElementById('postStatus').value = post.status;
        document.getElementById('publishDate').value = post.publishDate;
        
        if (this.quillEditor) {
            this.quillEditor.setContents(post.content);
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

    savePost() {
        const formData = {
            id: this.currentEditingPost ? this.currentEditingPost.id : Date.now(),
            title: document.getElementById('postTitle').value,
            category: document.getElementById('postCategory').value,
            author: document.getElementById('postAuthor').value,
            excerpt: document.getElementById('postExcerpt').value,
            content: this.quillEditor.getContents(),
            contentHtml: this.quillEditor.root.innerHTML,
            status: document.getElementById('postStatus').value,
            publishDate: document.getElementById('publishDate').value,
            createdAt: this.currentEditingPost ? this.currentEditingPost.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: this.currentEditingPost ? this.currentEditingPost.views : 0,
            comments: this.currentEditingPost ? this.currentEditingPost.comments : 0,
            shares: this.currentEditingPost ? this.currentEditingPost.shares : 0
        };

        if (this.currentEditingPost) {
            // Update existing post
            const index = this.posts.findIndex(p => p.id === this.currentEditingPost.id);
            this.posts[index] = formData;
        } else {
            // Add new post
            this.posts.unshift(formData);
        }

        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));

        // Check for social media sharing
        const shareToFacebook = document.getElementById('shareToFacebook').checked;
        const shareToInstagram = document.getElementById('shareToInstagram').checked;
        const shareToTwitter = document.getElementById('shareToTwitter').checked;

        if (shareToFacebook || shareToInstagram || shareToTwitter) {
            this.schedulePostShare(formData, { shareToFacebook, shareToInstagram, shareToTwitter });
        }

        this.showNotification('Post saved successfully!', 'success');
        this.closePostEditor();
        this.loadBlogPosts();
        this.updateStats();
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(post => post.id !== postId);
            localStorage.setItem('blogPosts', JSON.stringify(this.posts));
            this.loadBlogPosts();
            this.updateStats();
            this.showNotification('Post deleted successfully!', 'success');
        }
    }

    filterPosts() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let filteredPosts = this.posts;

        if (statusFilter !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
        }

        this.renderPostsTable(filteredPosts);
    }

    loadBlogPosts() {
        this.renderPostsTable(this.posts);
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
                    <small style="color: var(--gray-500);">${post.excerpt.substring(0, 50)}...</small>
                </td>
                <td>
                    <span class="category-badge">${this.formatCategory(post.category)}</span>
                </td>
                <td>${post.author}</td>
                <td>
                    <span class="status-badge status-${post.status}">${post.status}</span>
                </td>
                <td>${this.formatDate(post.createdAt)}</td>
                <td>${post.views}</td>
                <td>
                    <div class="action-buttons-table">
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.openPostEditor(${JSON.stringify(post).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.openSocialShareModal(${post.id})">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deletePost(${post.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openSocialShareModal(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        document.getElementById('shareTitle').textContent = post.title;
        document.getElementById('shareExcerpt').textContent = post.excerpt;
        document.getElementById('socialShareModal').classList.add('active');
    }

    closeSocialShareModal() {
        document.getElementById('socialShareModal').classList.remove('active');
    }

    shareToSocialMedia() {
        const selectedPlatforms = Array.from(document.querySelectorAll('.platform-option input:checked'))
            .map(checkbox => checkbox.value);
        
        const customMessage = document.getElementById('shareMessage').value;

        if (selectedPlatforms.length === 0) {
            this.showNotification('Please select at least one platform to share to.', 'warning');
            return;
        }

        // Simulate social media sharing
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            this.showNotification(`Post shared to ${selectedPlatforms.join(', ')} successfully!`, 'success');
            this.closeSocialShareModal();
            this.logSocialShare(selectedPlatforms, customMessage);
        }, 2000);
    }

    schedulePostShare(post, platforms) {
        // This would integrate with actual social media APIs
        console.log('Scheduling post share:', post, platforms);
        
        // Simulate scheduling
        const shareData = {
            postId: post.id,
            postTitle: post.title,
            platforms: platforms,
            scheduledAt: new Date().toISOString(),
            status: 'scheduled'
        };

        this.logSocialShare(Object.keys(platforms).filter(key => platforms[key]), 'Auto-shared from blog post');
    }

    logSocialShare(platforms, message) {
        const shareHistory = JSON.parse(localStorage.getItem('shareHistory')) || [];
        
        const shareRecord = {
            id: Date.now(),
            platforms: platforms,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'success'
        };

        shareHistory.unshift(shareRecord);
        localStorage.setItem('shareHistory', JSON.stringify(shareHistory));
    }

    loadSocialMediaData() {
        const shareHistory = JSON.parse(localStorage.getItem('shareHistory')) || [];
        const historyContainer = document.getElementById('sharingHistory');
        
        if (shareHistory.length === 0) {
            historyContainer.innerHTML = '<p style="color: var(--gray-500); text-align: center;">No sharing history yet.</p>';
            return;
        }

        historyContainer.innerHTML = shareHistory.slice(0, 10).map(share => `
            <div class="share-history-item" style="background: var(--white); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 0.5rem; box-shadow: var(--box-shadow);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Shared to: ${share.platforms.join(', ')}</strong>
                        <br>
                        <small style="color: var(--gray-500);">${this.formatDate(share.timestamp)}</small>
                    </div>
                    <span class="status-badge status-${share.status}">${share.status}</span>
                </div>
                ${share.message ? `<p style="margin-top: 0.5rem; color: var(--gray-600);">${share.message}</p>` : ''}
            </div>
        `).join('');
    }

    loadSermons() {
        const sermonsGrid = document.getElementById('sermonsGrid');
        
        if (this.sermons.length === 0) {
            sermonsGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    No sermons uploaded yet. <button class="btn btn-primary" onclick="adminPanel.openSermonEditor()">Add your first sermon</button>
                </div>
            `;
            return;
        }

        sermonsGrid.innerHTML = this.sermons.map(sermon => `
            <div class="sermon-admin-card" style="background: var(--white); border-radius: var(--border-radius); box-shadow: var(--box-shadow); padding: 1.5rem;">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">${sermon.title}</h3>
                        <p style="color: var(--gray-600); margin-bottom: 0.5rem;">${sermon.speaker}</p>
                        <p style="color: var(--gray-500); font-size: 0.9rem;">${this.formatDate(sermon.date)}</p>
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
                <p style="color: var(--gray-600); line-height: 1.5;">${sermon.description}</p>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); display: flex; gap: 1rem;">
                    <span style="font-size: 0.9rem; color: var(--gray-500);">
                        <i class="fas fa-eye"></i> ${sermon.listens} listens
                    </span>
                    <span style="font-size: 0.9rem; color: var(--gray-500);">
                        <i class="fas fa-download"></i> ${sermon.downloads} downloads
                    </span>
                </div>
            </div>
        `).join('');
    }

    openSermonEditor() {
        // This would open a sermon editor modal similar to the post editor
        this.showNotification('Sermon editor coming soon!', 'info');
    }

    loadDashboardData() {
        const recentPostsList = document.getElementById('recentPostsList');
        const recentPosts = this.posts.slice(0, 5);
        
        if (recentPosts.length === 0) {
            recentPostsList.innerHTML = '<p style="color: var(--gray-500);">No recent posts.</p>';
            return;
        }

        recentPostsList.innerHTML = recentPosts.map(post => `
            <div class="recent-post-item" style="padding: 1rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin-bottom: 0.25rem; color: var(--gray-900);">${post.title}</h4>
                    <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0;">${this.formatDate(post.createdAt)} • ${post.views} views</p>
                </div>
                <span class="status-badge status-${post.status}">${post.status}</span>
            </div>
        `).join('');
    }

    updateStats() {
        const totalPosts = this.posts.length;
        const totalViews = this.posts.reduce((sum, post) => sum + post.views, 0);
        const totalShares = this.posts.reduce((sum, post) => sum + post.shares, 0);
        const totalComments = this.posts.reduce((sum, post) => sum + post.comments, 0);

        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalShares').textContent = totalShares;
        document.getElementById('totalComments').textContent = totalComments;
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

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);">
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    searchContent(query) {
        if (!query.trim()) {
            this.loadBlogPosts();
            return;
        }

        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            post.author.toLowerCase().includes(query.toLowerCase())
        );

        this.renderPostsTable(filteredPosts);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="background: var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'}-color); color: white; padding: 1rem 1.5rem; border-radius: var(--border-radius); box-shadow: var(--box-shadow-lg); position: fixed; top: 20px; right: 20px; z-index: 10000; animation: slideInRight 0.3s ease-out;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 1rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    loadSampleData() {
        // Load sample data if no posts exist
        if (this.posts.length === 0) {
            this.posts = [
                {
                    id: 1,
                    title: "Building a Strong Prayer Life",
                    category: "spiritual-growth",
                    author: "Pastor Grace Adebayo",
                    excerpt: "Prayer is the foundation of our relationship with God. Discover practical tips to strengthen your prayer life and develop deeper intimacy with the Father.",
                    content: {},
                    contentHtml: "<p>Prayer is the foundation of our relationship with God...</p>",
                    status: "published",
                    publishDate: "2024-10-15T10:00",
                    createdAt: "2024-10-15T10:00:00.000Z",
                    updatedAt: "2024-10-15T10:00:00.000Z",
                    views: 245,
                    comments: 12,
                    shares: 18
                },
                {
                    id: 2,
                    title: "God's Faithfulness in My Journey",
                    category: "testimony",
                    author: "Sister Mary Johnson",
                    excerpt: "A powerful testimony of God's faithfulness through life's challenges and His amazing provision in times of need.",
                    content: {},
                    contentHtml: "<p>A powerful testimony of God's faithfulness...</p>",
                    status: "published",
                    publishDate: "2024-10-12T09:00",
                    createdAt: "2024-10-12T09:00:00.000Z",
                    updatedAt: "2024-10-12T09:00:00.000Z",
                    views: 189,
                    comments: 8,
                    shares: 15
                }
            ];
            localStorage.setItem('blogPosts', JSON.stringify(this.posts));
        }

        // Load sample sermons if none exist
        if (this.sermons.length === 0) {
            this.sermons = [
                {
                    id: 1,
                    title: "Walking in Faith, Not Fear",
                    speaker: "Pastor Michael Johnson",
                    date: "2024-10-13T07:00:00.000Z",
                    description: "Discover how to overcome fear and walk boldly in the faith God has given you. Learn practical steps to trust God in uncertain times.",
                    listens: 156,
                    downloads: 89
                },
                {
                    id: 2,
                    title: "The Power of God's Grace",
                    speaker: "Pastor Sarah Williams",
                    date: "2024-10-06T07:00:00.000Z",
                    description: "Understanding the transformative power of grace in our daily lives and relationships.",
                    listens: 134,
                    downloads: 67
                }
            ];
            localStorage.setItem('sermons', JSON.stringify(this.sermons));
        }
    }
}

// Add CSS animation for notifications
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
    openPostEditor: (post) => adminPanel.openPostEditor(post),
    deletePost: (id) => adminPanel.deletePost(id),
    openSocialShareModal: (id) => adminPanel.openSocialShareModal(id)
};
