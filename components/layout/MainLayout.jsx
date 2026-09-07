import React, { useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children, title, description, image, url }) {
    const defaultTitle = "RCCG Graceland Area HQ - Favored Family | Lagos, Nigeria";
    const defaultDescription = "Experience an overflow of His grace at RCCG Graceland Area Headquarters in Apapa, Lagos. Join us for worship, sermons, and a vibrant community.";
    const defaultImage = "https://rccggraceland.com/logo.png";
    const defaultUrl = "https://rccggraceland.com";

    // Format title cleanly without duplication
    const pageTitle = title 
        ? (title.toLowerCase().includes("graceland") ? title : `${title} | RCCG Graceland Area HQ`)
        : defaultTitle;
    const pageDescription = description || defaultDescription;
    
    // Resolve pageImage to an absolute URL required by social crawlers (WhatsApp, Facebook, Twitter, LinkedIn)
    const siteBaseUrl = defaultUrl;
    let rawImage = image || defaultImage;
    if (rawImage && !rawImage.startsWith('http://') && !rawImage.startsWith('https://')) {
        rawImage = `${siteBaseUrl.replace(/\/$/, '')}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    }
    const pageImage = rawImage;
    const pageUrl = url || defaultUrl;

    useEffect(() => {
        // Run any global scripts that used to be in script.js that need to re-initialize on page load
    }, []);

    return (
        <div className="main-app">
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                
                <title>{pageTitle}</title>
                <meta name="title" content={pageTitle} />
                <meta name="description" content={pageDescription} />
                
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:site_name" content="RCCG Graceland Area HQ" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:image:secure_url" content={pageImage} />
                <meta property="og:image:alt" content={pageTitle} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                
                {/* Twitter / X */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={pageImage} />
                <meta name="twitter:image:alt" content={pageTitle} />
                
                <link rel="canonical" href={pageUrl} />
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
