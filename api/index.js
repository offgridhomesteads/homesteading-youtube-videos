// Vercel serverless function handler
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { topics, youtubeVideos } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Initialize database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { topics, youtubeVideos } });

export default async function handler(req, res) {
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
      const allTopics = await db.select().from(topics).orderBy(topics.name);
      return res.status(200).json(allTopics);
    }

    // Handle /api/topics/:slug
    if (pathSegments.length === 3 && pathSegments[0] === 'api' && pathSegments[1] === 'topics') {
      const slug = pathSegments[2];
      const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(topic);
    }

    // Handle /api/topics/:slug/videos
    if (pathSegments.length === 4 && pathSegments[0] === 'api' && pathSegments[1] === 'topics' && pathSegments[3] === 'videos') {
      const slug = pathSegments[2];
      const limit = parseInt(url.searchParams.get('limit')) || 12;
      
      const result = await db
        .select({
          video: youtubeVideos,
        })
        .from(youtubeVideos)
        .innerJoin(topics, eq(youtubeVideos.topicId, topics.id))
        .where(eq(topics.slug, slug))
        .orderBy(desc(youtubeVideos.popularityScore))
        .limit(limit);
      
      const videos = result.map(row => row.video);
      return res.status(200).json(videos);
    }

    // Default 404
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
