// Static API route for beekeeping videos
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit) || 12;
      
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT v.* FROM youtube_videos v
          INNER JOIN topics t ON v.topic_id = t.id
          WHERE t.slug = \$1
          ORDER BY v.popularity_score DESC
          LIMIT \$2
        `, ['beekeeping', limit]);
        
        return res.status(200).json(result.rows);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
