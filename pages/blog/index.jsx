import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import BlogCard from '../../components/shared/BlogCard';

export default function BlogIndex({ posts, pagination }) {
    return (
        <MainLayout title="Blog & Testimonies">
            <section className="blog-page-header" style={{ padding: '80px 0 40px', backgroundColor: 'var(--gray-50)', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>Our Blog</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                        Read the latest testimonies, ministry updates, and spiritual growth articles from our community.
                    </p>
                </div>
            </section>

            <section className="blog-list" style={{ padding: '60px 0' }}>
                <div className="container">
                    {posts.length > 0 ? (
                        <>
                            <div className="blog-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                                gap: '30px' 
                            }}>
                                {posts.map(post => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', gap: '10px' }}>
                                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                                        <a 
                                            key={i} 
                                            href={`/blog?page=${i + 1}`}
                                            className={`btn ${pagination.currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                            style={{ padding: '8px 15px' }}
                                        >
                                            {i + 1}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <i className="fas fa-file-alt" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                            <h3>No posts found</h3>
                            <p>Check back later for new updates.</p>
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
}

export async function getServerSideProps(context) {
    const page = parseInt(context.query.page) || 1;
    
    try {
        const BlogPostModel = require('../../database/models/BlogPost');
        
        const limit = 9; // Posts per page
        
        const [posts, totalCount] = await Promise.all([
            BlogPostModel.getAll({ page, limit, status: 'published' }),
            BlogPostModel.getCount({ status: 'published' })
        ]);

        return {
            props: {
                posts: JSON.parse(JSON.stringify(posts)),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount
                }
            }
        };
    } catch (error) {
        console.error("Error fetching blog list:", error);
        return {
            props: {
                posts: [],
                pagination: null
            }
        };
    }
}
