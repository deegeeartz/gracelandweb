import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function CommentManager() {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/admin/comments');
            setComments(Array.isArray(data) ? data : (data.comments || []));
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await adminApi.put(`/admin/comments/${id}/status`, { status });
            fetchComments();
        } catch (err) {
            console.error('Failed to update comment status', err);
            alert('Failed to update comment status.');
        }
    };

    const deleteComment = async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await adminApi.del(`/admin/comments/${id}`);
            fetchComments();
        } catch (err) {
            console.error('Failed to delete comment', err);
            alert('Failed to delete comment.');
        }
    };

    const filtered = comments.filter(c => {
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const query = searchQuery.toLowerCase();
        const matchesQuery = (
            (c.author_name && c.author_name.toLowerCase().includes(query)) ||
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.content && c.content.toLowerCase().includes(query))
        );
        return matchesStatus && matchesQuery;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return { bg: '#dcfce7', text: '#15803d', label: 'Approved' };
            case 'rejected':
                return { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' };
            default:
                return { bg: '#fef3c7', text: '#b45309', label: 'Pending' };
        }
    };

    return (
        <AdminLayout title="Moderate Blog Comments">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'pending', 'approved', 'rejected'].map(st => (
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
                            {st === 'all' ? 'All Comments' : st}
                        </button>
                    ))}
                </div>

                <input 
                    type="text"
                    placeholder="Search by author or comment text..."
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
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Author</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Comment Text</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Post</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading comments...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No comments found matching this filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => {
                                const badge = getStatusBadge(c.status);
                                return (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                            {c.author_name || c.name || 'Visitor'}
                                            {c.author_email && (
                                                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                                                    {c.author_email}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#334155', fontSize: '13px', maxWidth: '300px' }}>
                                            <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.content}
                                            </p>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                                            {c.post_title || `#${c.post_id}`}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: badge.bg,
                                                color: badge.text
                                            }}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                {c.status !== 'approved' && (
                                                    <button 
                                                        onClick={() => updateStatus(c.id, 'approved')}
                                                        className="btn btn-sm"
                                                        style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        title="Approve Comment"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
                                                {c.status !== 'rejected' && (
                                                    <button 
                                                        onClick={() => updateStatus(c.id, 'rejected')}
                                                        className="btn btn-sm"
                                                        style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        title="Reject Comment"
                                                    >
                                                        <i className="fas fa-ban"></i>
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteComment(c.id)}
                                                    className="btn btn-sm btn-danger"
                                                    style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                    title="Delete Comment"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
