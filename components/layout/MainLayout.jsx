import React, { useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children, title, description, image, url }) {
    const defaultTitle = "RCCG Graceland Area HQ - Favored Family | Lagos, Nigeria";
    const defaultDescription = "Experience an overflow of His grace at RCCG Graceland Area Headquarters in Apapa, Lagos. Join us for worship, sermons, and a vibrant community.";
    const defaultImage = "https://www.rccggraceland.com/logo.png";
    const defaultUrl = "https://rccggraceland.com";

    const pageTitle = title ? `${title} | RCCG Graceland Area HQ` : defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageImage = image || defaultImage;
    const pageUrl = url || defaultUrl;

    useEffect(() => {
        // Run any global scripts that used to be in script.js that need to re-initialize on page load
        // E.g., mobile menu toggling could be handled here or inside Header.jsx directly
    }, []);

    return (
        <div className="main-app">
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                
                <title>{pageTitle}</title>
                <meta name="title" content={pageTitle} />
                <meta name="description" content={pageDescription} />
                
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={pageUrl} />
                <meta property="twitter:title" content={pageTitle} />
                <meta property="twitter:description" content={pageDescription} />
                <meta property="twitter:image" content={pageImage} />
                
                <link rel="icon" type="image/png" href="/logo.png" />
            </Head>

            {/* Announcement Banner could go here */}
            
            <Header />
            
            <main className="main-content">
                {children}
            </main>
            
            <Footer />
        </div>
    );
}
