import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminSidebar from './AdminSidebar';
import AdminLogin from './AdminLogin';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { adminApi } from '../../lib/admin-api';

function AdminLayoutInner({ children, title = 'Admin Dashboard' }) {
    const { isAuthenticated, isLoading, logout, user } = useAdminAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState({
        pendingPrayers: 0,
        pendingComments: 0,
        total: 0
    });

    // Poll notifications every 30s when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;
        const fetchNotifications = async () => {
            try {
                const [prayers, comments] = await Promise.all([
                    adminApi.get('/prayer').catch(() => []),
                    adminApi.get('/admin/comments').catch(() => [])
                ]);

                if (!isMounted) return;

                const pendingPrayers = Array.isArray(prayers) 
                    ? prayers.filter(p => p.status === 'pending').length 
                    : 0;
                const pendingComments = Array.isArray(comments) 
                    ? comments.filter(c => c.status === 'pending').length 
                    : 0;

                setNotifications({
                    pendingPrayers,
                    pendingComments,
                    total: pendingPrayers + pendingComments
                });
            } catch (err) {
                console.error('Failed to load notifications:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '32px', color: '#8B0000', marginBottom: '16px' }}></i>
                    <p style={{ margin: 0, fontSize: '15px' }}>Loading RCCG Admin Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <div className="authenticated">
            <Head>
                <title>{title} - RCCG Graceland Admin</title>
                <link rel="stylesheet" href="/admin-styles.css" />
            </Head>

            <AdminSidebar 
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <header className="main-header">
                    <div className="header-left">
                        <button 
                            className="mobile-menu-toggle" 
                            id="mobileMenuToggle" 
                            aria-label="Toggle mobile menu"
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1 className="page-title">{title}</h1>
                    </div>

                    <div className="header-right">
                        {/* Notifications Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                className="action-btn"
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                title="Notifications"
                            >
                                <i className="fas fa-bell"></i>
                                {notifications.total > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        backgroundColor: '#dc2626',
                                        color: '#ffffff',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        lineHeight: 1
                                    }}>
                                        {notifications.total}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '8px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    width: '260px',
                                    zIndex: 1000,
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        borderBottom: '1px solid #e2e8f0',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        color: '#1e293b'
                                    }}>
                                        Notifications
                                    </div>
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                        {notifications.pendingPrayers > 0 && (
                                            <li>
                                                <Link 
                                                    href="/admin/prayers"
                                                    onClick={() => setNotificationsOpen(false)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 14px',
                                                        fontSize: '13px',
                                                        color: '#2563eb',
                                                        textDecoration: 'none',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <i className="fas fa-praying-hands"></i>
                                                    <span>{notifications.pendingPrayers} pending prayer request(s)</span>
                                                </Link>
                                            </li>
                                        )}
                                        {notifications.pendingComments > 0 && (
                                            <li>
                                                <Link 
                                                    href="/admin/comments"
                                                    onClick={() => setNotificationsOpen(false)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 14px',
                                                        fontSize: '13px',
                                                        color: '#16a34a',
                                                        textDecoration: 'none',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <i className="fas fa-comments"></i>
                                                    <span>{notifications.pendingComments} pending comment(s)</span>
                                                </Link>
                                            </li>
                                        )}
                                        {notifications.total === 0 && (
                                            <li style={{ padding: '14px', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                                                No new notifications
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Header Actions */}
                        <div className="header-actions">
                            <a 
                                href="/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="action-btn"
                                title="Open website in new tab to preview"
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fas fa-external-link-alt"></i>
                                <span>Preview Site</span>
                            </a>

                            <button 
                                className="action-btn" 
                                id="logoutBtn"
                                onClick={logout}
                                title="Sign out of Admin Portal"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="tab-content active" style={{ display: 'block', padding: '24px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout(props) {
    return (
        <AdminAuthProvider>
            <AdminLayoutInner {...props} />
        </AdminAuthProvider>
    );
}
