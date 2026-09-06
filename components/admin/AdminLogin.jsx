import React, { useState } from 'react';
import Head from 'next/head';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
    const { login } = useAdminAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(username.trim(), password);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-wrapper" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <Head>
                <title>Sign In - RCCG Graceland Admin Portal</title>
            </Head>

            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '440px',
                padding: '40px',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        margin: '0 auto 16px',
                        borderRadius: '50%',
                        backgroundColor: '#8B0000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '32px',
                        boxShadow: '0 4px 12px rgba(139, 0, 0, 0.3)'
                    }}>
                        <i className="fas fa-church"></i>
                    </div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 8px'
                    }}>RCCG Admin Portal</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: 0
                    }}>Sign in to manage church website content</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#dc2626',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label 
                            htmlFor="admin-username" 
                            style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#334155' 
                            }}
                        >
                            Username
                        </label>
                        <input
                            id="admin-username"
                            type="text"
                            required
                            autoComplete="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label 
                            htmlFor="admin-password" 
                            style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                color: '#334155' 
                            }}
                        >
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#8B0000',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.8 : 1,
                            transition: 'background-color 0.2s, opacity 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(139, 0, 0, 0.2)'
                        }}
                    >
                        {isSubmitting ? (
                            <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Signing in...</span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    RCCG Graceland Chapel © {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
