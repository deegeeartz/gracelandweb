const fs = require('fs');
const path = require('path');

const filesToConvert = [
    { src: 'index.html', dest: 'pages/index.jsx', name: 'Home' },
    { src: 'blog.html', dest: 'pages/blog/index.jsx', name: 'Blog' },
    { src: 'admin.html', dest: 'pages/admin/index.jsx', name: 'Admin' },
];

function convertToJsx(html) {
    let jsx = html;
    
    // Replace class= with className=
    jsx = jsx.replace(/class=/g, 'className=');
    
    // Replace for= with htmlFor=
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    // Self close tags
    jsx = jsx.replace(/<(img|input|br|hr|meta|link)([^>]*[^\/])>/g, '<$1$2 />');
    
    // Remove DOCTYPE
    jsx = jsx.replace(/<!DOCTYPE html>/i, '');
    
    // Replace HTML comments with JSX comments
    jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
    
    // Inline styles: style="display: none; padding: 30px;" to style={{ display: 'none', padding: '30px' }}
    jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
        const styleObj = p1.split(';').filter(s => s.trim()).reduce((acc, style) => {
            const [key, value] = style.split(':');
            if (key && value) {
                // camelCase the key
                const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                acc.push(`${camelKey}: '${value.trim()}'`);
            }
            return acc;
        }, []);
        return `style={{ ${styleObj.join(', ')} }}`;
    });

    return jsx;
}

// Ensure pages and subdirs exist
if (!fs.existsSync(path.join(__dirname, '../pages'))) fs.mkdirSync(path.join(__dirname, '../pages'));
if (!fs.existsSync(path.join(__dirname, '../pages/blog'))) fs.mkdirSync(path.join(__dirname, '../pages/blog'));
if (!fs.existsSync(path.join(__dirname, '../pages/admin'))) fs.mkdirSync(path.join(__dirname, '../pages/admin'));

filesToConvert.forEach(file => {
    const srcPath = path.join(__dirname, '../', file.src);
    const destPath = path.join(__dirname, '../', file.dest);
    
    if (fs.existsSync(srcPath)) {
        const html = fs.readFileSync(srcPath, 'utf8');
        const jsxBody = convertToJsx(html);
        
        const componentCode = `
import React from 'react';
import Head from 'next/head';

export default function ${file.name}() {
    return (
        <>
            ${jsxBody}
        </>
    );
}
`;
        fs.writeFileSync(destPath, componentCode);
        console.log(`Converted ${file.src} to ${file.dest}`);
    }
});
