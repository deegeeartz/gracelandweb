import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container"> 
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="RCCG Graceland Area HQ Logo" className="footer-logo-image" />
                        </div>
                        <h3>RCCG Graceland Area HQ</h3>
                        <p>An Area HQ under the Redeemed Christian Church of God, Favored Family</p>
                        <p className="footer-motto">"Experiencing An Overflow Of His Grace"</p>
                        <p>Making heaven, taking as many people with us.</p>
                    </div> 
                    <div className="footer-section">
                        <h3>Quick Links</h3> 
                        <ul>
                            <li><Link href="/#home">Home</Link></li>
                            <li><Link href="/#about">About Us</Link></li>
                            <li><Link href="/#services">Service Times</Link></li>
                            <li><Link href="/#sermons">Sermons</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                            <li><Link href="/#ministries">Ministries</Link></li>
                            <li><Link href="/#give">Give Online</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Connect With Us</h3> 
                        <ul className="social-links">
                            <li><a href="https://www.facebook.com/RCCGLP4GRACELAND/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i> Facebook</a></li>
                            <li><a href="https://www.instagram.com/rccggracelandparishbadagry/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i> Instagram</a></li>
                            <li><a href="https://www.tiktok.com/@graceland.area.badagry" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i> TikTok</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Contact Info</h3>
                        <p>Jah Michael Bus Stop<br />Lagos-Badagry Expressway<br />Lagos, Nigeria</p>
                        <p className="footer-contact">
                            <i className="fas fa-phone"></i> +234 708 713 0095, +234 818 418 6051<br />
                            <i className="fas fa-envelope"></i> graceland@rccgapapa.org
                        </p>
                    </div>
                </div> 
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} RCCG Graceland Area HQ. All rights reserved. | Under the Favored Family</p>
                </div>
            </div>
        </footer>
    );
}
