import React from 'react';
import Link from 'next/link';

export default function BlogCard({ post }) {
    return (
        <div className="blog-card">
            {post.featured_image && (
                <div className="blog-image">
                    <img src={post.featured_image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </div>
            )}
            <div className="blog-content">
                <div className="blog-meta">
                    <span className="blog-category">
                        {post.category_name || post.category_id || 'General'}
                    </span>
                    <span className="blog-date">
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <h3>
                    <Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                </h3>
                <p className="blog-excerpt">
                    {post.excerpt || post.content?.substring(0, 100) + '...'}
                </p>
                <div className="blog-footer">
                    <span className="blog-author">
                        <i className="fas fa-user-circle"></i> {post.author_name || 'Admin'}
                    </span>
                    <Link href={`/blog/${post.slug || post.id}`} className="read-more">
                        Read More <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
}
