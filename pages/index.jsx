import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SermonCard from '../components/shared/SermonCard';
import BlogCard from '../components/shared/BlogCard';
import FloatingGallery from '../components/shared/FloatingGallery';

export default function Home({ recentSermons, recentPosts, settings = {} }) {
    const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    return (
        <MainLayout>
            {/* Announcement Banner */}
            <div id="announcement-banner" className="announcement-banner" style={{ display: 'none' }}>
                <div className="container banner-content">
                    <span id="announcement-text"></span>
                    <button className="close-banner" onClick={() => document.getElementById('announcement-banner').style.display='none'}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>

            {/* Ambient Background Floating Gallery */}
            <FloatingGallery />

            {/* Hero Section */}
            <section 
                className="hero" 
                id="home"
                style={settings.hero_image ? { backgroundImage: `url(${settings.hero_image})` } : {}}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-logo">
                        <img src="/logo.png" alt="RCCG Graceland Area HQ Logo" className="hero-logo-image" />
                    </div>
                    <h2>{settings.site_name || "Welcome to Graceland Area HQ"}</h2>
                    <p>{settings.site_description || "Experiencing An Overflow Of His Grace"}</p>
                    <div className="cta-buttons">
                        <a href="#services" className="btn btn-primary">Join Us for Service</a>
                        <a href="#about" className="btn btn-secondary">Learn More</a>
                    </div>
                </div>
            </section>

            {/* Service Times */}
            <section className="service-times" id="services">
                <div className="container">
                    <div className="section-header">
                        <h2>Service Times</h2>
                        <p>Join us as we worship together</p>
                    </div>
                    <div className="times-grid">
                        <div className="time-card">
                            <div className="time-icon"><i className="fas fa-sun"></i></div>
                            <h3>Sunday Service</h3>
                            <p><strong>First Service</strong></p>
                            <p>7:00 AM - 9:00 AM</p>
                        </div>
                        <div className="time-card">
                            <div className="time-icon"><i className="fas fa-church"></i></div>
                            <h3>Sunday Service</h3>
                            <p><strong>Second Service</strong></p>
                            <p>9:30 AM - 11:30 AM</p>
                        </div>
                        <div className="time-card">
                            <div className="time-icon"><i className="fas fa-book-open"></i></div>
                            <h3>Bible Study</h3>
                            <p><strong>Wednesday</strong></p>
                            <p>6:00 PM - 8:00 PM</p>
                        </div>
                        <div className="time-card">
                            <div className="time-icon"><i className="fas fa-praying-hands"></i></div>
                            <h3>Prayer Meeting</h3>
                            <p><strong>Friday</strong></p>
                            <p>6:00 PM - 8:00 PM</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Livestream Section */}
            <section className="livestream" id="livestream">
                <div className="container">
                    <div className="section-header">
                        <h2>Watch Live</h2>
                        <p>Join our service from anywhere in the world</p>
                    </div>
                    <div className="livestream-container">
                        <div className="video-wrapper">
                            <div className="video-embed-container">
                                <iframe
                                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FRCCGLP4GRACELAND&tabs=timeline&width=800&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false"
                                    title="RCCG Graceland Facebook Timeline"
                                    className="video-embed-iframe"
                                    scrolling="no"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                                </iframe>
                            </div>
                        </div>
                        <div className="livestream-info">
                            <h3><i className="fas fa-circle live-indicator"></i> Live Every Sunday</h3>
                            <div className="service-schedule">
                                <p><strong>First Service:</strong> 7:00 AM WAT</p>
                                <p><strong>Second Service:</strong> 9:30 AM WAT</p>
                            </div>
                            <p className="livestream-description">
                                Can't make it to church? Watch our live service online and be part of our worship experience. Past services are also available on our Facebook page.
                            </p> 
                            <div className="social-live-links">
                                <a href={settings.facebook_page || "https://www.facebook.com/RCCGLP4GRACELAND/"} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                    <i className="fab fa-facebook-f"></i> Facebook Page
                                </a>
                                <a href={settings.instagram_handle || "https://www.instagram.com/rccggracelandparishbadagry/"} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                    <i className="fab fa-instagram"></i> Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about" id="about">
                <div className="container"> 
                    <div className="about-content">
                        <div className="about-text">
                            <h2>About Graceland Area HQ</h2>
                            <p>RCCG Graceland Area HQ is a vibrant community of believers under the Favored Family arm of the Redeemed Christian Church of God. We are committed to spreading the gospel of Jesus Christ and nurturing spiritual growth in our community.</p>
                            <p>Located at Jah Michael Bus Stop along Lagos-Badagry Expressway, we are easily accessible and welcome everyone to experience God's grace and love in a warm, family-oriented atmosphere.</p>
                            <p>Our mission is to make heaven, take as many people with us, and pursue a life of holiness according to God's word.</p>
                            <a href="#contact" className="btn btn-primary">
                                <i className="fas fa-map-marker-alt"></i> Visit Us
                            </a>
                        </div>
                        <div className="about-image" style={{ overflow: 'hidden', padding: 0 }}>
                            {settings?.about_image ? (
                                <img 
                                    src={settings.about_image} 
                                    alt="About RCCG Graceland" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                                />
                            ) : (
                                <i className="fas fa-cross"></i>
                            )}
                        </div>
                    </div> 
                </div>
            </section>

            {/* Sermons Section (SSR) */}
            <section className="sermons" id="sermons">
                <div className="container">
                    <div className="section-header">
                        <h2>Recent Sermons</h2>
                        <p>Stay connected with God's word through our inspiring messages</p>
                    </div>
                    <div className="sermons-grid">
                        {recentSermons.length > 0 ? (
                            recentSermons.map((sermon, index) => (
                                <SermonCard key={sermon.id} sermon={sermon} isFeatured={index === 0} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', width: '100%' }}>No sermons available.</p>
                        )}
                    </div>
                    <div className="sermon-archive">
                        <a href="/sermons" className="btn btn-primary">
                            <i className="fas fa-archive"></i> View All Sermons
                        </a>
                    </div>
                </div>
            </section>

            {/* Blog Section (SSR) */}
            <section className="blog" id="blog">
                <div className="container">
                    <div className="section-header">
                        <h2>Latest from Our Blog</h2>
                        <p>Insights, testimonies, and spiritual growth resources</p>
                    </div>
                    <div className="blog-grid" id="blogGrid">
                        {recentPosts.length > 0 ? (
                            recentPosts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', width: '100%' }}>No blog posts available.</p>
                        )}
                    </div> 
                    <div className="blog-archive">
                        <a href="/blog" className="btn btn-primary">
                            <i className="fas fa-rss"></i> View All Posts
                        </a>
                    </div>
                </div>
            </section>

            {/* Connect Section */}
            <section className="connect-section bg-light" id="connect" style={{ padding: '4rem 0', backgroundColor: 'var(--gray-50)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Connect With Us</h2>
                        <p>We'd love to hear from you and pray with you</p>
                    </div>
                    <div className="connect-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div className="connect-card" style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                            <div className="icon" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '20px' }}><i className="fas fa-praying-hands"></i></div>
                            <h3>Prayer Requests</h3>
                            <p style={{ marginBottom: '20px' }}>Submit your prayer requests. Our intercessory team is standing by to pray with you.</p>
                            <button className="btn btn-primary" onClick={() => setIsPrayerModalOpen(true)}>Submit Request</button>
                        </div>
                        <div className="connect-card" style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                            <div className="icon" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '20px' }}><i className="fas fa-user-plus"></i></div>
                            <h3>New Member Connect</h3>
                            <p style={{ marginBottom: '20px' }}>New here? We'd love to get to know you better and welcome you to the family.</p>
                            <button className="btn btn-secondary" onClick={() => setIsMemberModalOpen(true)}>Fill Connect Card</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="location" id="contact">
                <div className="container">
                    <div className="section-header">
                        <h2>Visit Us</h2>
                        <p>Come and worship with us</p>
                    </div> 
                    <div className="location-content">
                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.5621094397434!2d3.0385061147412896!3d6.483142595326843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b7feb14976979%3A0x33a0c20fc12e8539!2sRCCG%20Graceland%20Parish!5e0!3m2!1sen!2sng!4v1697461200000!5m2!1sen!2sng"
                                width="100%"
                                height="450"
                                className="google-map"
                                allowFullScreen={true}
                                loading="lazy"
                                title="RCCG Graceland Area HQ Location">
                            </iframe>
                            <div className="map-overlay">
                                <div className="map-info">
                                    <h4><i className="fas fa-map-marker-alt"></i> RCCG Graceland Area HQ</h4>
                                    <p>Jah Michael Bus Stop, Lagos-Badagry Expressway</p>
                                </div>
                            </div>
                        </div>
                        <div className="contact-info">
                            <h3>Get in Touch</h3>
                            <div className="contact-grid">
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                                    <div className="contact-details">
                                        <strong>Address</strong>
                                        <p style={{ whiteSpace: 'pre-line' }}>{settings.church_address || "Jah Michael Bus Stop\nLagos-Badagry Expressway\nLagos, Nigeria"}</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-phone"></i></div>
                                    <div className="contact-details">
                                        <strong>Phone</strong>
                                        <p style={{ whiteSpace: 'pre-line' }}>{settings.contact_phone || "+234 708 713 0095\n+234 818 418 6051"}</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                                    <div className="contact-details">
                                        <strong>Email</strong>
                                        <p>{settings.contact_email || "graceland@rccgapapa.org"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modals */}
            {isPrayerModalOpen && (
                <div id="prayerModal" className="modal" style={{ display: 'flex', position: 'fixed', zIndex: '2000', left: '0', top: '0', width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ backgroundColor: '#fefefe', margin: 'auto', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <span className="close-modal" onClick={() => setIsPrayerModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '15px', fontSize: '28px', cursor: 'pointer' }}>&times;</span>
                        <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Submit Prayer Request</h3>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Prayer request submitted!"); setIsPrayerModalOpen(false); }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <input type="text" placeholder="Your Name" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <textarea rows="4" placeholder="Your Prayer Request" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
                        </form>
                    </div>
                </div>
            )}

            {isMemberModalOpen && (
                <div id="memberModal" className="modal" style={{ display: 'flex', position: 'fixed', zIndex: '2000', left: '0', top: '0', width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ backgroundColor: '#fefefe', margin: 'auto', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <span className="close-modal" onClick={() => setIsMemberModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '15px', fontSize: '28px', cursor: 'pointer' }}>&times;</span>
                        <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Connect Card</h3>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Connect card submitted!"); setIsMemberModalOpen(false); }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <input type="text" placeholder="First Name" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <input type="email" placeholder="Your Email" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Submit Connect Card</button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export async function getServerSideProps() {
    try {
        const SermonModel = require('../database/models/Sermon');
        const BlogPostModel = require('../database/models/BlogPost');
        const SettingsModel = require('../database/models/Settings');
        
        // Fetch data directly from DB
        const recentSermons = await SermonModel.getRecent(3);
        const recentPosts = await BlogPostModel.getRecent(3);
        const settings = await SettingsModel.getAsObject();

        return {
            props: {
                recentSermons: JSON.parse(JSON.stringify(recentSermons)), // Serialize for Next.js
                recentPosts: JSON.parse(JSON.stringify(recentPosts)),
                settings: JSON.parse(JSON.stringify(settings || {}))
            }
        };
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        return {
            props: {
                recentSermons: [],
                recentPosts: [],
                settings: {}
            }
        };
    }
}
