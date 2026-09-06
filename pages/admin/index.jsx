import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalSermons: 0,
        totalViews: 0,
        totalLikes: 0,
        recentPosts: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        setIsLoading(true);
        try {
            const data = await adminApi.get('/admin/stats');
            setStats({
                totalPosts: data.totalPosts || 0,
                totalSermons: data.totalSermons || 0,
                totalViews: data.totalViews || 0,
                totalLikes: data.totalLikes || 0,
                recentPosts: data.recentPosts || []
            });
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
            setError('Could not load statistics from database.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout title="Dashboard Overview">
            {error && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                    {error}
                </div>
            )}

            {/* Statistics Grid */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-blog"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{isLoading ? '...' : stats.totalPosts}</h3>
                        <p>Total Blog Posts</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-video"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{isLoading ? '...' : stats.totalSermons}</h3>
                        <p>Total Sermons</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-eye"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{isLoading ? '...' : stats.totalViews.toLocaleString()}</h3>
                        <p>Total Post Views</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-heart"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{isLoading ? '...' : stats.totalLikes.toLocaleString()}</h3>
                        <p>Post Likes</p>
                    </div>
                </div>
            </div>

            {/* Content & Quick Actions Grid */}
            <div className="dashboard-content" style={{ marginTop: '24px' }}>
                <div className="recent-posts" style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Recent Blog Posts</h2>
                        <Link href="/admin/blog" style={{ fontSize: '13px', color: '#8B0000', textDecoration: 'none', fontWeight: '500' }}>
                            View All <i className="fas fa-arrow-right" style={{ fontSize: '11px', marginLeft: '4px' }}></i>
                        </Link>
                    </div>

                    <div className="posts-list">
                        {isLoading ? (
                            <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>
                                <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading recent posts...
                            </p>
                        ) : stats.recentPosts.length === 0 ? (
                            <p style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>No posts created yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {stats.recentPosts.map((post) => (
                                    <div 
                                        key={post.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #f1f5f9'
                                        }}
                                    >
                                        <div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                                {post.title}
                                            </h4>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                {post.category || 'General'} • {post.views || 0} views • {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link 
                                                href={`/admin/blog?edit=${post.id}`}
                                                className="btn btn-sm btn-outline"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    color: '#334155',
                                                    textDecoration: 'none',
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="quick-actions" style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px', color: '#1e293b' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link 
                            href="/admin/blog?new=1" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#fee2e2',
                                color: '#8B0000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-plus"></i>
                            </div>
                            <span>Create New Blog Post</span>
                        </Link>

                        <Link 
                            href="/admin/sermons?new=1" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-video"></i>
                            </div>
                            <span>Add New Sermon</span>
                        </Link>

                        <Link 
                            href="/admin/events?new=1" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-calendar-plus"></i>
                            </div>
                            <span>Schedule New Event</span>
                        </Link>

                        <Link 
                            href="/admin/gallery?new=1" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-images"></i>
                            </div>
                            <span>Upload to Gallery</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
