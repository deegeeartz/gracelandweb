import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdminAuth } from './AdminAuthContext';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: 'fas fa-tachometer-alt', exact: true },
    { href: '/admin/hero', label: 'Hero Section', icon: 'fas fa-image' },
    { href: '/admin/ministries', label: 'Ministries', icon: 'fas fa-users-cog' },
    { href: '/admin/events', label: 'Events', icon: 'fas fa-calendar-alt' },
    { href: '/admin/fellowships', label: 'Fellowships', icon: 'fas fa-users' },
    { href: '/admin/gallery', label: 'Gallery', icon: 'fas fa-images' },
    { href: '/admin/prayers', label: 'Prayer Requests', icon: 'fas fa-praying-hands' },
    { href: '/admin/members', label: 'Connect Cards', icon: 'fas fa-address-card' },
    { href: '/admin/blog', label: 'Blog Posts', icon: 'fas fa-blog' },
    { href: '/admin/comments', label: 'Comments', icon: 'fas fa-comments' },
    { href: '/admin/sermons', label: 'Sermons', icon: 'fas fa-video' },
    { href: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
];

export default function AdminSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
    const router = useRouter();
    const { user } = useAdminAuth();

    const isActive = (item) => {
        if (item.exact) {
            return router.pathname === item.href;
        }
        return router.pathname.startsWith(item.href);
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div 
                    onClick={onCloseMobile}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                    }}
                />
            )}

            <aside 
                className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                style={isMobileOpen ? { transform: 'translateX(0)', display: 'flex' } : {}}
            >
                <div className="sidebar-header">
                    <div className="logo">
                        <i className="fas fa-church"></i>
                        <h2>RCCG Admin</h2>
                    </div>
                    <button 
                        className="sidebar-toggle" 
                        onClick={onToggleCollapse} 
                        title="Toggle sidebar" 
                        aria-label="Toggle sidebar"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>

                <ul className="sidebar-menu">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        return (
                            <li key={item.href} className={`menu-item ${active ? 'active' : ''}`}>
                                <Link 
                                    href={item.href} 
                                    onClick={() => { if (onCloseMobile) onCloseMobile(); }}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div 
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '18px',
                                flexShrink: 0
                            }}
                        >
                            <i className="fas fa-user-shield"></i>
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.username || 'Administrator'}</span>
                            <span className="user-role">Super Admin</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
