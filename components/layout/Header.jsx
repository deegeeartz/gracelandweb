import React from 'react';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="header">
            <nav className="nav">
                <div className="logo">
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <img src="/logo.png" alt="RCCG Graceland Area HQ Logo" className="logo-image" />
                        <div className="logo-text">
                            <h1>RCCG GRACELAND AREA HQ</h1>
                            <p>Favored Family | Lagos, Nigeria</p>
                        </div>
                    </Link>
                </div>
                <button className="menu-toggle" aria-label="Toggle menu">
                    <span className="hamburger"></span>
                    <span className="hamburger"></span>
                    <span className="hamburger"></span>
                </button> 
                <ul className="nav-links" id="navLinks">
                    <li><Link href="/#home">Home</Link></li>
                    <li><Link href="/#livestream">Live</Link></li>
                    <li><Link href="/#about">About</Link></li>
                    <li><Link href="/#services">Services</Link></li>
                    <li><Link href="/#sermons">Sermons</Link></li>
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/#ministries">Ministries</Link></li>
                    <li><Link href="/#contact">Contact</Link></li>
                    <li><Link href="/#give">Give</Link></li>
                </ul>
            </nav>
        </header>
    );
}
