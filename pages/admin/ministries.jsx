import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function MinistryManager() {
    const [ministries, setMinistries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMinistryId, setEditingMinistryId] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: ''
    });

    useEffect(() => {
        fetchMinistries();
    }, []);

    const fetchMinistries = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/ministries');
            setMinistries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch ministries', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingMinistryId(null);
        setFormData({ name: '', description: '', image_url: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (m) => {
        setEditingMinistryId(m.id);
        setFormData({
            name: m.name || '',
            description: m.description || '',
            image_url: m.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const url = await adminApi.uploadFile(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (err) {
            console.error('Failed to upload image', err);
            alert(err.message || 'Image upload failed.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingMinistryId) {
                await adminApi.put(`/ministries/${editingMinistryId}`, formData);
            } else {
                await adminApi.post('/ministries', formData);
            }

            setIsModalOpen(false);
            fetchMinistries();
        } catch (err) {
            console.error('Error saving ministry:', err);
            alert(err.message || 'Failed to save ministry.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteMinistry = async (id) => {
        if (!confirm('Are you sure you want to delete this ministry?')) return;
        try {
            await adminApi.del(`/ministries/${id}`);
            fetchMinistries();
        } catch (err) {
            console.error('Error deleting ministry:', err);
            alert('Failed to delete ministry.');
        }
    };

    const filtered = ministries.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="Manage Church Ministries">
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
                    onClick={openCreateModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-plus"></i> Add New Ministry
                </button>

                <input 
                    type="text"
                    placeholder="Search ministries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        minWidth: '240px'
                    }}
                />
            </div>

            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                overflowX: 'auto'
            }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Image</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Ministry Name</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Description</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading ministries...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No ministries found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((m) => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', width: '70px' }}>
                                        {m.image_url ? (
                                            <img 
                                                src={m.image_url} 
                                                alt={m.name} 
                                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '8px',
                                                backgroundColor: '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#94a3b8',
                                                fontSize: '18px'
                                            }}>
                                                <i className="fas fa-users"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                        {m.name}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px', maxWidth: '350px' }}>
                                        {m.description || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={() => openEditModal(m)}
                                                className="btn btn-sm btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                title="Edit ministry"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onClick={() => deleteMinistry(m.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                title="Delete ministry"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Modal */}
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
                        maxWidth: '550px',
                        maxHeight: '90vh',
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
                                {editingMinistryId ? 'Edit Ministry' : 'Add New Ministry'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Ministry Name *
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Youth Ministry, Choir, Men of Valor"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Ministry Image
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input 
                                            type="text"
                                            placeholder="Image URL or upload file below"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                            style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                        <label style={{
                                            padding: '10px 14px',
                                            backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#334155',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <i className="fas fa-upload"></i>
                                            {uploadingImage ? '...' : 'Upload'}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                    {formData.image_url && (
                                        <div style={{ marginTop: '8px' }}>
                                            <img 
                                                src={formData.image_url} 
                                                alt="Preview" 
                                                style={{ height: '60px', borderRadius: '6px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Description
                                    </label>
                                    <textarea 
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Purpose and schedule of the ministry..."
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>
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
                                    disabled={isSaving}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', minWidth: '120px' }}
                                >
                                    {isSaving ? 'Saving...' : (editingMinistryId ? 'Update Ministry' : 'Create Ministry')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
