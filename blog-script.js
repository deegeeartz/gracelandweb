// Blog Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPage();
});

// Blog data - In production, this would come from your backend/CMS
const blogPosts = [
    {
        id: 1,
        title: "Walking in Divine Purpose",
        excerpt: "Discovering God's plan for your life and stepping into your divine calling with faith and confidence.",
        category: "sermon",
        author: "Pastor David Adeoye",
        date: "2024-10-15",
        views: 342,
        comments: 18,
        featured: true
    },
    {
        id: 2,
        title: "The Power of Persistent Prayer",
        excerpt: "Understanding how persistent prayer can transform your life and bring breakthrough in impossible situations.",
        category: "prayer",
        author: "Pastor Sarah Johnson",
        date: "2024-10-12",
        views: 256,
        comments: 12
    },
    {
        id: 3,
        title: "My Healing Testimony",
        excerpt: "How God miraculously healed me from a terminal illness and restored my family. A testimony of God's faithfulness.",
        category: "testimony",
        author: "Sister Mary Okafor",
        date: "2024-10-10",
        views: 421,
        comments: 28
    },
    {
        id: 4,
        title: "Raising Godly Children",
        excerpt: "Biblical principles for nurturing children in the fear and admonition of the Lord. Building strong foundations.",
        category: "family",
        author: "Pastor Ruth Eze",
        date: "2024-10-08",
        views: 189,
        comments: 15
    },
    {
        id: 5,
        title: "Youth Empowerment in Christ",
        excerpt: "Empowering young people to discover their identity in Christ and make a positive impact in their generation.",
        category: "youth",
        author: "Pastor Michael Obi",
        date: "2024-10-05",
        views: 298,
        comments: 22
    },
    {
        id: 6,
        title: "Worship That Transforms",
        excerpt: "Understanding true worship that goes beyond singing to a lifestyle that honors God in all we do.",
        category: "worship",
        author: "Minister Grace Adebayo",
        date: "2024-10-03",
        views: 167,
        comments: 9
    },
    {
        id: 7,
        title: "Financial Freedom God's Way",
        excerpt: "Biblical principles for managing finances, breaking the cycle of poverty, and walking in God's abundance.",
        category: "sermon",
        author: "Pastor David Adeoye",
        date: "2024-09-30",
        views: 445,
        comments: 31
    },
    {
        id: 8,
        title: "From Addiction to Freedom",
        excerpt: "My journey from drug addiction to complete freedom in Christ. God can break any chain that binds you.",
        category: "testimony",
        author: "Brother John Okwu",
        date: "2024-09-28",
        views: 523,
        comments: 45
    },
    {
        id: 9,
        title: "Building Strong Marriages",
        excerpt: "God's blueprint for marriage: love, respect, communication, and putting Christ at the center of your union.",
        category: "family",
        author: "Pastor & Mrs. Adeoye",
        date: "2024-09-25",
        views: 312,
        comments: 19
    },
    {
        id: 10,
        title: "Intercessory Prayer Workshop",
        excerpt: "Join us as we learn the art of standing in the gap for others through powerful, effective intercessory prayer.",
        category: "prayer",
        author: "Prayer Team",
        date: "2024-09-22",
        views: 201,
        comments: 14
    },
    {
        id: 11,
        title: "Youth Conference 2024 Highlights",
        excerpt: "Recap of our amazing youth conference with powerful testimonies, worship, and life-changing messages.",
        category: "youth",
        author: "Youth Ministry",
        date: "2024-09-20",
        views: 387,
        comments: 33
    },
    {
        id: 12,
        title: "The Heart of True Worship",
        excerpt: "Exploring what it means to be a true worshipper and how worship transforms our relationship with God.",
        category: "worship",
        author: "Worship Team",
        date: "2024-09-18",
        views: 234,
        comments: 16
    }
];

// Pagination settings
let currentPage = 1;
const postsPerPage = 6;
let filteredPosts = [...blogPosts];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';

function initializeBlogPage() {
    setupEventListeners();
    renderBlogPosts();
    renderSidebar();
    updatePostsCount();
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            setActiveFilter(e.target);
            filterPosts(category);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('blogSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', debounce((e) => {
        searchPosts(e.target.value);
    }, 300));
    
    searchBtn.addEventListener('click', () => {
        searchPosts(searchInput.value);
    });

    // Sort functionality
    document.getElementById('sortPosts').addEventListener('change', (e) => {
        sortPosts(e.target.value);
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBlogPosts();
            scrollToTop();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBlogPosts();
            scrollToTop();
        }
    });

    // Newsletter form
    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleNewsletterSignup(e);
    });

    // Category links in sidebar
    document.querySelectorAll('.category-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.currentTarget.dataset.category;
            setActiveFilter(document.querySelector(`[data-category="${category}"]`));
            filterPosts(category);
        });
    });
}

function setActiveFilter(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function filterPosts(category) {
    currentCategory = category;
    currentPage = 1;
    
    if (category === 'all') {
        filteredPosts = [...blogPosts];
    } else {
        filteredPosts = blogPosts.filter(post => post.category === category);
    }
    
    // Apply current search if exists
    if (currentSearch) {
        applySearch();
    }
    
    // Apply current sort
    applySorting();
    
    renderBlogPosts();
    updatePostsCount();
}

function searchPosts(query) {
    currentSearch = query.toLowerCase();
    currentPage = 1;
    
    // Start with category filter
    let posts = currentCategory === 'all' ? [...blogPosts] : blogPosts.filter(post => post.category === currentCategory);
    
    // Apply search filter
    if (currentSearch) {
        filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(currentSearch) ||
            post.excerpt.toLowerCase().includes(currentSearch) ||
            post.author.toLowerCase().includes(currentSearch)
        );
    } else {
        filteredPosts = posts;
    }
    
    // Apply current sort
    applySorting();
    
    renderBlogPosts();
    updatePostsCount();
}

function applySearch() {
    if (currentSearch) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(currentSearch) ||
            post.excerpt.toLowerCase().includes(currentSearch) ||
            post.author.toLowerCase().includes(currentSearch)
        );
    }
}

function sortPosts(sortBy) {
    currentSort = sortBy;
    applySorting();
    renderBlogPosts();
}

function applySorting() {
    switch (currentSort) {
        case 'newest':
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => b.views - a.views);
            break;
        case 'title':
            filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

function renderBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    if (postsToShow.length === 0) {
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <a href="#" class="btn" onclick="resetFilters()">
                    <i class="fas fa-refresh"></i> Show All Posts
                </a>
            </div>
        `;
        return;
    }
    
    blogGrid.innerHTML = postsToShow.map(post => createPostCard(post)).join('');
    renderPagination();
}

function createPostCard(post) {
    const formattedDate = formatDate(post.date);
    const categoryIcon = getCategoryIcon(post.category);
    
    return `
        <article class="blog-post-card">
            <div class="blog-post-image">
                <i class="${categoryIcon}"></i>
                <div class="blog-post-category">${capitalizeFirst(post.category)}</div>
            </div>
            <div class="blog-post-content">
                <div class="blog-post-meta">
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                </div>
                <h3 class="blog-post-title">
                    <a href="#" onclick="openPost(${post.id})">${post.title}</a>
                </h3>
                <p class="blog-post-excerpt">${post.excerpt}</p>
                <div class="blog-post-footer">
                    <a href="#" class="read-more-btn" onclick="openPost(${post.id})">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const paginationNumbers = document.getElementById('paginationNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    let paginationHTML = '';
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <a href="#" class="pagination-number ${i === currentPage ? 'active' : ''}" 
               onclick="goToPage(${i})">${i}</a>
        `;
    }
    
    paginationNumbers.innerHTML = paginationHTML;
}

function renderSidebar() {
    renderRecentPosts();
    updateCategoryCounts();
}

function renderRecentPosts() {
    const recentPostsContainer = document.getElementById('recentPosts');
    const recentPosts = blogPosts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentPostsContainer.innerHTML = recentPosts.map(post => `
        <div class="recent-post-item">
            <div class="recent-post-image">
                <i class="${getCategoryIcon(post.category)}"></i>
            </div>
            <div class="recent-post-content">
                <h5><a href="#" onclick="openPost(${post.id})">${post.title}</a></h5>
                <div class="recent-post-date">${formatDate(post.date)}</div>
            </div>
        </div>
    `).join('');
}

function updateCategoryCounts() {
    const categories = ['sermon', 'testimony', 'family', 'prayer', 'youth', 'worship'];
    
    categories.forEach(category => {
        const count = blogPosts.filter(post => post.category === category).length;
        const countElement = document.querySelector(`[data-category="${category}"] .category-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

function updatePostsCount() {
    const postsCount = document.getElementById('postsCount');
    const totalPosts = filteredPosts.length;
    const startIndex = (currentPage - 1) * postsPerPage + 1;
    const endIndex = Math.min(currentPage * postsPerPage, totalPosts);
    
    if (totalPosts === 0) {
        postsCount.textContent = 'No posts found';
    } else {
        postsCount.textContent = `Showing ${startIndex}-${endIndex} of ${totalPosts} posts`;
    }
}

function goToPage(page) {
    currentPage = page;
    renderBlogPosts();
    scrollToTop();
}

function scrollToTop() {
    document.querySelector('.blog-content').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function resetFilters() {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = 'newest';
    currentPage = 1;
    
    // Reset UI
    document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
    document.querySelectorAll('.filter-btn:not([data-category="all"])').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('blogSearch').value = '';
    document.getElementById('sortPosts').value = 'newest';
    
    // Reset data
    filteredPosts = [...blogPosts];
    applySorting();
    renderBlogPosts();
    updatePostsCount();
}

function openPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        showPostModal(post);
    }
}

function showPostModal(post) {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="post-modal-overlay" onclick="closePostModal()"></div>
        <div class="post-modal-content">
            <div class="post-modal-header">
                <button class="close-modal" onclick="closePostModal()" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="post-modal-body">
                <div class="post-header">
                    <div class="post-category-badge">${capitalizeFirst(post.category)}</div>
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(post.date)}</span>
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                        <span><i class="fas fa-eye"></i> ${post.views} views</span>
                        <span><i class="fas fa-comment"></i> ${post.comments} comments</span>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-image">
                        <i class="${getCategoryIcon(post.category)}"></i>
                    </div>
                    <div class="post-text">
                        <p>${post.excerpt}</p>
                        <p>This is a preview of the full post content. In a complete implementation, this would contain the full article content with rich text formatting, images, and more detailed information.</p>
                        <p>The blog system can be integrated with a Content Management System (CMS) to allow easy creation and editing of posts through the admin panel.</p>
                        
                        <blockquote>
                            <p>"And we know that in all things God works for the good of those who love him, who have been called according to his purpose." - Romans 8:28</p>
                        </blockquote>
                        
                        <p>Continue reading to discover more insights and practical applications for your faith journey.</p>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn like-btn" onclick="toggleLike(${post.id})">
                        <i class="fas fa-heart"></i> Like
                    </button>
                    <button class="action-btn share-btn" onclick="sharePost(${post.id})">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="action-btn comment-btn" onclick="showComments(${post.id})">
                        <i class="fas fa-comment"></i> Comments (${post.comments})
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closePostModal() {
    const modal = document.querySelector('.post-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }, 300);
    }
}

function toggleLike(postId) {
    showNotification('Thanks for liking this post! 🙏', 'success');
}

function sharePost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (navigator.share) {
        navigator.share({
            title: post.title,
            text: post.excerpt,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareData = `${post.title}\n\n${post.excerpt}\n\n${window.location.href}`;
        navigator.clipboard.writeText(shareData).then(() => {
            showNotification('Post link copied to clipboard!', 'success');
        });
    }
}

function showComments(postId) {
    showNotification('Comments feature coming soon! 💬', 'info');
}

function handleNewsletterSignup(e) {
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simulate newsletter signup
    showNotification('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
    
    // In production, send email to backend
    console.log('Newsletter signup:', email);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCategoryIcon(category) {
    const icons = {
        sermon: 'fas fa-bible',
        testimony: 'fas fa-heart',
        family: 'fas fa-users',
        prayer: 'fas fa-praying-hands',
        youth: 'fas fa-graduation-cap',
        worship: 'fas fa-music'
    };
    return icons[category] || 'fas fa-file-alt';
}

function debounce(func, wait) {
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

// Notification function (reuse from main script.js)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Export functions for global access
window.BlogPage = {
    openPost,
    goToPage,
    resetFilters,
    filterPosts,
    searchPosts,
    sortPosts
};
