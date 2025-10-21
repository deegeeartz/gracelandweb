const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const { verifyToken } = require('./auth');
const Settings = require('../database/models/Settings');

// GET /api/settings - Get all settings (public settings only for non-authenticated users)
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getAll();
        
        // For non-authenticated requests, only return public settings
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            const publicSettings = {};
            const publicKeys = [
                'site_name',
                'site_description',
                'facebook_page',
                'instagram_handle',  
                'twitter_handle',
                'contact_email',
                'church_address'
            ];
            
            publicKeys.forEach(key => {
                if (settings[key] !== undefined) {
                    publicSettings[key] = settings[key];
                }
            });
            
            return res.json(publicSettings);
        }
        
        // For authenticated requests, return all settings
        res.json(settings);
    } catch (error) {
        logger.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// GET /api/settings/:key - Get single setting by key
router.get('/:key', async (req, res) => {
    try {
        const value = await Settings.getByKey(req.params.key);
        
        if (value === null) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        
        res.json({ [req.params.key]: value });
    } catch (error) {
        logger.error('Error fetching setting:', error);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// PUT /api/settings - Update multiple settings (admin only)
router.put('/', verifyToken, async (req, res) => {
    try {
        const settings = req.body;
        
        if (!settings || Object.keys(settings).length === 0) {
            return res.status(400).json({ error: 'No settings provided' });
        }
        
        // Convert settings to the format expected by the model
        const settingsToUpdate = {};
        
        for (const [key, value] of Object.entries(settings)) {
            // Determine type based on value
            let type = 'string';
            if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (typeof value === 'object') {
                type = 'json';
            }
            
            settingsToUpdate[key] = { value, type };
        }
        
        await Settings.updateMultiple(settingsToUpdate);
        
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        logger.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// PUT /api/settings/:key - Update single setting (admin only)
router.put('/:key', verifyToken, async (req, res) => {
    try {
        const { value, type = 'string', description } = req.body;
        
        if (value === undefined) {
            return res.status(400).json({ error: 'Value is required' });
        }
        
        await Settings.set(req.params.key, value, type, description);
        
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        logger.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// DELETE /api/settings/:key - Delete setting (admin only)
router.delete('/:key', verifyToken, async (req, res) => {
    try {
        const deletedRows = await Settings.delete(req.params.key);
        
        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        logger.error('Error deleting setting:', error);
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

module.exports = router;
