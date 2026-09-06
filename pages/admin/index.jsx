import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        posts: 0,
        views: 0,
        shares: 0,
        comments: 0
    });

    useEffect(() => {
        // TODO: Fetch from /api/admin/stats
        setStats({
            posts: 12,
            views: 2847,
            shares: 156,
            comments: 89
        });
    }, []);

    return (
        <AdminLayout title="Overview">
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-blog"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.posts}</h3>
                        <p>Total Posts</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-eye"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.views}</h3>
                        <p>Total Views</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-share"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.shares}</h3>
                        <p>Social Shares</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-comment"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.comments}</h3>
                        <p>Comments</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-posts">
                    <h2>Recent Blog Posts</h2>
                    <div className="posts-list">
                        <p style={{ padding: '20px', color: '#666' }}>Loading recent posts...</p>
                    </div>
                </div>
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="quick-action-btn">
                            <i className="fas fa-plus"></i>
                            <span>New Blog Post</span>
                        </button>
                        <button className="quick-action-btn">
                            <i className="fas fa-microphone-alt"></i>
                            <span>Add Sermon</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
