// API Configuration - Uses environment-based config
const API_BASE = window.ENV ? window.ENV.apiBaseUrl : (window.location.origin + '/api');

// Blog Page JavaScript with Database Integration
class BlogPage {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentSort = 'newest';
        this.posts = [];
        this.categories = [];
        this.totalPages = 1;
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadPosts();
        this.setupEventListeners();
        this.renderSidebar();
    }

    async loadCategories() {
        try {
            const response = await fetch(`${API_BASE}/blog/categories`);
            this.categories = await response.json();
            this.updateCategoryCounts();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadPosts() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.postsPerPage
            });

            if (this.currentCategory !== 'all') {
                // Find category ID by slug
                const category = this.categories.find(cat => cat.slug === this.currentCategory);
                if (category) {
                    params.append('category', category.slug);
                }
            }

            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }

            // Convert sort option to API parameters
            if (this.currentSort === 'newest') {
                params.append('sortBy', 'published_at');
                params.append('sortOrder', 'DESC');
            } else if (this.currentSort === 'oldest') {
                params.append('sortBy', 'published_at');
                params.append('sortOrder', 'ASC');
            } else if (this.currentSort === 'popular') {
                params.append('sortBy', 'views');
                params.append('sortOrder', 'DESC');
            }

            const response = await fetch(`${API_BASE}/blog?${params}`);
            const data = await response.json();
            
            this.posts = data.posts;
            this.totalPages = data.pagination.totalPages;
            
            this.renderBlogPosts();
            this.renderPagination();
            this.updatePostsCount();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showNotification('Failed to load blog posts', 'error');
        }
    }

    renderBlogPosts() {
        const blogContainer = document.getElementById('blogPosts');
        
        if (this.posts.length === 0) {
            blogContainer.innerHTML = `
                <div class="no-posts" style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        blogContainer.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
    }

    createPostCard(post) {
        const formattedDate = this.formatDate(post.published_at || post.created_at);
        const categoryIcon = this.getCategoryIcon(post.category_slug);
        
        return `
            <article class="blog-post-card">
                <div class="blog-post-image">
                    <i class="${categoryIcon}"></i>
                    <div class="blog-post-category">${post.category_name || 'Uncategorized'}</div>
                </div>
                <div class="blog-post-content">
                    <div class="blog-post-meta">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-user"></i> ${post.author_name || 'Unknown'}</span>
                    </div>
                    <h3 class="blog-post-title">
                        <a href="#" onclick="blogPage.openPost(${post.id})">${post.title}</a>
                    </h3>
                    <p class="blog-post-excerpt">${post.excerpt || ''}</p>
                    <div class="blog-post-footer">
                        <a href="#" class="read-more-btn" onclick="blogPage.openPost(${post.id})">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="blog-post-stats">
                            <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                            <span><i class="fas fa-heart"></i> ${post.likes || 0} likes</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    renderPagination() {
        const paginationContainer = document.querySelector('.pagination');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.querySelector('.page-info');

        // Update page info
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }

        // Update button states
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;

        // Add pagination numbers if container exists
        const pageNumbers = paginationContainer.querySelector('.page-numbers');
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            for (let i = 1; i <= this.totalPages; i++) {
                if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.onclick = () => this.goToPage(i);
                    pageNumbers.appendChild(pageBtn);
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    ellipsis.className = 'pagination-ellipsis';
                    pageNumbers.appendChild(ellipsis);
                }
            }
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setActiveFilter(e.target);
                this.filterPosts(category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('blogSearch');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchPosts(e.target.value);
            }, 300));
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchPosts(searchInput.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortPosts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortPosts(e.target.value);
            });
        }

        // Pagination
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            });
        }

        // Newsletter signup
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSignup(e);
            });
        }
    }

    setActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    async filterPosts(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        await this.loadPosts();
        this.scrollToTop();
    }

    async searchPosts(query) {
        this.currentSearch = query.toLowerCase();
        this.currentPage = 1;
        await this.loadPosts();
        this.scrollToTop();
    }

    async sortPosts(sortBy) {
        this.currentSort = sortBy;
        this.currentPage = 1;
        await this.loadPosts();
        this.scrollToTop();
    }

    async goToPage(page) {
        this.currentPage = page;
        await this.loadPosts();
        this.scrollToTop();
    }

    scrollToTop() {
        const blogContent = document.querySelector('.blog-content');
        if (blogContent) {
            blogContent.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }    }

    async openPost(postId) {
        // Redirect to dedicated post page
        // Use current domain to avoid cross-origin issues
        const baseUrl = window.ENV ? window.ENV.baseUrl : window.location.origin;
        window.location.href = `${baseUrl}/post.html?id=${postId}`;
    }

    showPostModal(post) {
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="post-modal-overlay" onclick="blogPage.closePostModal()"></div>
            <div class="post-modal-content">
                <div class="post-modal-header">
                    <button class="close-modal" onclick="blogPage.closePostModal()" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="post-modal-body">
                    <div class="post-header">
                        <div class="post-category-badge">${post.category_name || 'Uncategorized'}</div>
                        <h1>${post.title}</h1>
                        <div class="post-meta">
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(post.published_at || post.created_at)}</span>
                            <span><i class="fas fa-user"></i> ${post.author_name || 'Unknown'}</span>
                            <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                        </div>
                    </div>
                    <div class="post-content">
                        ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="post-featured-image">` : ''}
                        <div class="post-text">
                            ${post.content || post.excerpt || ''}
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="action-btn like-btn" onclick="blogPage.toggleLike(${post.id})">
                            <i class="fas fa-heart"></i> Like (${post.likes || 0})
                        </button>
                        <button class="action-btn share-btn" onclick="blogPage.sharePost(${post.id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    closePostModal() {
        const modal = document.querySelector('.post-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    async renderSidebar() {
        // Render recent posts
        await this.renderRecentPosts();
        
        // Update category counts
        this.updateCategoryCounts();
    }

    async renderRecentPosts() {
        try {
            const response = await fetch(`${API_BASE}/blog/recent?limit=5`);
            const recentPosts = await response.json();
            const recentPostsContainer = document.getElementById('recentPosts');
            
            if (recentPostsContainer && recentPosts.length > 0) {
                recentPostsContainer.innerHTML = recentPosts.map(post => `
                    <div class="recent-post-item">
                        <div class="recent-post-image">
                            <i class="${this.getCategoryIcon(post.category_slug)}"></i>
                        </div>
                        <div class="recent-post-content">
                            <h5><a href="#" onclick="blogPage.openPost(${post.id})">${post.title}</a></h5>
                            <div class="recent-post-date">${this.formatDate(post.published_at || post.created_at)}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            const countElement = document.querySelector(`[data-category="${category.slug}"] .category-count`);
            if (countElement) {
                countElement.textContent = category.post_count || 0;
            }
        });
    }

    updatePostsCount() {
        const postsCount = document.getElementById('postsCount');
        if (postsCount) {
            const totalPosts = this.posts.length;
            const startIndex = (this.currentPage - 1) * this.postsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.postsPerPage, totalPosts);
            
            if (totalPosts === 0) {
                postsCount.textContent = 'No posts found';
            } else {
                postsCount.textContent = `Showing ${startIndex}-${endIndex} of ${totalPosts} posts`;
            }
        }
    }

    async toggleLike(postId) {
        // Implement like functionality
        this.showNotification('Like functionality coming soon!', 'info');
    }

    sharePost(postId) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post',
                url: window.location.href
            });
        } else {
            // Fallback to copy URL
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    handleNewsletterSignup(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simulate newsletter signup
        this.showNotification('Thank you for subscribing to our newsletter!', 'success');
        e.target.reset();
        
        console.log('Newsletter signup:', email);
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    getCategoryIcon(categorySlug) {
        const icons = {
            'spiritual-growth': 'fas fa-seedling',
            'testimony': 'fas fa-heart',
            'ministry': 'fas fa-hands-helping',
            'family': 'fas fa-users',
            'prayer': 'fas fa-praying-hands',
            'youth': 'fas fa-graduation-cap',
            'worship': 'fas fa-music'
        };
        return icons[categorySlug] || 'fas fa-file-alt';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the blog page
let blogPage;
document.addEventListener('DOMContentLoaded', function() {
    blogPage = new BlogPage();
});

// Export functions for global access
window.BlogPage = {
    openPost: (id) => blogPage.openPost(id),
    goToPage: (page) => blogPage.goToPage(page),
    filterPosts: (category) => blogPage.filterPosts(category),
    searchPosts: (query) => blogPage.searchPosts(query),
    sortPosts: (sortBy) => blogPage.sortPosts(sortBy),
    closePostModal: () => blogPage.closePostModal(),
    toggleLike: (id) => blogPage.toggleLike(id),
    sharePost: (id) => blogPage.sharePost(id)
};
