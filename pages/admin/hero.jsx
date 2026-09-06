import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function HeroManager() {
    const [heroImage, setHeroImage] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/settings');
            if (data && data.hero_image) {
                setHeroImage(data.hero_image);
                setUrlInput(data.hero_image);
            }
        } catch (err) {
            console.error('Failed to load hero image', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        setMessage(null);
        try {
            const uploadedUrl = await adminApi.uploadFile(file);
            await adminApi.put('/settings', { hero_image: uploadedUrl });
            setHeroImage(uploadedUrl);
            setUrlInput(uploadedUrl);
            setMessage({ type: 'success', text: 'Hero banner uploaded and saved successfully!' });
        } catch (err) {
            console.error('Error uploading hero image:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to upload hero image.' });
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSaveUrl = async (e) => {
        e.preventDefault();
        if (!urlInput.trim()) return;

        setIsSaving(true);
        setMessage(null);
        try {
            await adminApi.put('/settings', { hero_image: urlInput.trim() });
            setHeroImage(urlInput.trim());
            setMessage({ type: 'success', text: 'Hero banner URL updated successfully!' });
        } catch (err) {
            console.error('Error saving hero URL:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to save hero banner URL.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout title="Hero Section Banner">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {message && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#15803d' : '#dc2626',
                        border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className={message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
                        <span>{message.text}</span>
                    </div>
                )}

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        Current Hero Banner
                    </h3>

                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading banner...
                        </div>
                    ) : heroImage ? (
                        <div style={{
                            width: '100%',
                            height: '280px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#0f172a',
                            position: 'relative'
                        }}>
                            <img 
                                src={heroImage} 
                                alt="Current Hero Banner" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        </div>
                    ) : (
                        <div style={{
                            height: '200px',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
                            border: '2px dashed #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8'
                        }}>
                            <span>No hero banner configured. Upload or set a URL below.</span>
                        </div>
                    )}
                </div>

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        Update Hero Banner Image
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Option 1: File Upload */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                Option 1: Upload Image File (Cloudinary)
                            </label>
                            <label style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                backgroundColor: '#8B0000',
                                color: '#ffffff',
                                borderRadius: '8px',
                                cursor: uploadingFile ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                opacity: uploadingFile ? 0.8 : 1
                            }}>
                                <i className="fas fa-cloud-upload-alt"></i>
                                {uploadingFile ? 'Uploading to Cloudinary...' : 'Select & Upload Banner Image'}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploadingFile}
                                />
                            </label>
                            <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                                Recommended size: 1920x800px (JPG, PNG, WebP)
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            {/* Option 2: Image URL */}
                            <form onSubmit={handleSaveUrl}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                    Option 2: Direct Image URL
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 14px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn btn-primary"
                                        style={{ minWidth: '120px' }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save URL'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
