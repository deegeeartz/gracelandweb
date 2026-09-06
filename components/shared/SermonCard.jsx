import React from 'react';
import Link from 'next/link';

export default function SermonCard({ sermon, isFeatured = false }) {
    return (
        <div className={`sermon-card ${isFeatured ? 'featured' : ''}`}>
            <div className="sermon-image">
                {sermon.featured_image ? (
                    <img src={sermon.featured_image} alt={sermon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <i className="fas fa-microphone-alt"></i>
                )}
                {isFeatured && <div className="sermon-badge">Latest</div>}
            </div>
            <div className="sermon-content">
                <div className="sermon-meta">
                    <span className="sermon-date">
                        <i className="fas fa-calendar"></i> {new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {sermon.series && <span className="sermon-series">{sermon.series}</span>}
                </div>
                <h3>{sermon.title}</h3>
                <p className="sermon-excerpt">
                    {sermon.description || 'Join us to hear this powerful message.'}
                </p>
                <div className="sermon-footer">
                    <span className="sermon-speaker">
                        <i className="fas fa-user"></i> {sermon.speaker}
                    </span>
                    <div className="sermon-actions">
                        {sermon.audio_url && (
                            <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer" className="btn-sermon btn-primary">
                                <i className="fas fa-play"></i> Listen
                            </a>
                        )}
                        {sermon.video_url && (
                            <a href={sermon.video_url} target="_blank" rel="noopener noreferrer" className="btn-sermon btn-secondary">
                                <i className="fas fa-video"></i> Watch
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
