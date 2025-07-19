import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const result = await db.execute(`
      SELECT v.id, v.video_id, v.title, v.description, v.thumbnail_url, 
             v.channel_title, v.published_at, v.view_count, v.like_count, 
             v.comment_count, v.duration, v.ranking_score, v.relevance_weight, 
             v.recency_weight, v.created_at, v.updated_at
      FROM youtube_videos v
      JOIN topics t ON v.topic_id = t.id
      WHERE t.slug = $1
      ORDER BY v.ranking_score DESC
      LIMIT $2
    `, [slug, limit]);
    
    const videos = result.rows.map(row => ({
      id: row[0],
      videoId: row[1],
      title: row[2],
      description: row[3],
      thumbnailUrl: row[4],
      channelTitle: row[5],
      publishedAt: row[6],
      viewCount: row[7],
      likeCount: row[8],
      commentCount: row[9],
      duration: row[10],
      rankingScore: row[11],
      relevanceWeight: row[12],
      recencyWeight: row[13],
      createdAt: row[14],
      updatedAt: row[15]
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
}
