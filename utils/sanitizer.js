/**
 * Input Sanitization Utility
 * Protects against XSS attacks
 */

const logger = require('./logger');

class Sanitizer {
    /**
     * Sanitize HTML content
     */
    static sanitizeHtml(dirty) {
        if (!dirty) return '';
        
        // Remove script tags
        let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove event handlers
        clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
        
        // Remove javascript: protocol
        clean = clean.replace(/javascript:/gi, '');
        
        logger.debug('Sanitized HTML content');
        return clean;
    }

    /**
     * Sanitize plain text (for titles, excerpts, etc)
     */
    static sanitizeText(text) {
        if (!text) return '';
        
        // Remove HTML tags
        let clean = text.replace(/<[^>]*>/g, '');
        
        // Escape special characters
        clean = clean
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        return clean.trim();
    }

    /**
     * Sanitize slug (URL-safe)
     */
    static sanitizeSlug(slug) {
        if (!slug) return '';
        
        return slug
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
            .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
    }

    /**
     * Validate email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Sanitize integer input
     */
    static sanitizeInt(value, defaultValue = 0, min = null, max = null) {
        const num = parseInt(value);
        
        if (isNaN(num)) return defaultValue;
        
        let result = num;
        if (min !== null) result = Math.max(min, result);
        if (max !== null) result = Math.min(max, result);
        
        return result;
    }

    /**
     * Sanitize pagination parameters
     */
    static sanitizePagination(page, limit) {
        return {
            page: this.sanitizeInt(page, 1, 1, 1000),
            limit: this.sanitizeInt(limit, 10, 1, 50)
        };
    }
}

module.exports = Sanitizer;
