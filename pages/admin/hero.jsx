import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function HeroManager() {
    const [heroImage, setHeroImage] = useState('');
    const [heroImageMobile, setHeroImageMobile] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDescription, setHeroDescription] = useState('');
    const [siteName, setSiteName] = useState('');
    const [siteDescription, setSiteDescription] = useState('');

    const [urlInputDesktop, setUrlInputDesktop] = useState('');
    const [urlInputMobile, setUrlInputMobile] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingText, setIsSavingText] = useState(false);
    const [isSavingDesktopUrl, setIsSavingDesktopUrl] = useState(false);
    const [isSavingMobileUrl, setIsSavingMobileUrl] = useState(false);
    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [activePreviewTab, setActivePreviewTab] = useState('whatsapp'); // 'whatsapp', 'twitter', 'google'
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/settings');
            if (data) {
                if (data.hero_image) {
                    setHeroImage(data.hero_image);
                    setUrlInputDesktop(data.hero_image);
                }
                if (data.hero_image_mobile) {
                    setHeroImageMobile(data.hero_image_mobile);
                    setUrlInputMobile(data.hero_image_mobile);
                }
                if (data.hero_title) setHeroTitle(data.hero_title);
                if (data.hero_description) setHeroDescription(data.hero_description);
                if (data.site_name) setSiteName(data.site_name);
                if (data.site_description) setSiteDescription(data.site_description);
            }
        } catch (err) {
            console.error('Failed to load hero settings', err);
            setMessage({ type: 'error', text: 'Failed to load settings from server.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Save Hero Text & Messaging
    const handleSaveText = async (e) => {
        e.preventDefault();
        setIsSavingText(true);
        setMessage(null);
        try {
            await adminApi.put('/settings', {
                hero_title: heroTitle.trim(),
                hero_description: heroDescription.trim(),
            });
            setMessage({ type: 'success', text: 'Hero heading and subtitle updated successfully! Link preview updated.' });
        } catch (err) {
            console.error('Error saving hero text:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to save hero text.' });
        } finally {
            setIsSavingText(false);
        }
    };

    // Desktop Image: Upload
    const handleUploadDesktop = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDesktop(true);
        setMessage(null);
        try {
            const uploadedUrl = await adminApi.uploadFile(file);
            await adminApi.put('/settings', { hero_image: uploadedUrl });
            setHeroImage(uploadedUrl);
            setUrlInputDesktop(uploadedUrl);
            setMessage({ type: 'success', text: 'Desktop hero banner uploaded and saved successfully!' });
        } catch (err) {
            console.error('Error uploading desktop hero image:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to upload desktop hero image.' });
        } finally {
            setUploadingDesktop(false);
        }
    };

    // Desktop Image: Save URL
    const handleSaveDesktopUrl = async (e) => {
        e.preventDefault();
        if (!urlInputDesktop.trim()) return;

        setIsSavingDesktopUrl(true);
        setMessage(null);
        try {
            await adminApi.put('/settings', { hero_image: urlInputDesktop.trim() });
            setHeroImage(urlInputDesktop.trim());
            setMessage({ type: 'success', text: 'Desktop hero banner URL updated successfully!' });
        } catch (err) {
            console.error('Error saving desktop hero URL:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to save desktop hero URL.' });
        } finally {
            setIsSavingDesktopUrl(false);
        }
    };

    // Mobile Image: Upload
    const handleUploadMobile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMobile(true);
        setMessage(null);
        try {
            const uploadedUrl = await adminApi.uploadFile(file);
            await adminApi.put('/settings', { hero_image_mobile: uploadedUrl });
            setHeroImageMobile(uploadedUrl);
            setUrlInputMobile(uploadedUrl);
            setMessage({ type: 'success', text: 'Mobile hero banner uploaded and saved successfully!' });
        } catch (err) {
            console.error('Error uploading mobile hero image:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to upload mobile hero image.' });
        } finally {
            setUploadingMobile(false);
        }
    };

    // Mobile Image: Save URL
    const handleSaveMobileUrl = async (e) => {
        e.preventDefault();
        if (!urlInputMobile.trim()) return;

        setIsSavingMobileUrl(true);
        setMessage(null);
        try {
            await adminApi.put('/settings', { hero_image_mobile: urlInputMobile.trim() });
            setHeroImageMobile(urlInputMobile.trim());
            setMessage({ type: 'success', text: 'Mobile hero banner URL updated successfully!' });
        } catch (err) {
            console.error('Error saving mobile hero URL:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to save mobile hero URL.' });
        } finally {
            setIsSavingMobileUrl(false);
        }
    };

    // Mobile Image: Remove (Reset to Desktop Fallback)
    const handleClearMobileImage = async () => {
        if (!confirm('Are you sure you want to remove the custom mobile banner? Mobile devices will automatically display the desktop banner.')) return;
        setMessage(null);
        try {
            await adminApi.put('/settings', { hero_image_mobile: '' });
            setHeroImageMobile('');
            setUrlInputMobile('');
            setMessage({ type: 'success', text: 'Mobile banner removed. Mobile view will now default to the desktop banner.' });
        } catch (err) {
            console.error('Error removing mobile hero image:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to remove mobile hero image.' });
        }
    };

    // Active Display Values
    const activeTitle = heroTitle || siteName || "Welcome to Graceland Area HQ";
    const activeDescription = heroDescription || siteDescription || "Experiencing An Overflow Of His Grace";
    const activeSocialImage = heroImage || heroImageMobile || "https://rccggraceland.com/logo.png";
    const activeMobileDisplayImage = heroImageMobile || heroImage;

    return (
        <AdminLayout title="Hero Section & Preview Link">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header with Quick Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
                            Hero Section & Social Preview Manager
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Control what visitors see on the homepage hero and what platforms (WhatsApp, Facebook, Twitter) fetch when your website link is shared.
                        </p>
                    </div>

                    <a 
                        href="/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '14px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <i className="fas fa-external-link-alt"></i>
                        <span>Preview Live Website</span>
                    </a>
                </div>

                {/* Status Message */}
                {message && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
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

                {/* Dual Visual Previews (Desktop + Mobile) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        Active Hero Display
                    </h3>

                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading hero settings...
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                            {/* Desktop Frame */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                                        <i className="fas fa-desktop" style={{ marginRight: '6px' }}></i> Desktop Banner (Screens &gt; 768px)
                                    </span>
                                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: heroImage ? '#dcfce7' : '#f1f5f9', color: heroImage ? '#15803d' : '#64748b', fontWeight: '600' }}>
                                        {heroImage ? 'Custom Banner Set' : 'Using Default Pattern'}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {heroImage ? (
                                        <img 
                                            src={heroImage} 
                                            alt="Current Desktop Hero Banner" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                                            <i className="fas fa-image" style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }}></i>
                                            <span>Default background active. Upload below.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Smartphone Frame */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                                        <i className="fas fa-mobile-alt" style={{ marginRight: '6px' }}></i> Mobile Banner (Screens ≤ 768px)
                                    </span>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        padding: '2px 8px', 
                                        borderRadius: '12px', 
                                        backgroundColor: heroImageMobile ? '#dbeafe' : '#fef3c7', 
                                        color: heroImageMobile ? '#1d4ed8' : '#b45309', 
                                        fontWeight: '600' 
                                    }}>
                                        {heroImageMobile ? 'Custom Mobile Banner' : 'Defaulting to Desktop'}
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {activeMobileDisplayImage ? (
                                        <img 
                                            src={activeMobileDisplayImage} 
                                            alt="Current Mobile Hero Banner" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                                            <i className="fas fa-mobile-alt" style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }}></i>
                                            <span>No mobile banner set (will use desktop).</span>
                                        </div>
                                    )}
                                    {!heroImageMobile && heroImage && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            left: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.75)',
                                            color: '#ffffff',
                                            fontSize: '11px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            textAlign: 'center'
                                        }}>
                                            <i className="fas fa-info-circle"></i> Using desktop banner fallback
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Website Preview Link Simulator (WhatsApp, Facebook, Twitter, Google) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                                <i className="fas fa-share-alt" style={{ color: '#8B0000', marginRight: '8px' }}></i>
                                Live Website Link Preview (Social & Search Cards)
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                This is the live card fetched when someone shares the website link (<code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>https://rccggraceland.com</code>).
                            </p>
                        </div>

                        {/* Simulator Tabs */}
                        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('whatsapp')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: activePreviewTab === 'whatsapp' ? '#ffffff' : 'transparent',
                                    color: activePreviewTab === 'whatsapp' ? '#25d366' : '#64748b',
                                    boxShadow: activePreviewTab === 'whatsapp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <i className="fab fa-whatsapp" style={{ marginRight: '5px' }}></i> WhatsApp / FB
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('twitter')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: activePreviewTab === 'twitter' ? '#ffffff' : 'transparent',
                                    color: activePreviewTab === 'twitter' ? '#1d9bf0' : '#64748b',
                                    boxShadow: activePreviewTab === 'twitter' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <i className="fab fa-twitter" style={{ marginRight: '5px' }}></i> Twitter / X
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('google')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: activePreviewTab === 'google' ? '#ffffff' : 'transparent',
                                    color: activePreviewTab === 'google' ? '#ea4335' : '#64748b',
                                    boxShadow: activePreviewTab === 'google' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <i className="fab fa-google" style={{ marginRight: '5px' }}></i> Google Search
                            </button>
                        </div>
                    </div>

                    {/* Preview Cards Container */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        {/* WhatsApp / Facebook Simulator */}
                        {activePreviewTab === 'whatsapp' && (
                            <div style={{
                                maxWidth: '460px',
                                margin: '0 auto',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ height: '230px', backgroundColor: '#0f172a', position: 'relative' }}>
                                    <img 
                                        src={activeSocialImage} 
                                        alt="Preview" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <div style={{ padding: '14px 16px', backgroundColor: '#f0f2f5' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#65676b', fontWeight: '600', letterSpacing: '0.5px' }}>
                                        RCCGGRACELAND.COM
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#050505', margin: '4px 0 2px', lineHeight: 1.3 }}>
                                        {activeTitle}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#65676b', lineHeight: 1.4, maxHeight: '38px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activeDescription}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Twitter / X Simulator */}
                        {activePreviewTab === 'twitter' && (
                            <div style={{
                                maxWidth: '500px',
                                margin: '0 auto',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                border: '1px solid #cfd9de'
                            }}>
                                <div style={{ height: '250px', backgroundColor: '#0f172a', position: 'relative' }}>
                                    <img 
                                        src={activeSocialImage} 
                                        alt="Twitter Preview" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        color: '#ffffff',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: '500'
                                    }}>
                                        rccggraceland.com
                                    </div>
                                </div>
                                <div style={{ padding: '12px 16px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f1419', lineHeight: 1.3, marginBottom: '4px' }}>
                                        {activeTitle}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#536471', lineHeight: 1.4 }}>
                                        {activeDescription}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Google Search Snippet */}
                        {activePreviewTab === 'google' && (
                            <div style={{
                                maxWidth: '600px',
                                margin: '0 auto',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                padding: '16px 20px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <img src="/logo.png" alt="Favicon" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                                    <div style={{ fontSize: '12px', color: '#202124' }}>
                                        https://rccggraceland.com
                                    </div>
                                </div>
                                <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: '500', marginBottom: '6px', cursor: 'pointer' }}>
                                    {activeTitle} | RCCG Graceland Area HQ
                                </div>
                                <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.5 }}>
                                    {activeDescription}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hero Messaging Settings */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        Hero Heading & Subtitle Text
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                        These texts appear on the hero banner and serve as the default title & description for website link previews.
                    </p>

                    <form onSubmit={handleSaveText}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                    Hero Heading / Preview Title
                                </label>
                                <input
                                    type="text"
                                    placeholder={siteName || "Welcome to Graceland Area HQ"}
                                    value={heroTitle}
                                    onChange={(e) => setHeroTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                    Leave blank to default to site name ({siteName || "Welcome to Graceland Area HQ"})
                                </span>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                    Hero Subtitle / Preview Description
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder={siteDescription || "Experiencing An Overflow Of His Grace"}
                                    value={heroDescription}
                                    onChange={(e) => setHeroDescription(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                    Leave blank to default to site description ({siteDescription || "Experiencing An Overflow Of His Grace"})
                                </span>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSavingText}
                                    className="btn btn-primary"
                                    style={{ minWidth: '150px' }}
                                >
                                    {isSavingText ? (
                                        <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Saving...</>
                                    ) : (
                                        'Save Hero Text'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Desktop Hero Banner Section */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                            <i className="fas fa-desktop" style={{ color: '#8B0000', marginRight: '8px' }}></i>
                            Desktop Hero Banner Image
                        </h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Primary widescreen banner & default preview image</span>
                    </div>

                    <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                        Displayed on desktop computers, laptops, and tablets. Also used as the primary Open Graph preview image (1200x630).
                    </p>

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
                                cursor: uploadingDesktop ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                opacity: uploadingDesktop ? 0.8 : 1
                            }}>
                                <i className="fas fa-cloud-upload-alt"></i>
                                {uploadingDesktop ? 'Uploading to Cloudinary...' : 'Select & Upload Desktop Banner'}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleUploadDesktop}
                                    style={{ display: 'none' }}
                                    disabled={uploadingDesktop}
                                />
                            </label>
                            <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                                Recommended size: 1920x800px (JPG, PNG, WebP)
                            </span>
                        </div>

                        {/* Option 2: Image URL */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                            <form onSubmit={handleSaveDesktopUrl}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                    Option 2: Direct Image URL
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        value={urlInputDesktop}
                                        onChange={(e) => setUrlInputDesktop(e.target.value)}
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
                                        disabled={isSavingDesktopUrl}
                                        className="btn btn-primary"
                                        style={{ minWidth: '120px' }}
                                    >
                                        {isSavingDesktopUrl ? 'Saving...' : 'Save URL'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Mobile Hero Banner Section (Alternative View) */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                            <i className="fas fa-mobile-alt" style={{ color: '#2563eb', marginRight: '8px' }}></i>
                            Mobile Hero Banner Image (Alternative Section)
                        </h3>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: heroImageMobile ? '#dbeafe' : '#f1f5f9', color: heroImageMobile ? '#1d4ed8' : '#64748b', fontWeight: '600' }}>
                            {heroImageMobile ? 'Active on Mobile' : 'Optional (Desktop Fallback Active)'}
                        </span>
                    </div>

                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                        Upload a portrait/vertical banner tailored for smartphone viewports (screens ≤ 768px). <strong>If you do not upload a mobile image, the system automatically defaults to the desktop banner for all screens.</strong>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Option 1: File Upload */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                Option 1: Upload Mobile Image File (Cloudinary)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <label style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    backgroundColor: '#1e293b',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    cursor: uploadingMobile ? 'not-allowed' : 'pointer',
                                    fontWeight: '500',
                                    opacity: uploadingMobile ? 0.8 : 1
                                }}>
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    {uploadingMobile ? 'Uploading to Cloudinary...' : 'Select & Upload Mobile Banner'}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleUploadMobile}
                                        style={{ display: 'none' }}
                                        disabled={uploadingMobile}
                                    />
                                </label>

                                {heroImageMobile && (
                                    <button
                                        type="button"
                                        onClick={handleClearMobileImage}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#fee2e2',
                                            color: '#dc2626',
                                            border: '1px solid #fecaca',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '13px'
                                        }}
                                    >
                                        <i className="fas fa-trash-alt" style={{ marginRight: '6px' }}></i>
                                        Reset to Desktop Fallback
                                    </button>
                                )}
                            </div>
                            <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                                Recommended size: 1080x1350px or 750x1000px portrait (JPG, PNG, WebP)
                            </span>
                        </div>

                        {/* Option 2: Image URL */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                            <form onSubmit={handleSaveMobileUrl}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                                    Option 2: Direct Image URL
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        value={urlInputMobile}
                                        onChange={(e) => setUrlInputMobile(e.target.value)}
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
                                        disabled={isSavingMobileUrl}
                                        className="btn btn-primary"
                                        style={{ minWidth: '120px' }}
                                    >
                                        {isSavingMobileUrl ? 'Saving...' : 'Save URL'}
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
