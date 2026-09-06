import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

const GALLERY_CATEGORIES = ['All', 'Sunday Service', 'Conferences', 'Outreach', 'Youth & Teens', 'Choir', 'Special Events'];

export default function GalleryManager() {
    const router = useRouter();
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [uploadingFile, setUploadingFile] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Sunday Service',
        image_url: ''
    });

    useEffect(() => {
        fetchGallery();
    }, []);

    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.new === '1') {
            setIsModalOpen(true);
        }
    }, [router.isReady, router.query]);

    const fetchGallery = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/gallery');
            setImages(Array.isArray(data) ? data : (data.items || []));
        } catch (err) {
            console.error('Failed to fetch gallery', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const url = await adminApi.uploadFile(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (err) {
            console.error('File upload failed', err);
            alert(err.message || 'Failed to upload photo.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image_url) {
            alert('Please select and upload an image file or provide an image URL.');
            return;
        }

        setIsSaving(true);
        try {
            await adminApi.post('/gallery', formData);
            setIsModalOpen(false);
            setFormData({ title: '', category: 'Sunday Service', image_url: '' });
            fetchGallery();
        } catch (err) {
            console.error('Error saving gallery item:', err);
            alert(err.message || 'Failed to save gallery photo.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteImage = async (id) => {
        if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;
        try {
            await adminApi.del(`/gallery/${id}`);
            fetchGallery();
        } catch (err) {
            console.error('Error deleting photo:', err);
            alert('Failed to delete photo.');
        }
    };

    const filtered = selectedCategory === 'All' 
        ? images 
        : images.filter(img => img.category?.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <AdminLayout title="Manage Church Gallery">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <button 
                    className="btn btn-primary" 
                    onClick={() => {
                        setFormData({ title: '', category: 'Sunday Service', image_url: '' });
                        setIsModalOpen(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-cloud-upload-alt"></i> Upload New Photo
                </button>

                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {GALLERY_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? '#8B0000' : '#cbd5e1',
                                backgroundColor: selectedCategory === cat ? '#8B0000' : '#ffffff',
                                color: selectedCategory === cat ? '#ffffff' : '#475569',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: '#8B0000', marginBottom: '12px' }}></i>
                    <p style={{ margin: 0 }}>Loading gallery media...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '60px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                    color: '#94a3b8'
                }}>
                    <i className="fas fa-images" style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}></i>
                    <p style={{ margin: 0 }}>No photos found in this category.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '20px'
                }}>
                    {filtered.map((item) => (
                        <div 
                            key={item.id}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ height: '180px', width: '100%', position: 'relative', backgroundColor: '#0f172a' }}>
                                <img 
                                    src={item.image_url} 
                                    alt={item.title || 'Church Media'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                {item.category && (
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        color: '#ffffff',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: '500'
                                    }}>
                                        {item.category}
                                    </span>
                                )}
                            </div>
                            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {item.title || 'Untitled Photo'}
                                    </h4>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => deleteImage(item.id)}
                                    className="btn btn-sm btn-danger"
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    title="Delete photo"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Gallery Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '520px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                                Upload to Gallery
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Photo Title
                                    </label>
                                    <input 
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Youth Praise Festival 2026"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Category *
                                    </label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    >
                                        {GALLERY_CATEGORIES.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Image File (Upload to Cloudinary) *
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ width: '100%', padding: '10px 0' }}
                                        disabled={uploadingFile}
                                    />
                                    {uploadingFile && (
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8B0000' }}>
                                            <i className="fas fa-spinner fa-spin"></i> Uploading to Cloudinary...
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Or Direct Image URL
                                    </label>
                                    <input 
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {formData.image_url && (
                                    <div>
                                        <span style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>Preview:</span>
                                        <img 
                                            src={formData.image_url} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} 
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#f8fafc'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 16px' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving || uploadingFile}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', minWidth: '120px' }}
                                >
                                    {isSaving ? 'Saving...' : 'Upload & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
