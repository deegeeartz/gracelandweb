import React from 'react';
import Link from 'next/link';

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin Dashboard</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link href="/admin">
                            <i className="fas fa-chart-line"></i> Overview
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/blog">
                            <i className="fas fa-blog"></i> Manage Blog
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/sermons">
                            <i className="fas fa-bible"></i> Manage Sermons
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/events">
                            <i className="fas fa-calendar-alt"></i> Manage Events
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/settings">
                            <i className="fas fa-cog"></i> Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
