import app from '../../api-server';

// Disable Next.js body parsing so Express can handle it (Multer, JSON, URL-Encoded)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true, // Tells Next.js that Express will handle the response resolution
  },
};

export default function handler(req, res) {
  // Pass the Next.js req/res objects directly into the Express application instance
  return new Promise((resolve, reject) => {
    // We bind to 'finish' event to resolve the promise so Next.js knows the API route is done
    res.on('finish', resolve);
    res.on('error', reject);
    
    // Execute Express
    app(req, res, (err) => {
      if (err) {
        console.error('Express Error:', err);
        return reject(err);
      }
      // If express doesn't handle the route (404)
      res.status(404).json({ error: 'API Route Not Found' });
      resolve();
    });
  });
}
