import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function PrayerManager() {
    const [prayers, setPrayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrayer, setSelectedPrayer] = useState(null);

    useEffect(() => {
        fetchPrayers();
    }, []);

    const fetchPrayers = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/prayer');
            setPrayers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch prayer requests', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePrayerStatus = async (id, newStatus) => {
        try {
            await adminApi.put(`/prayer/${id}/status`, { status: newStatus });
            fetchPrayers();
        } catch (err) {
            console.error('Failed to update prayer status', err);
            alert('Failed to update status.');
        }
    };

    const deletePrayer = async (id) => {
        if (!confirm('Are you sure you want to delete this prayer request?')) return;
        try {
            await adminApi.del(`/prayer/${id}`);
            if (selectedPrayer?.id === id) setSelectedPrayer(null);
            fetchPrayers();
        } catch (err) {
            console.error('Failed to delete prayer request', err);
            alert('Failed to delete prayer request.');
        }
    };

    const filtered = prayers.filter(p => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const query = searchQuery.toLowerCase();
        const matchesQuery = (
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.email && p.email.toLowerCase().includes(query)) ||
            (p.request && p.request.toLowerCase().includes(query))
        );
        return matchesStatus && matchesQuery;
    });

    return (
        <AdminLayout title="Manage Prayer Requests">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'pending', 'prayed'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: statusFilter === st ? '#8B0000' : '#cbd5e1',
                                backgroundColor: statusFilter === st ? '#8B0000' : '#ffffff',
                                color: statusFilter === st ? '#ffffff' : '#475569',
                                fontSize: '13px',
                                fontWeight: '500',
                                textTransform: 'capitalize',
                                cursor: 'pointer'
                            }}
                        >
                            {st === 'all' ? 'All Requests' : st}
                        </button>
                    ))}
                </div>

                <input 
                    type="text"
                    placeholder="Search requests by name, email, or keywords..."
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
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Requester</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Contact</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Prayer Request</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading prayer requests...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No prayer requests found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                        {p.name || 'Anonymous'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {p.email || p.phone || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#334155', fontSize: '13px', maxWidth: '350px' }}>
                                        <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.request}
                                        </p>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: p.status === 'prayed' ? '#dcfce7' : '#fee2e2',
                                            color: p.status === 'prayed' ? '#15803d' : '#dc2626'
                                        }}>
                                            {p.status === 'prayed' ? 'Prayed For' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                            <button 
                                                onClick={() => setSelectedPrayer(p)}
                                                className="btn btn-sm btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                title="View details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {p.status === 'pending' ? (
                                                <button 
                                                    onClick={() => updatePrayerStatus(p.id, 'prayed')}
                                                    className="btn btn-sm"
                                                    style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px' }}
                                                    title="Mark as Prayed"
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => updatePrayerStatus(p.id, 'pending')}
                                                    className="btn btn-sm"
                                                    style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '4px' }}
                                                    title="Mark as Pending"
                                                >
                                                    <i className="fas fa-undo"></i>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deletePrayer(p.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                title="Delete request"
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

            {/* Prayer Detail Modal */}
            {selectedPrayer && (
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
                                Prayer Request Details
                            </h3>
                            <button 
                                onClick={() => setSelectedPrayer(null)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>FROM</span>
                                <h4 style={{ margin: '4px 0 0', fontSize: '16px', color: '#1e293b' }}>{selectedPrayer.name || 'Anonymous'}</h4>
                                <span style={{ fontSize: '13px', color: '#2563eb' }}>{selectedPrayer.email || selectedPrayer.phone || 'No contact provided'}</span>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '8px' }}>PRAYER REQUEST</span>
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                    {selectedPrayer.request}
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                                <span>Submitted: {selectedPrayer.created_at ? new Date(selectedPrayer.created_at).toLocaleString() : '—'}</span>
                                <span style={{ fontWeight: '600', color: selectedPrayer.status === 'prayed' ? '#16a34a' : '#dc2626' }}>
                                    {selectedPrayer.status === 'prayed' ? 'Prayed For' : 'Pending Action'}
                                </span>
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
                                onClick={() => setSelectedPrayer(null)}
                                className="btn btn-outline"
                                style={{ padding: '8px 16px' }}
                            >
                                Close
                            </button>
                            {selectedPrayer.status === 'pending' ? (
                                <button 
                                    onClick={() => {
                                        updatePrayerStatus(selectedPrayer.id, 'prayed');
                                        setSelectedPrayer(null);
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px' }}
                                >
                                    Mark as Prayed
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        updatePrayerStatus(selectedPrayer.id, 'pending');
                                        setSelectedPrayer(null);
                                    }}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 20px' }}
                                >
                                    Revert to Pending
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
