import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function SermonManager() {
    const router = useRouter();
    const [sermons, setSermons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSermonId, setEditingSermonId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        speaker: 'Pastor',
        series: '',
        sermon_date: new Date().toISOString().split('T')[0],
        scripture_reference: '',
        description: '',
        audio_url: '',
        video_url: '',
        duration: '',
        status: 'published'
    });

    useEffect(() => {
        fetchSermons();
    }, []);

    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.new === '1') {
            openCreateModal();
        }
    }, [router.isReady, router.query]);

    const fetchSermons = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/admin/sermons');
            setSermons(data.sermons || (Array.isArray(data) ? data : []));
        } catch (err) {
            console.error('Failed to fetch sermons', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingSermonId(null);
        setFormData({
            title: '',
            speaker: 'Pastor',
            series: '',
            sermon_date: new Date().toISOString().split('T')[0],
            scripture_reference: '',
            description: '',
            audio_url: '',
            video_url: '',
            duration: '',
            status: 'published'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (sermon) => {
        setEditingSermonId(sermon.id);
        setFormData({
            title: sermon.title || '',
            speaker: sermon.speaker || 'Pastor',
            series: sermon.series || '',
            sermon_date: sermon.sermon_date ? sermon.sermon_date.split('T')[0] : '',
            scripture_reference: sermon.scripture_reference || '',
            description: sermon.description || '',
            audio_url: sermon.audio_url || '',
            video_url: sermon.video_url || '',
            duration: sermon.duration || '',
            status: sermon.status || 'published'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingSermonId) {
                await adminApi.put(`/admin/sermons/${editingSermonId}`, formData);
            } else {
                await adminApi.post('/admin/sermons', formData);
            }

            setIsModalOpen(false);
            fetchSermons();
        } catch (err) {
            console.error('Error saving sermon:', err);
            alert(err.message || 'Failed to save sermon.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteSermon = async (id) => {
        if (!confirm('Are you sure you want to delete this sermon?')) return;
        
        try {
            await adminApi.del(`/admin/sermons/${id}`);
            fetchSermons();
        } catch (err) {
            console.error('Error deleting sermon:', err);
            alert('Failed to delete sermon.');
        }
    };

    const filteredSermons = sermons.filter(s => {
        const query = searchQuery.toLowerCase();
        return (
            (s.title && s.title.toLowerCase().includes(query)) ||
            (s.speaker && s.speaker.toLowerCase().includes(query)) ||
            (s.series && s.series.toLowerCase().includes(query))
        );
    });

    return (
        <AdminLayout title="Manage Sermons">
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
                    <i className="fas fa-plus"></i> Add New Sermon
                </button>

                <input 
                    type="text"
                    placeholder="Search by title, speaker, series..."
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
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Title</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Speaker</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Series</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Media</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading sermons...
                                </td>
                            </tr>
                        ) : filteredSermons.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No sermons found.
                                </td>
                            </tr>
                        ) : (
                            filteredSermons.map((sermon) => (
                                <tr key={sermon.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1e293b' }}>
                                        {sermon.title}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {sermon.speaker || 'Pastor'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {sermon.series || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {sermon.audio_url && (
                                                <span title="Audio Available" style={{ color: '#2563eb', fontSize: '14px' }}>
                                                    <i className="fas fa-headphones"></i>
                                                </span>
                                            )}
                                            {sermon.video_url && (
                                                <span title="Video Available" style={{ color: '#dc2626', fontSize: '14px' }}>
                                                    <i className="fas fa-video"></i>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={() => openEditModal(sermon)}
                                                className="btn btn-sm btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                title="Edit sermon"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onClick={() => deleteSermon(sermon.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                title="Delete sermon"
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

            {/* Create / Edit Sermon Modal */}
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
                        maxWidth: '650px',
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
                                {editingSermonId ? 'Edit Sermon' : 'Add New Sermon'}
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
                                        Sermon Title *
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Overcoming by the Blood"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Speaker *
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.speaker}
                                            onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                                            placeholder="Pastor Name"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Series
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.series}
                                            onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                                            placeholder="e.g., Faith in Action"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Sermon Date *
                                        </label>
                                        <input 
                                            type="date"
                                            required
                                            value={formData.sermon_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sermon_date: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Scripture Reference
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.scripture_reference}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scripture_reference: e.target.value }))}
                                            placeholder="e.g., Revelation 12:11"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            YouTube / Video URL
                                        </label>
                                        <input 
                                            type="url"
                                            value={formData.video_url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                                            placeholder="https://youtube.com/..."
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Audio MP3 URL
                                        </label>
                                        <input 
                                            type="url"
                                            value={formData.audio_url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                                            placeholder="https://.../sermon.mp3"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Description & Notes
                                    </label>
                                    <textarea 
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Key takeaway points or sermon description..."
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
                                    {isSaving ? 'Saving...' : (editingSermonId ? 'Update Sermon' : 'Save Sermon')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
