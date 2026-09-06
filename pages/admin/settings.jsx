import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function SettingsManager() {
    const [settings, setSettings] = useState({
        site_name: 'RCCG Graceland Chapel',
        site_description: 'A Place of Grace, Transformation, and Divine Elevation.',
        church_address: '123 Grace Avenue, Graceland',
        contact_email: 'info@rccggraceland.org',
        contact_phone: '+234 800 000 0000',
        service_times: 'Sundays 8:00 AM & 10:00 AM | Wednesdays 6:00 PM',
        facebook_page: '',
        instagram_handle: '',
        twitter_handle: '',
        youtube_url: '',
        hero_image: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/settings');
            if (data && !data.error) {
                setSettings(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage(null);

        try {
            await adminApi.put('/settings', settings);
            setStatusMessage({ type: 'success', text: 'Church settings saved and applied successfully!' });
        } catch (err) {
            console.error('Failed to save settings', err);
            setStatusMessage({ type: 'error', text: err.message || 'Failed to update church settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout title="Global Church Settings">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {statusMessage && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: statusMessage.type === 'success' ? '#15803d' : '#dc2626',
                        border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className={statusMessage.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* General Information Card */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            <i className="fas fa-church" style={{ marginRight: '8px', color: '#8B0000' }}></i> General Information
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label htmlFor="site_name" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    Church / Site Name
                                </label>
                                <input 
                                    id="site_name"
                                    type="text"
                                    value={settings.site_name || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="site_description" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    Tagline / Description
                                </label>
                                <textarea 
                                    id="site_description"
                                    rows={2}
                                    value={settings.site_description || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="service_times" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    Service Times
                                </label>
                                <input 
                                    id="service_times"
                                    type="text"
                                    value={settings.service_times || ''}
                                    onChange={handleChange}
                                    placeholder="Sundays 8:00 AM & 10:00 AM"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: '#8B0000' }}></i> Contact Details & Location
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label htmlFor="contact_email" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Contact Email
                                    </label>
                                    <input 
                                        id="contact_email"
                                        type="email"
                                        value={settings.contact_email || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact_phone" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Contact Phone
                                    </label>
                                    <input 
                                        id="contact_phone"
                                        type="tel"
                                        value={settings.contact_phone || ''}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="church_address" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    Church Address
                                </label>
                                <input 
                                    id="church_address"
                                    type="text"
                                    value={settings.church_address || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links Card */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            <i className="fas fa-share-alt" style={{ marginRight: '8px', color: '#8B0000' }}></i> Social Media Channels
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label htmlFor="facebook_page" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    <i className="fab fa-facebook" style={{ color: '#1877f2', marginRight: '6px' }}></i> Facebook URL
                                </label>
                                <input 
                                    id="facebook_page"
                                    type="url"
                                    placeholder="https://facebook.com/..."
                                    value={settings.facebook_page || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="instagram_handle" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    <i className="fab fa-instagram" style={{ color: '#e4405f', marginRight: '6px' }}></i> Instagram Handle / URL
                                </label>
                                <input 
                                    id="instagram_handle"
                                    type="text"
                                    placeholder="@rccggraceland or URL"
                                    value={settings.instagram_handle || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="youtube_url" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    <i className="fab fa-youtube" style={{ color: '#ff0000', marginRight: '6px' }}></i> YouTube Channel URL
                                </label>
                                <input 
                                    id="youtube_url"
                                    type="url"
                                    placeholder="https://youtube.com/@..."
                                    value={settings.youtube_url || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="twitter_handle" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                    <i className="fab fa-twitter" style={{ color: '#1da1f2', marginRight: '6px' }}></i> Twitter / X
                                </label>
                                <input 
                                    id="twitter_handle"
                                    type="text"
                                    placeholder="@rccggraceland"
                                    value={settings.twitter_handle || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="btn btn-primary"
                            style={{ padding: '12px 32px', fontSize: '15px', fontWeight: '600' }}
                        >
                            {isSaving ? (
                                <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Saving Settings...</span>
                            ) : (
                                'Save All Settings'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
