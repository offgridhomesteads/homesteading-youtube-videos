// Database-First API - Vercel Compatible with CommonJS pg import

import pkg from 'pg';
const { Pool } = pkg;

// Database connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

function decodeHTMLEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const topicsData = [
  { id: "beekeeping", slug: "beekeeping", name: "Beekeeping", description: "Learn the art of beekeeping and honey production for sustainable homestead living." },
  { id: "composting", slug: "composting", name: "Composting", description: "Master composting techniques to create nutrient-rich soil for your homestead garden." },
  { id: "diy-home-maintenance", slug: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential home maintenance skills every homesteader should master." },
  { id: "food-preservation", slug: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your homestead harvest." },
  { id: "herbal-medicine", slug: "herbal-medicine", name: "Herbal Medicine", description: "Grow and use medicinal herbs for natural health and wellness solutions." },
  { id: "homestead-security", slug: "homestead-security", name: "Homestead Security", description: "Protect your property and ensure family safety in rural settings." },
  { id: "livestock-management", slug: "livestock-management", name: "Livestock Management", description: "Raise and care for farm animals to support your homestead lifestyle." },
  { id: "off-grid-water-systems", slug: "off-grid-water-systems", name: "Off-Grid Water Systems", description: "Design and maintain water systems for independent living." },
  { id: "organic-gardening", slug: "organic-gardening", name: "Organic Gardening", description: "Grow healthy, organic produce using sustainable gardening methods." },
  { id: "permaculture-design", slug: "permaculture-design", name: "Permaculture Design", description: "Create sustainable living systems through permaculture principles." },
  { id: "raising-chickens", slug: "raising-chickens", name: "Raising Chickens", description: "Complete guide to raising chickens for eggs, meat, and pest control." },
  { id: "soil-building-in-arid-climates", slug: "soil-building-in-arid-climates", name: "Soil Building in Arid Climates", description: "Build healthy soil in dry, desert conditions for successful farming." },
  { id: "solar-energy", slug: "solar-energy", name: "Solar Energy", description: "Harness solar power for energy independence on your homestead." },
  { id: "water-harvesting", slug: "water-harvesting", name: "Water Harvesting", description: "Collect and store rainwater for sustainable homestead water supply." }
];

// Database query functions
async function getVideosForTopic(topicSlug) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] getVideosForTopic called with slug: ${topicSlug}`);
  
  try {
    const query = `
      SELECT id, title, description, thumbnail_url as "thumbnailUrl", channel_title as "channelTitle", published_at as "publishedAt", 
             view_count as "viewCount", like_count as "likeCount", topic_id as "topicId"
      FROM youtube_videos 
      WHERE topic_id = $1 
      ORDER BY ranking ASC, popularity_score DESC 
      LIMIT 12
    `;
    
    console.log(`[${timestamp}] Executing query for topic: ${topicSlug}`);
    
    const result = await pool.query(query, [topicSlug]);
    console.log(`[${timestamp}] Query result: ${result.rows.length} videos found for ${topicSlug}`);
    
    return result.rows.map(video => ({
      ...video,
      title: decodeHTMLEntities(video.title),
      description: decodeHTMLEntities(video.description),
      channelTitle: decodeHTMLEntities(video.channelTitle),
      viewCount: parseInt(video.viewCount) || 0,
      likeCount: parseInt(video.likeCount) || 0
    }));
  } catch (error) {
    console.error(`[${timestamp}] Database error for topic ${topicSlug}:`, error.message);
    console.error(`[${timestamp}] Full error:`, error);
    return [];
  }
}

async function getVideoById(videoId) {
  try {
    const query = `
      SELECT id, title, description, thumbnail_url as "thumbnailUrl", channel_title as "channelTitle", published_at as "publishedAt", 
             view_count as "viewCount", like_count as "likeCount", topic_id as "topicId"
      FROM youtube_videos 
      WHERE id = $1 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [videoId]);
    if (result.rows.length > 0) {
      const video = result.rows[0];
      return {
        ...video,
        title: decodeHTMLEntities(video.title),
        description: decodeHTMLEntities(video.description),
        channelTitle: decodeHTMLEntities(video.channelTitle),
        viewCount: parseInt(video.viewCount) || 0,
        likeCount: parseInt(video.likeCount) || 0
      };
    }
    return null;
  } catch (error) {
    console.error(`Database error for video ${videoId}:`, error);
    return null;
  }
}

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] API Handler called - URL: ${req.url}`);
  console.log(`[${timestamp}] Database URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`[${timestamp}] Node ENV: ${process.env.NODE_ENV}`);
  
  const { method, url } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pathSegments = url.split('/').filter(Boolean).slice(1);

    // Route: /api/topics - Get all topics
    if (pathSegments.length === 1 && pathSegments[0] === 'topics') {
      return res.status(200).json(topicsData);
    }

    // Route: /api/debug - Test deployment status
    if (pathSegments.length === 1 && pathSegments[0] === 'debug') {
      console.log(`[${timestamp}] Debug endpoint called`);
      try {
        const testQuery = "SELECT COUNT(*) as total FROM youtube_videos";
        console.log(`[${timestamp}] Testing database connection...`);
        const result = await pool.query(testQuery);
        console.log(`[${timestamp}] Database test successful: ${result.rows[0].total} total videos`);
        
        return res.status(200).json({
          status: "success",
          timestamp,
          database: {
            connected: true,
            totalVideos: result.rows[0].total
          },
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasDatabaseUrl: !!process.env.DATABASE_URL
          }
        });
      } catch (error) {
        console.error(`[${timestamp}] Database test failed:`, error);
        return res.status(200).json({
          status: "database_error",
          timestamp,
          error: error.message,
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasDatabaseUrl: !!process.env.DATABASE_URL
          }
        });
      }
    }

    // Route: /api/topics/slug - Get single topic
    if (pathSegments.length === 2 && pathSegments[0] === 'topics') {
      const slug = pathSegments[1];
      const topic = topicsData.find(t => t.slug === slug);
      if (topic) {
        return res.status(200).json(topic);
      } else {
        return res.status(404).json({ error: 'Topic not found' });
      }
    }

    // Route: /api/topics/slug/videos - Get videos for topic from database
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      const videos = await getVideosForTopic(slug);
      return res.status(200).json(videos);
    }

    // Route: /api/video/videoId - Get single video from database
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      const video = await getVideoById(videoId);
      
      if (video) {
        return res.status(200).json(video);
      } else {
        // Fallback only if database completely fails
        const fallbackVideo = {
          id: videoId,
          title: "Homesteading Tutorial Video",
          description: "Learn essential homesteading techniques with this comprehensive guide.",
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelTitle: "Homesteading Guide",
          publishedAt: "2024-10-15T00:00:00Z",
          viewCount: 15000,
          likeCount: 500,
          topicId: "beekeeping"
        };
        return res.status(200).json(fallbackVideo);
      }
    }

    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('[API Error]', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
