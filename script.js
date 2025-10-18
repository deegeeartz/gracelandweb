// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.header');
const loading = document.getElementById('loading');

// Mobile Menu Toggle
function toggleMenu() {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// Event Listeners
menuToggle.addEventListener('click', toggleMenu);

// Close mobile menu when clicking on a link
navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
// Updated to exclude empty href="#" to prevent querySelector errors
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if href is just "#" or empty
        if (!href || href === '#' || href.length <= 1) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header background change on scroll
let lastScrollTop = 0;
const scrollThreshold = 100;

function handleHeaderScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Change header background based on scroll position
    if (scrollTop > scrollThreshold) {
        header.style.background = 'linear-gradient(135deg, #6B0000 0%, #8B0000 100%)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        header.style.background = 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    // Hide/show header on scroll (optional)
    if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
}

// Throttled scroll handler
let ticking = false;
function requestTick() {
    if (!ticking) {
        requestAnimationFrame(handleHeaderScroll);
        ticking = true;
        setTimeout(() => { ticking = false; }, 10);
    }
}

window.addEventListener('scroll', requestTick);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            
            // Add appropriate animation class based on element
            if (element.classList.contains('time-card') || 
                element.classList.contains('ministry-card')) {
                element.style.animationDelay = `${Math.random() * 0.5}s`;
                element.classList.add('fade-in');
            } else if (element.classList.contains('about-text')) {
                element.classList.add('slide-in-left');
            } else if (element.classList.contains('about-image')) {
                element.classList.add('slide-in-right');
            } else {
                element.classList.add('fade-in');
            }
            
            observer.unobserve(element);
        }
    });
}, observerOptions);

// Observe elements for animation
function observeElements() {
    const elementsToObserve = document.querySelectorAll(`
        .time-card,
        .ministry-card,
        .about-text,
        .about-image,
        .contact-item,
        .livestream-info
    `);
    
    elementsToObserve.forEach(el => observer.observe(el));
}

// Loading animation
function hideLoading() {
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

// Initialize page
function initializePage() {
    // Hide loading screen
    hideLoading();
      // Start observing elements
    observeElements();
    
    // Set initial header height for scroll calculations
    window.headerHeight = header.offsetHeight;
    
    // Initialize any other components
    initializeVideoPlayer();
    initializeFormValidation();
    
    console.log('RCCG Graceland Area HQ website initialized successfully');
}

// Video player enhancements
function initializeVideoPlayer() {
    const videoWrapper = document.querySelector('.video-wrapper iframe');
    
    if (videoWrapper) {
        // Add loading state for iframe
        videoWrapper.addEventListener('load', () => {
            videoWrapper.style.opacity = '1';
        });
        
        // Initially hide until loaded
        videoWrapper.style.opacity = '0';
        videoWrapper.style.transition = 'opacity 0.3s ease';
    }
}

// Form validation (for future contact forms)
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            validateForm(form);
        });
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            showFieldError(input, 'This field is required');
        } else {
            clearFieldError(input);
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                showFieldError(input, 'Please enter a valid email address');
            }
        }
    });
    
    if (isValid) {
        submitForm(form);
    }
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#e74c3c';
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
}

function submitForm(form) {
    // Implement form submission logic here
    console.log('Form submitted:', new FormData(form));
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
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
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto remove after 5 seconds
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

// Utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Responsive image loading
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Performance monitoring
function measurePagePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
            }, 0);
        });
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // Could send error to logging service in production
});

// Resize handler for responsive adjustments
const handleResize = debounce(() => {
    // Update header height for scroll calculations
    window.headerHeight = header.offsetHeight;
    
    // Close mobile menu on resize to larger screen
    if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    }
    
    // Adjust video player aspect ratio if needed
    adjustVideoPlayer();
}, 250);

function adjustVideoPlayer() {
    const videoWrapper = document.querySelector('.video-wrapper iframe');
    if (videoWrapper && window.innerWidth < 768) {
        const containerWidth = videoWrapper.parentElement.offsetWidth;
        const aspectRatio = 16 / 9;
        const newHeight = containerWidth / aspectRatio;
        videoWrapper.style.height = newHeight + 'px';
    }
}

window.addEventListener('resize', handleResize);

// Accessibility improvements
function enhanceAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.id = 'main-content';
    }
    
    // Improve button accessibility
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (button.classList.contains('menu-toggle')) {
            button.setAttribute('aria-label', 'Toggle navigation menu');
            button.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Update aria-expanded for mobile menu
    menuToggle.addEventListener('click', () => {
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded.toString());
    });
}

// Toggle contact info in giving section
function toggleContactInfo() {
    const contactMethods = document.querySelector('.contact-methods');
    const button = document.querySelector('.give-section .btn-primary');
    
    if (contactMethods.style.display === 'none' || contactMethods.style.display === '') {
        contactMethods.style.display = 'flex';
        contactMethods.classList.add('show');
        button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Contact Info';
    } else {
        contactMethods.style.display = 'none';
        contactMethods.classList.remove('show');
        button.innerHTML = '<i class="fas fa-phone"></i> Contact for Giving Info';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    enhanceAccessibility();
    loadImages();    measurePagePerformance();
});

// Service Worker registration for offline support (optional)
// DISABLED: Causes 404 errors if sw.js doesn't exist or is misconfigured
// Uncomment below if you want to implement full PWA functionality
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Get base path for GitHub Pages subdirectory support
        const getServiceWorkerPath = () => {
            const pathname = window.location.pathname;
            const pathParts = pathname.split('/').filter(part => part.length > 0);
            
            // If on GitHub Pages with subdirectory: /gracelandweb/sw.js
            if (pathParts.length > 0 && !pathParts[0].includes('.')) {
                return `/${pathParts[0]}/sw.js`;
            }
            // Otherwise: /sw.js
            return '/sw.js';
        };
        
        const swPath = getServiceWorkerPath();
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/

// Export functions for external use
window.RCCGGraceland = {
    toggleMenu,
    showNotification,
    hideLoading
};

// Console message
console.log(`
    🏛️ RCCG Graceland Area HQ Website
    📍 Jah Michael Bus Stop, Lagos-Badagry Expressway
    ✝️ Experiencing An Overflow Of His Grace
    
    Made with ❤️ for the Kingdom
`);
