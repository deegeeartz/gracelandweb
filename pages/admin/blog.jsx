import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

export default function BlogManager() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        author: '',
        excerpt: '',
        content: '',
        status: 'published'
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/blog');
            const data = await res.json();
            if (data.posts) {
                setPosts(data.posts);
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setIsLoading(false);
        }
    };

    const deletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/blog/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchPosts();
            } else {
                alert('Failed to delete post');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace('post', '').toLowerCase()]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Send the exact properties the backend expects based on admin-script-db.js
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    author: formData.author,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    status: formData.status
                })
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', category: '', author: '', excerpt: '', content: '', status: 'published' });
                fetchPosts();
            } else {
                const data = await res.json();
                alert(`Failed to save post: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving.');
        }
    };

    return (
        <AdminLayout title="Manage Blog Posts">
            <div className="content-header" style={{ marginBottom: '20px' }}>
                <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus"></i> Create New Post
                    </button>
                    <div className="filter-options" style={{ display: 'flex', gap: '10px' }}>
                        <select id="statusFilter" aria-label="Filter by status" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                        <select id="categoryFilter" aria-label="Filter by category" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="all">All Categories</option>
                            <option value="spiritual-growth">Spiritual Growth</option>
                            <option value="testimony">Testimony</option>
                            <option value="ministry">Ministry</option>
                            <option value="family">Family</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="posts-table-container" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '12px' }}>Title</th>
                            <th style={{ padding: '12px' }}>Category</th>
                            <th style={{ padding: '12px' }}>Author</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading posts...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No posts found.</td></tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{post.title}</td>
                                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.85em' }}>{post.category}</span></td>
                                    <td style={{ padding: '12px' }}>{post.author}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            background: post.status === 'published' ? '#dcfce7' : '#fef9c3', 
                                            color: post.status === 'published' ? '#166534' : '#854d0e',
                                            borderRadius: '4px', 
                                            fontSize: '0.85em' 
                                        }}>
                                            {post.status || 'published'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button className="btn btn-sm" style={{ marginRight: '8px', background: '#f3f4f6', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm" onClick={() => deletePost(post.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/*  Post Editor Modal  */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content large" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2>Create New Post</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form id="postForm" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="postTitle">Title</label>
                                    <input type="text" id="postTitle" required value={formData.title} onChange={handleFormChange} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="postCategory">Category</label>
                                        <select id="postCategory" required value={formData.category} onChange={handleFormChange}>
                                            <option value="">Select Category</option>
                                            <option value="Spiritual Growth">Spiritual Growth</option>
                                            <option value="Testimony">Testimony</option>
                                            <option value="Ministry">Ministry</option>
                                            <option value="Family">Family</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="postAuthor">Author</label>
                                        <input type="text" id="postAuthor" required value={formData.author} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="postExcerpt">Excerpt</label>
                                    <textarea id="postExcerpt" rows="3" value={formData.excerpt} onChange={handleFormChange} placeholder="Brief summary of the post..."></textarea>
                                </div> 
                                
                                <div className="form-group">
                                    <label htmlFor="postContent">Content (HTML or Text)</label>
                                    <textarea id="postContent" rows="10" required value={formData.content} onChange={handleFormChange} placeholder="Post content..."></textarea>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="postStatus">Status</label>
                                        <select id="postStatus" value={formData.status} onChange={handleFormChange}>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="scheduled">Scheduled</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" form="postForm" className="btn btn-primary">Publish Post</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
