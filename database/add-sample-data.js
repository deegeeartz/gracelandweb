const { db } = require('./init-db');
const BlogPost = require('./models/BlogPost');
const Sermon = require('./models/Sermon');
const Category = require('./models/Category');

async function addSampleContent() {
    try {
        console.log('Adding sample blog posts and sermons...');

        // Get category IDs
        const categories = await Category.getAll();
        const spiritualGrowthCat = categories.find(c => c.slug === 'spiritual-growth');
        const testimonycat = categories.find(c => c.slug === 'testimony');
        const familyCat = categories.find(c => c.slug === 'family');

        // Sample blog posts
        const samplePosts = [
            {
                title: "Walking in Divine Purpose",
                slug: "walking-in-divine-purpose",
                excerpt: "Discovering God's plan for your life and stepping into your divine calling with faith and confidence.",
                content: `
                    <h2>Understanding Your Divine Purpose</h2>
                    <p>Every believer has been created with a specific purpose in mind. God has plans for each of us that are good, perfect, and designed to bring glory to His name.</p>
                    
                    <h3>Key Principles for Discovering Your Purpose:</h3>
                    <ol>
                        <li><strong>Prayer and Meditation:</strong> Spend time in God's presence seeking His direction</li>
                        <li><strong>Study the Word:</strong> Scripture reveals God's will and character</li>
                        <li><strong>Seek Godly Counsel:</strong> Connect with mature believers who can guide you</li>
                        <li><strong>Step Out in Faith:</strong> Trust God as you take steps toward your calling</li>
                    </ol>
                    
                    <blockquote>
                        <p>"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future." - Jeremiah 29:11</p>
                    </blockquote>
                    
                    <p>Remember, God's timing is perfect. Trust in His process as He prepares you for your divine assignment.</p>
                `,
                author_id: 1,
                category_id: spiritualGrowthCat ? spiritualGrowthCat.id : null,
                status: 'published',
                published_at: new Date('2024-10-15').toISOString()
            },
            {
                title: "From Addiction to Freedom",
                slug: "from-addiction-to-freedom",
                excerpt: "My journey from drug addiction to complete freedom in Christ. God can break any chain that binds you.",
                content: `
                    <h2>My Story of Redemption</h2>
                    <p>I never thought I would be sharing this testimony, but God has done such a remarkable work in my life that I cannot keep silent.</p>
                    
                    <h3>The Darkest Hour</h3>
                    <p>For years, I struggled with substance abuse. What started as experimenting in university became a prison that held me captive for over a decade. My family was broken, my career destroyed, and my hope was gone.</p>
                    
                    <h3>The Turning Point</h3>
                    <p>It was during my lowest point that a friend invited me to church. I reluctantly attended, but something happened that night. As the pastor preached about God's love and redemption, my heart was touched.</p>
                    
                    <blockquote>
                        <p>"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" - 2 Corinthians 5:17</p>
                    </blockquote>
                    
                    <h3>The Journey to Freedom</h3>
                    <p>Freedom didn't come overnight, but with God's grace, the support of my church family, and professional help, I began to experience victory over addiction.</p>
                    
                    <p>Today, I am 3 years clean and sober, married to a wonderful woman who loves God, and serving in ministry. God truly makes all things new!</p>
                `,
                author_id: 1,
                category_id: testimonycat ? testimonycat.id : null,
                status: 'published',
                published_at: new Date('2024-10-10').toISOString()
            },
            {
                title: "Building Strong Christian Families",
                slug: "building-strong-christian-families",
                excerpt: "God's blueprint for marriage and family: love, respect, communication, and putting Christ at the center.",
                content: `
                    <h2>The Foundation of a Christian Home</h2>
                    <p>In today's world, families face unprecedented challenges. However, God's Word provides us with timeless principles for building strong, Christ-centered families.</p>
                    
                    <h3>Christ as the Center</h3>
                    <p>When Jesus Christ is at the center of your home, everything else falls into place. Regular family devotions, prayer, and worship create a spiritual foundation that can withstand any storm.</p>
                    
                    <h3>Key Elements of a Strong Christian Family:</h3>
                    <ul>
                        <li><strong>Love:</strong> Unconditional love that mirrors God's love for us</li>
                        <li><strong>Respect:</strong> Honoring one another as image-bearers of God</li>
                        <li><strong>Communication:</strong> Open, honest, and grace-filled conversations</li>
                        <li><strong>Forgiveness:</strong> Quick to forgive as Christ has forgiven us</li>
                        <li><strong>Service:</strong> Looking out for one another's needs</li>
                    </ul>
                    
                    <h3>Practical Steps:</h3>
                    <ol>
                        <li>Establish regular family devotion time</li>
                        <li>Pray together daily</li>
                        <li>Attend church together consistently</li>
                        <li>Create traditions that honor God</li>
                        <li>Show hospitality to others</li>
                    </ol>
                    
                    <blockquote>
                        <p>"But as for me and my household, we will serve the Lord." - Joshua 24:15</p>
                    </blockquote>
                `,
                author_id: 1,
                category_id: familyCat ? familyCat.id : null,
                status: 'published',
                published_at: new Date('2024-10-08').toISOString()
            }
        ];

        // Insert blog posts
        for (const post of samplePosts) {
            await BlogPost.create(post);
            console.log(`Created blog post: ${post.title}`);
        }

        // Sample sermons
        const sampleSermons = [
            {
                title: "Walking in Faith, Not Fear",
                slug: "walking-in-faith-not-fear",
                description: "Discover how to overcome fear and walk boldly in the faith God has given you. Learn practical steps to trust God in uncertain times.",
                speaker: "Pastor David Adeoye",
                series: "Faith Series",
                scripture_reference: "2 Timothy 1:7",
                sermon_date: new Date('2024-10-13').toISOString(),
                duration: 45,
                status: 'published'
            },
            {
                title: "The Power of God's Grace",
                slug: "the-power-of-gods-grace",
                description: "Understanding the transformative power of grace in our daily lives and relationships. Grace is not just God's favor, but His enabling power.",
                speaker: "Pastor Sarah Johnson",
                series: "Grace Series",
                scripture_reference: "Ephesians 2:8-9",
                sermon_date: new Date('2024-10-06').toISOString(),
                duration: 38,
                status: 'published'
            },
            {
                title: "Love in Action",
                slug: "love-in-action",
                description: "Practical ways to demonstrate Christ's love in our community and family relationships. Love is more than a feeling - it's a choice and an action.",
                speaker: "Pastor Michael Obi",
                series: "Love Series",
                scripture_reference: "1 John 3:16-18",
                sermon_date: new Date('2024-09-29').toISOString(),
                duration: 42,
                status: 'published'
            }
        ];

        // Insert sermons
        for (const sermon of sampleSermons) {
            await Sermon.create(sermon);
            console.log(`Created sermon: ${sermon.title}`);
        }

        console.log('Sample content added successfully!');
        
    } catch (error) {
        console.error('Error adding sample content:', error);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    addSampleContent().then(() => {
        process.exit(0);
    });
}

module.exports = { addSampleContent };
