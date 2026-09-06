import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/admin-api';

export default function BlogManager() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Spiritual Growth',
        author: 'Pastor',
        excerpt: '',
        content: '',
        status: 'published',
        featured_image: ''
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [statusFilter, categoryFilter, searchQuery, page]);

    // Handle incoming query params (?new=1 or ?edit=ID)
    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.new === '1') {
            openCreateModal();
        } else if (router.query.edit) {
            loadPostForEdit(router.query.edit);
        }
    }, [router.isReady, router.query]);

    const loadCategories = async () => {
        try {
            const data = await adminApi.get('/blog/categories');
            if (Array.isArray(data)) {
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                status: statusFilter,
                category: categoryFilter,
                search: searchQuery
            });
            const data = await adminApi.get(`/admin/posts?${params.toString()}`);
            setPosts(data.posts || []);
            setTotalPages(data.pagination ? data.pagination.pages : 1);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: editingPostId ? prev.slug : generateSlug(title)
        }));
    };

    const openCreateModal = () => {
        setEditingPostId(null);
        setFormData({
            title: '',
            slug: '',
            category: categories[0]?.name || 'Spiritual Growth',
            author: 'RCCG Pastor',
            excerpt: '',
            content: '',
            status: 'published',
            featured_image: ''
        });
        setIsModalOpen(true);
    };

    const loadPostForEdit = async (id) => {
        try {
            const post = await adminApi.get(`/blog/${id}`);
            if (post) {
                setEditingPostId(post.id);
                setFormData({
                    title: post.title || '',
                    slug: post.slug || '',
                    category: post.category || 'Spiritual Growth',
                    author: post.author || 'RCCG Pastor',
                    excerpt: post.excerpt || '',
                    content: post.content || '',
                    status: post.status || 'published',
                    featured_image: post.featured_image || ''
                });
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error('Failed to load post for editing', err);
            alert('Could not load post details.');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const url = await adminApi.uploadFile(file);
            setFormData(prev => ({ ...prev, featured_image: url }));
        } catch (err) {
            console.error('Image upload failed', err);
            alert(err.message || 'Image upload failed.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingPostId) {
                await adminApi.put(`/admin/posts/${editingPostId}`, formData);
            } else {
                await adminApi.post('/admin/posts', formData);
            }

            setIsModalOpen(false);
            fetchPosts();
        } catch (err) {
            console.error('Error saving post:', err);
            alert(err.message || 'Failed to save blog post.');
        } finally {
            setIsSaving(false);
        }
    };

    const deletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this blog post? This cannot be undone.')) return;
        
        try {
            await adminApi.del(`/admin/posts/${id}`);
            fetchPosts();
        } catch (err) {
            console.error(err);
            alert('Failed to delete post.');
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'published':
                return { backgroundColor: '#dcfce7', color: '#15803d' };
            case 'draft':
                return { backgroundColor: '#fef3c7', color: '#b45309' };
            case 'scheduled':
                return { backgroundColor: '#e0e7ff', color: '#4338ca' };
            default:
                return { backgroundColor: '#f1f5f9', color: '#475569' };
        }
    };

    return (
        <AdminLayout title="Manage Blog Posts">
            {/* Header Controls */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <button 
                    className="btn btn-primary" 
                    onClick={openCreateModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-plus"></i> Create New Post
                </button>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            minWidth: '180px'
                        }}
                    />

                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                    </select>

                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                overflowX: 'auto'
            }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Title</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Category</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Author</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '14px 16px', fontWeight: '600', color: '#475569', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading posts...
                                </td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No posts found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1e293b' }}>
                                        {post.title}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {post.category || 'General'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {post.author || 'Pastor'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            ...getStatusBadgeStyle(post.status)
                                        }}>
                                            {post.status || 'published'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={() => loadPostForEdit(post.id)}
                                                className="btn btn-sm btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                title="Edit post"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onClick={() => deletePost(post.id)}
                                                className="btn btn-sm btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                title="Delete post"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit / Create Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '750px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                                {editingPostId ? 'Edit Blog Post' : 'Create New Blog Post'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Post Title *
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        placeholder="e.g., Walking in Divine Grace"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Category
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            placeholder="e.g., Spiritual Growth"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Author
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                            placeholder="e.g., Pastor"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Slug (URL Identifier)
                                        </label>
                                        <input 
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            placeholder="walking-in-divine-grace"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                            Status
                                        </label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        >
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                            <option value="scheduled">Scheduled</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Featured Image
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input 
                                            type="text"
                                            placeholder="Image URL or upload file below"
                                            value={formData.featured_image}
                                            onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                                            style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                        />
                                        <label style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#334155',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <i className="fas fa-upload"></i>
                                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                    {formData.featured_image && (
                                        <div style={{ marginTop: '8px' }}>
                                            <img 
                                                src={formData.featured_image} 
                                                alt="Preview" 
                                                style={{ height: '80px', borderRadius: '6px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Short Excerpt
                                    </label>
                                    <textarea 
                                        rows={2}
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        placeholder="A brief summary for previews and social sharing"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                                        Full Content *
                                    </label>
                                    <textarea 
                                        rows={8}
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Write the full post content (HTML or Markdown supported)..."
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#f8fafc'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 16px' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', minWidth: '120px' }}
                                >
                                    {isSaving ? 'Saving...' : (editingPostId ? 'Update Post' : 'Publish Post')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
