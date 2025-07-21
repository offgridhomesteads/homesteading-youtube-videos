// Single consolidated API handler for all endpoints
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const urlPath = url.split('?')[0];
  const query = new URLSearchParams(url.split('?')[1] || '');

  try {
    const client = await pool.connect();
    
    try {
      // Route: /api/topics - Get all topics
      if (urlPath === '/api' && !query.get('action')) {
        const result = await client.query('SELECT * FROM topics ORDER BY name');
        return res.status(200).json(result.rows);
      }

      // Route: /api?action=topic&slug=X - Get specific topic
      if (query.get('action') === 'topic') {
        const slug = query.get('slug');
        if (!slug) {
          return res.status(400).json({ message: "Topic slug is required" });
        }

        const result = await client.query('SELECT * FROM topics WHERE slug = $1', [slug]);
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Topic not found" });
        }
        return res.status(200).json(result.rows[0]);
      }

      // Route: /api?action=videos&slug=X - Get videos for topic
      if (query.get('action') === 'videos') {
        const slug = query.get('slug');
        const limit = parseInt(query.get('limit')) || 12;
        
        if (!slug) {
          return res.status(400).json({ message: "Topic slug is required" });
        }
        
        const result = await client.query(`
          SELECT v.* FROM youtube_videos v
          INNER JOIN topics t ON v.topic_id = t.id
          WHERE t.slug = $1
          ORDER BY v.popularity_score DESC
          LIMIT $2
        `, [slug, limit]);
        
        return res.status(200).json(result.rows);
      }

      // Default route - return all topics (for backward compatibility)
      const result = await client.query('SELECT * FROM topics ORDER BY name');
      return res.status(200).json(result.rows);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
