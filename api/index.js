// Vercel serverless function handler
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq, desc } = require('drizzle-orm');
const { pgTable, varchar, text, timestamp, integer, real, boolean } = require('drizzle-orm/pg-core');
const ws = require('ws');

// Define schema inline to avoid import issues
const topics = pgTable("topics", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

const youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey(),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url").notNull(),
  channelId: varchar("channel_id").notNull(),
  channelTitle: varchar("channel_title").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  likeCount: integer("like_count").default(0),
  viewCount: integer("view_count").default(0),
  isArizonaSpecific: boolean("is_arizona_specific").default(false),
  relevanceScore: real("relevance_score").default(0),
  popularityScore: real("popularity_score").default(0),
  ranking: integer("ranking"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

neonConfig.webSocketConstructor = ws;

// Initialize database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { topics, youtubeVideos } });

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
