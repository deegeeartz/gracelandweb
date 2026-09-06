import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function SettingsManager() {
    const [settings, setSettings] = useState({
        site_name: '',
        site_description: '',
        hero_image: '',
        facebook_page: '',
        instagram_handle: '',
        twitter_handle: '',
        contact_email: '',
        church_address: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data && !data.error) {
                // Merge fetched settings with default structure to prevent uncontrolled inputs
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            
            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                const data = await res.json();
                alert(`Failed to save settings: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout title="Settings">
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading settings...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Settings">
            <div className="settings-container" style={{ maxWidth: '800px', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="setting-section" style={{ marginBottom: '30px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>General Settings</h2>
                        
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label htmlFor="site_name" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Site Name</label>
                            <input 
                                type="text" 
                                id="site_name" 
                                value={settings.site_name || ''} 
                                onChange={handleFormChange} 
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label htmlFor="site_description" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Site Description</label>
                            <textarea 
                                id="site_description" 
                                rows="3"
                                value={settings.site_description || ''} 
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            ></textarea>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label htmlFor="hero_image" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Hero Section Background Image (URL)</label>
                            <input 
                                type="url" 
                                id="hero_image" 
                                value={settings.hero_image || ''} 
                                onChange={handleFormChange}
                                placeholder="https://example.com/image.jpg"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {settings.hero_image && (
                                <div style={{ marginTop: '10px' }}>
                                    <img src={settings.hero_image} alt="Hero Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="setting-section" style={{ marginBottom: '30px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Social Media Links</h2>
                        
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label htmlFor="facebook_page" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Facebook Page URL</label>
                            <input 
                                type="url" 
                                id="facebook_page" 
                                value={settings.facebook_page || ''} 
                                onChange={handleFormChange}
                                placeholder="https://facebook.com/your-page"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label htmlFor="instagram_handle" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Instagram Handle</label>
                            <input 
                                type="text" 
                                id="instagram_handle" 
                                value={settings.instagram_handle || ''} 
                                onChange={handleFormChange}
                                placeholder="@your_handle"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSaving}
                        style={{ padding: '12px 24px', fontSize: '1.1em', width: '100%' }}
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
