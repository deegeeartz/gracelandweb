import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Link from 'next/link';

export default function BlogPost({ post }) {
    if (!post) {
        return (
            <MainLayout title="Post Not Found">
                <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                    <h2>Blog Post Not Found</h2>
                    <p>The post you're looking for doesn't exist or has been removed.</p>
                    <Link href="/blog" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Blog</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout 
            title={post.title} 
            description={post.excerpt} 
            image={post.featured_image}
        >
            <article className="single-post">
                {/* Post Header with Featured Image */}
                {post.featured_image && (
                    <div className="post-header-image" style={{ 
                        width: '100%', 
                        height: '400px', 
                        backgroundImage: `url(${post.featured_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}>
                        <div className="overlay" style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }}></div>
                    </div>
                )}
                
                <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
                    <div className="post-meta" style={{ marginBottom: '20px', color: '#666' }}>
                        <span className="post-category" style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.9em',
                            marginRight: '15px'
                        }}>
                            {post.category_name || 'General'}
                        </span>
                        <span className="post-date">
                            <i className="fas fa-calendar"></i> {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="post-author" style={{ marginLeft: '15px' }}>
                            <i className="fas fa-user-circle"></i> {post.author_name || 'Admin'}
                        </span>
                    </div>

                    <h1 className="post-title" style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#333' }}>
                        {post.title}
                    </h1>

                    <div 
                        className="post-content" 
                        style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}
                        dangerouslySetInnerHTML={{ __html: post.content }} 
                    />

                    <div className="post-footer" style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="share-buttons">
                            <span style={{ marginRight: '15px', fontWeight: 'bold' }}>Share:</span>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=https://rccggraceland.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px', color: '#3b5998', fontSize: '1.2rem' }}><i className="fab fa-facebook"></i></a>
                            <a href={`https://twitter.com/intent/tweet?url=https://rccggraceland.com/blog/${post.slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px', color: '#1da1f2', fontSize: '1.2rem' }}><i className="fab fa-twitter"></i></a>
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' https://rccggraceland.com/blog/' + post.slug)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontSize: '1.2rem' }}><i className="fab fa-whatsapp"></i></a>
                        </div>
                        <Link href="/blog" className="btn btn-secondary">
                            &larr; Back to all posts
                        </Link>
                    </div>
                </div>
            </article>
        </MainLayout>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;
    
    try {
        const BlogPostModel = require('../../database/models/BlogPost');
        const post = await BlogPostModel.getBySlug(slug);

        if (!post) {
            return {
                notFound: true
            };
        }

        // Increment views in background
        BlogPostModel.incrementViews(post.id).catch(err => console.error("Failed to increment views:", err));

        return {
            props: {
                post: JSON.parse(JSON.stringify(post))
            }
        };
    } catch (error) {
        console.error(`Error fetching post ${slug}:`, error);
        return {
            props: {
                post: null
            }
        };
    }
}
