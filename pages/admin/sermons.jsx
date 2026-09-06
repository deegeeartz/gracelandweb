import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function SermonManager() {
    const [sermons, setSermons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        speaker: '',
        series: '',
        sermon_date: '',
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

    const fetchSermons = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/sermons', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.sermons) {
                setSermons(data.sermons);
            } else {
                setSermons([]);
            }
        } catch (err) {
            console.error("Failed to fetch sermons", err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSermon = async (id) => {
        if (!confirm('Are you sure you want to delete this sermon?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/sermons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchSermons();
            } else {
                alert('Failed to delete sermon');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        // Map input IDs to formData keys
        const key = id.replace('sermon', '').toLowerCase();
        // Handle special cases
        if (id === 'sermonDate') setFormData(prev => ({ ...prev, sermon_date: value }));
        else if (id === 'scriptureRef') setFormData(prev => ({ ...prev, scripture_reference: value }));
        else if (id === 'audioUrl') setFormData(prev => ({ ...prev, audio_url: value }));
        else if (id === 'videoUrl') setFormData(prev => ({ ...prev, video_url: value }));
        else setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/sermons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', speaker: '', series: '', sermon_date: '', scripture_reference: '', description: '', audio_url: '', video_url: '', duration: '', status: 'published' });
                fetchSermons();
            } else {
                const data = await res.json();
                alert(`Failed to save sermon: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving.');
        }
    };

    return (
        <AdminLayout title="Manage Sermons">
            <div className="content-header" style={{ marginBottom: '20px' }}>
                <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus"></i> Add New Sermon
                    </button>
                </div>
            </div>

            <div className="sermons-table-container" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Title</th>
                            <th style={{ padding: '12px' }}>Speaker</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Series</th>
                            <th style={{ padding: '12px' }}>Listens</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading sermons...</td></tr>
                        ) : sermons.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No sermons found.</td></tr>
                        ) : (
                            sermons.map(sermon => (
                                <tr key={sermon.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{sermon.title}</td>
                                    <td style={{ padding: '12px' }}>{sermon.speaker}</td>
                                    <td style={{ padding: '12px' }}>{new Date(sermon.sermon_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{sermon.series || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>{sermon.listen_count || 0}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button className="btn btn-sm" style={{ marginRight: '8px', background: '#f3f4f6', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm" onClick={() => deleteSermon(sermon.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/*  Sermon Editor Modal  */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content large" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>Add New Sermon</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form id="sermonForm" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="sermonTitle">Title</label>
                                    <input type="text" id="sermonTitle" required value={formData.title} onChange={handleFormChange} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="sermonSpeaker">Speaker</label>
                                        <input type="text" id="sermonSpeaker" required value={formData.speaker} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sermonSeries">Series (Optional)</label>
                                        <input type="text" id="sermonSeries" value={formData.series} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="sermonDate">Date Preached</label>
                                        <input type="date" id="sermonDate" required value={formData.sermon_date} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="scriptureRef">Scripture Reference</label>
                                        <input type="text" id="scriptureRef" value={formData.scripture_reference} onChange={handleFormChange} placeholder="e.g. John 3:16" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sermonDescription">Description</label>
                                    <textarea id="sermonDescription" rows="3" value={formData.description} onChange={handleFormChange}></textarea>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="audioUrl">Audio URL (Optional)</label>
                                        <input type="url" id="audioUrl" value={formData.audio_url} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="videoUrl">Video URL (Optional - YouTube)</label>
                                        <input type="url" id="videoUrl" value={formData.video_url} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" form="sermonForm" className="btn btn-primary">Save Sermon</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
