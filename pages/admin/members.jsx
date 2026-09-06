import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function MembersManager() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/members');
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch members', err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMember = async (id) => {
        if (!confirm('Are you sure you want to delete this member entry?')) return;
        try {
            await adminApi.del(`/members/${id}`);
            fetchMembers();
        } catch (err) {
            console.error('Failed to delete member', err);
            alert('Failed to delete member.');
        }
    };

    const filtered = members.filter(m => {
        const query = searchQuery.toLowerCase();
        return (
            (m.full_name && m.full_name.toLowerCase().includes(query)) ||
            (m.name && m.name.toLowerCase().includes(query)) ||
            (m.email && m.email.toLowerCase().includes(query)) ||
            (m.phone && m.phone.toLowerCase().includes(query))
        );
    });

    return (
        <AdminLayout title="Connect Cards & Members">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                    Total Entries: <strong style={{ color: '#1e293b' }}>{members.length}</strong>
                </div>

                <input 
                    type="text"
                    placeholder="Search by name, email, or phone..."
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
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Full Name</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Email</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Phone</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Fellowship Choice</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date Submitted</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading members...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No connect cards or member entries found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((m) => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                        {m.full_name || m.name || 'Member'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {m.email ? (
                                            <a href={`mailto:${m.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                                {m.email}
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {m.phone ? (
                                            <a href={`tel:${m.phone}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                                                {m.phone}
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {m.house_fellowship || m.fellowship || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => deleteMember(m.id)}
                                            className="btn btn-sm btn-danger"
                                            style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                            title="Delete entry"
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
        </AdminLayout>
    );
}
