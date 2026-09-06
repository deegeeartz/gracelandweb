import React from 'react';
import Head from 'next/head';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
    return (
        <div className="authenticated">
            <Head>
                <title>{title} - RCCG Graceland Admin</title>
            </Head>
            
            {/* Load admin styles only for admin pages */}
            <link rel="stylesheet" href="/admin-styles.css" />
            
            <AdminSidebar />
            
            <main className="main-content">
                <header className="main-header">
                    <div className="header-left"> 
                        <button className="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle mobile menu">
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1 className="page-title">{title}</h1>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search..." id="searchInput" />
                        </div>
                        <div className="header-actions">
                            <button className="action-btn" id="logoutBtn">
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="tab-content active" style={{ display: 'block' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
