import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function FellowshipManager() {
    const [fellowships, setFellowships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        leader_name: '',
        address: '',
        meeting_time: 'Sundays at 5:00 PM',
        phone: ''
    });

    useEffect(() => {
        fetchFellowships();
    }, []);

    const fetchFellowships = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/fellowships');
            setFellowships(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch fellowships', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({
            name: '',
            leader_name: '',
            address: '',
            meeting_time: 'Sundays at 5:00 PM',
            phone: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await adminApi.post('/fellowships', formData);
            setIsModalOpen(false);
            fetchFellowships();
        } catch (err) {
            console.error('Error saving fellowship:', err);
            alert(err.message || 'Failed to save fellowship.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteFellowship = async (id) => {
        if (!confirm('Are you sure you want to delete this fellowship center?')) return;
        try {
            await adminApi.del(`/fellowships/${id}`);
            fetchFellowships();
        } catch (err) {
            console.error('Error deleting fellowship:', err);
            alert('Failed to delete fellowship.');
        }
    };

    const filtered = fellowships.filter(f =>
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.leader_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="Manage House Fellowships">
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
                    <i className="fas fa-plus"></i> Add Fellowship Center
                </button>

                <input 
                    type="text"
                    placeholder="Search by center name, leader, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        minWidth: '260px'
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
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Center Name</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Leader</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Address</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Meeting Time</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Phone</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading fellowships...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No house fellowship centers found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((f) => (
                                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                        {f.name}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {f.leader_name}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {f.address || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {f.meeting_time || 'Sundays 5:00 PM'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {f.phone || f.contact_phone || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => deleteFellowship(f.id)}
                                            className="btn btn-sm btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                            title="Delete fellowship"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Fellowship Modal */}
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
                                Add Fellowship Center
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
                                        Center Name *
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Graceland Center A"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Leader Name *
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.leader_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, leader_name: e.target.value }))}
                                            placeholder="Brother / Sister Name"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Phone Number
                                        </label>
                                        <input 
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+234..."
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Meeting Address
                                    </label>
                                    <input 
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Street Address, Area"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Meeting Day & Time
                                    </label>
                                    <input 
                                        type="text"
                                        value={formData.meeting_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
                                        placeholder="e.g., Sundays at 5:00 PM"
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
                                    {isSaving ? 'Saving...' : 'Add Center'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
