// Centralized middleware - RCCG Graceland Website

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

// Validate blog post data
function validateBlogPost(req, res, next) {
    const { title, content } = req.body;
    
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
    }
    
    if (title.length > 255) {
        return res.status(400).json({ error: 'Title must be less than 255 characters' });
    }
    
    // Sanitize inputs
    req.body.title = title.trim();
    req.body.content = content.trim();
    
    next();
}

// Validate sermon data
function validateSermon(req, res, next) {
    const { title, speaker, sermon_date } = req.body;
    
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Sermon title is required' });
    }
    
    if (!speaker || speaker.trim().length === 0) {
        return res.status(400).json({ error: 'Speaker name is required' });
    }
    
    if (!sermon_date) {
        return res.status(400).json({ error: 'Sermon date is required' });
    }
    
    // Validate date format
    const date = new Date(sermon_date);
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }
    
    next();
}

// Validate category data
function validateCategory(req, res, next) {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    if (name.length > 100) {
        return res.status(400).json({ error: 'Category name must be less than 100 characters' });
    }
    
    req.body.name = name.trim();
    
    next();
}

// Validate pagination parameters
function validatePagination(req, res, next) {
    let { page = 1, limit = 10 } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    
    if (isNaN(page) || page < 1) {
        return res.status(400).json({ error: 'Invalid page number' });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'Invalid limit (must be between 1 and 100)' });
    }
    
    req.query.page = page;
    req.query.limit = limit;
    
    next();
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Async error wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Database error handler
function handleDatabaseError(error, res) {
    console.error('Database error:', error);
    
    // Check for specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry exists' });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Referenced record not found' });
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(500).json({ error: 'Database access denied' });
    }
    
    // Generic database error
    return res.status(500).json({ 
        error: 'Database error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Check if user has required role
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}

// ============================================
// UTILITY MIDDLEWARE
// ============================================

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Format date for MySQL
function formatDateForMySQL(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Check if ID is valid
function isValidId(id) {
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0;
}

module.exports = {
    // Validation
    validateBlogPost,
    validateSermon,
    validateCategory,
    validatePagination,
    
    // Error handling
    asyncHandler,
    handleDatabaseError,
    
    // Security
    sanitizeInput,
    requireRole,
    
    // Utilities
    generateSlug,
    formatDateForMySQL,
    isValidId
};
