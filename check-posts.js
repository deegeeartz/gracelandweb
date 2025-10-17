const mysql = require('mysql2/promise');

async function checkPosts() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Starbaby8',
        database: 'graceland_church'
    });

    try {
        const [posts] = await pool.query('SELECT id, title, status, slug FROM blog_posts LIMIT 5');
        console.log('\n=== Blog Posts in Database ===');
        console.log(posts);
        
        // Try to get post with ID 1
        const [post1] = await pool.query('SELECT * FROM blog_posts WHERE id = 1');
        console.log('\n=== Post ID 1 Details ===');
        console.log(post1);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkPosts();
