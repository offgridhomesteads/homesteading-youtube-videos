// Vercel serverless function handler
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Handle /api/topics
    if (pathSegments.length === 2 && pathSegments[0] === 'api' && pathSegments[1] === 'topics') {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM topics ORDER BY name');
        return res.status(200).json(result.rows);
      } finally {
        client.release();
      }
    }

    // Handle /api/topics/:slug
    if (pathSegments.length === 3 && pathSegments[0] === 'api' && pathSegments[1] === 'topics') {
      const slug = pathSegments[2];
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM topics WHERE slug = $1', [slug]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Topic not found" });
        }
        
        return res.status(200).json(result.rows[0]);
      } finally {
        client.release();
      }
    }

    // Handle /api/topics/:slug/videos
    if (pathSegments.length === 4 && pathSegments[0] === 'api' && pathSegments[1] === 'topics' && pathSegments[3] === 'videos') {
      const slug = pathSegments[2];
      const limit = parseInt(url.searchParams.get('limit')) || 12;
      
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT v.* FROM youtube_videos v
          INNER JOIN topics t ON v.topic_id = t.id
          WHERE t.slug = $1
          ORDER BY v.popularity_score DESC
          LIMIT $2
        `, [slug, limit]);
        
        return res.status(200).json(result.rows);
      } finally {
        client.release();
      }
    }

    // Default 404
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
