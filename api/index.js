// Single consolidated API handler for all endpoints

export default async function handler(req, res) {
  // Add detailed error logging for Vercel debugging
  console.log('Function started:', { url: req.url, method: req.method });
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment');
    return res.status(500).json({ 
      message: "Database configuration error",
      hasEnv: !!process.env,
      envKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')).length
    });
  }

  const { url } = req;
  const urlPath = url.split('?')[0];
  const query = new URLSearchParams(url.split('?')[1] || '');
  
  console.log('API Request:', { url, urlPath, method: req.method, userAgent: req.headers['user-agent']?.slice(0, 50) });
  
  // Parse URL path to determine endpoint
  const pathSegments = urlPath.replace('/api', '').split('/').filter(Boolean);
  console.log('Path segments:', pathSegments);

  try {
    // Import inside try block to handle module loading issues
    let sql;
    try {
      // Try Neon serverless first - fix DATABASE_URL format
      let dbUrl = process.env.DATABASE_URL;
      if (dbUrl && dbUrl.startsWith("psql '") && dbUrl.endsWith("'")) {
        dbUrl = dbUrl.slice(6, -1); // Remove "psql '" prefix and "'" suffix
      }
      
      const { neon } = await import('@neondatabase/serverless');
      sql = neon(dbUrl);
      console.log('Successfully connected to Neon database for request:', query.get('action'), query.get('slug'));
      
      // Test if tables exist - if not, fall back to mock data
      try {
        await sql`SELECT 1 FROM topics LIMIT 1`;
        console.log('Database tables exist, using real data');
      } catch (tableError) {
        console.log('Database tables do not exist, falling back to mock data');
        throw new Error('Tables not found');
      }
    } catch (importError) {
      console.error('Failed to import @neondatabase/serverless:', importError.message);
      
      // Fallback to mock data if database import fails
      console.warn('Using fallback mock data - database connection failed');
      console.warn('Database URL exists:', !!process.env.DATABASE_URL);
      console.warn('YouTube API key exists:', !!process.env.YOUTUBE_API_KEY);
      sql = async (strings, ...values) => {
        const query = strings[0];
        
        if (query.includes('SELECT * FROM topics WHERE slug')) {
          // Single topic query
          const slug = values[0];
          console.log('Mock SQL: Looking for topic with slug:', slug);
          
          const topicData = {
            "beekeeping": {id: "beekeeping", name: "Beekeeping", description: "Managing honey bee colonies for pollination and honey production.", slug: "beekeeping", createdAt: "2025-07-17T21:31:45.359Z"},
            "composting": {id: "composting", name: "Composting", description: "Creating nutrient-rich soil amendments from organic waste.", slug: "composting", createdAt: "2025-07-17T21:31:45.319Z"},
            "diy-home-maintenance": {id: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential skills for maintaining and repairing your homestead.", slug: "diy-home-maintenance", createdAt: "2025-07-17T21:31:45.481Z"},
            "food-preservation": {id: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your harvest.", slug: "food-preservation", createdAt: "2025-07-17T21:31:45.196Z"},
            "herbal-medicine": {id: "herbal-medicine", name: "Herbal Medicine", description: "Growing and using medicinal plants for natural health remedies.", slug: "herbal-medicine", createdAt: "2025-07-17T21:31:45.441Z"},
            "homestead-security": {id: "homestead-security", name: "Homestead Security", description: "Protecting your property and family in rural settings.", slug: "homestead-security", createdAt: "2025-07-17T21:31:45.604Z"},
            "livestock-management": {id: "livestock-management", name: "Livestock Management", description: "Caring for farm animals in sustainable and humane ways.", slug: "livestock-management", createdAt: "2025-07-17T21:31:45.401Z"},
            "off-grid-water-systems": {id: "off-grid-water-systems", name: "Off-Grid Water Systems", description: "Independent water solutions for remote homesteads.", slug: "off-grid-water-systems", createdAt: "2025-07-17T21:31:45.563Z"},
            "organic-gardening": {id: "organic-gardening", name: "Organic Gardening", description: "Growing fruits and vegetables without synthetic pesticides.", slug: "organic-gardening", createdAt: "2025-07-17T21:31:45.018Z"},
            "permaculture-design": {id: "permaculture-design", name: "Permaculture Design", description: "Sustainable land management principles.", slug: "permaculture-design", createdAt: "2025-07-17T21:31:45.156Z"},
            "raising-chickens": {id: "raising-chickens", name: "Raising Chickens", description: "Complete guide to backyard chicken farming.", slug: "raising-chickens", createdAt: "2025-07-17T21:31:45.114Z"},
            "soil-building-in-arid-climates": {id: "soil-building-in-arid-climates", name: "Soil Building in Arid Climates", description: "Improving soil health in desert environments.", slug: "soil-building-in-arid-climates", createdAt: "2025-07-17T21:31:45.522Z"},
            "solar-energy": {id: "solar-energy", name: "Solar Energy", description: "Harness Arizona's abundant sunshine with solar power systems.", slug: "solar-energy", createdAt: "2025-07-17T21:31:45.278Z"},
            "water-harvesting": {id: "water-harvesting", name: "Water Harvesting", description: "Essential techniques for collecting and storing water in arid climates.", slug: "water-harvesting", createdAt: "2025-07-17T21:31:45.237Z"}
          };
          
          const foundTopic = topicData[slug];
          console.log('Mock SQL: Found topic:', foundTopic);
          return foundTopic ? [foundTopic] : [];
        }
        
        if (query.includes('SELECT * FROM topics')) {
          // Return all actual topics
          return [
            {id: "beekeeping", name: "Beekeeping", description: "Managing honey bee colonies for pollination and honey production.", slug: "beekeeping", createdAt: "2025-07-17T21:31:45.359Z"},
            {id: "composting", name: "Composting", description: "Creating nutrient-rich soil amendments from organic waste.", slug: "composting", createdAt: "2025-07-17T21:31:45.319Z"},
            {id: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential skills for maintaining and repairing your homestead.", slug: "diy-home-maintenance", createdAt: "2025-07-17T21:31:45.481Z"},
            {id: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your harvest.", slug: "food-preservation", createdAt: "2025-07-17T21:31:45.196Z"},
            {id: "herbal-medicine", name: "Herbal Medicine", description: "Growing and using medicinal plants for natural health remedies.", slug: "herbal-medicine", createdAt: "2025-07-17T21:31:45.441Z"},
            {id: "homestead-security", name: "Homestead Security", description: "Protecting your property and family in rural settings.", slug: "homestead-security", createdAt: "2025-07-17T21:31:45.604Z"},
            {id: "livestock-management", name: "Livestock Management", description: "Caring for farm animals in sustainable and humane ways.", slug: "livestock-management", createdAt: "2025-07-17T21:31:45.401Z"},
            {id: "off-grid-water-systems", name: "Off-Grid Water Systems", description: "Independent water solutions for remote homesteads.", slug: "off-grid-water-systems", createdAt: "2025-07-17T21:31:45.563Z"},
            {id: "organic-gardening", name: "Organic Gardening", description: "Growing fruits and vegetables without synthetic pesticides.", slug: "organic-gardening", createdAt: "2025-07-17T21:31:45.018Z"},
            {id: "permaculture-design", name: "Permaculture Design", description: "Sustainable land management principles.", slug: "permaculture-design", createdAt: "2025-07-17T21:31:45.156Z"},
            {id: "raising-chickens", name: "Raising Chickens", description: "Complete guide to backyard chicken farming.", slug: "raising-chickens", createdAt: "2025-07-17T21:31:45.114Z"},
            {id: "soil-building-in-arid-climates", name: "Soil Building in Arid Climates", description: "Improving soil health in desert environments.", slug: "soil-building-in-arid-climates", createdAt: "2025-07-17T21:31:45.522Z"},
            {id: "solar-energy", name: "Solar Energy", description: "Harness Arizona's abundant sunshine with solar power systems.", slug: "solar-energy", createdAt: "2025-07-17T21:31:45.278Z"},
            {id: "water-harvesting", name: "Water Harvesting", description: "Essential techniques for collecting and storing water in arid climates.", slug: "water-harvesting", createdAt: "2025-07-17T21:31:45.237Z"}
          ];
        }
        
        if (query.includes('SELECT v.* FROM youtube_videos')) {
          // Return sample videos to test topic pages
          const topicSlug = values[0]; // First parameter is the topic slug
          return [
            {
              id: `${topicSlug}-video-1`,
              title: `Sample ${topicSlug.replace(/-/g, ' ')} Video 1`,
              description: `Learn about ${topicSlug.replace(/-/g, ' ')} with this informative video.`,
              thumbnailUrl: `https://picsum.photos/480/360?random=${topicSlug}-1`,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              channelTitle: "Homestead Expert",
              viewCount: 15000,
              likeCount: 1200,
              publishedAt: "2024-01-15T00:00:00Z",
              duration: "PT10M30S",
              popularityScore: 95.5,
              topicId: topicSlug,
              createdAt: "2024-01-15T00:00:00Z",
              updatedAt: "2024-01-15T00:00:00Z"
            },
            {
              id: `${topicSlug}-video-2`, 
              title: `Advanced ${topicSlug.replace(/-/g, ' ')} Techniques`,
              description: `Master advanced techniques for ${topicSlug.replace(/-/g, ' ')}.`,
              thumbnailUrl: `https://picsum.photos/480/360?random=${topicSlug}-2`,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              channelTitle: "Pro Homesteader",
              viewCount: 22000,
              likeCount: 1800,
              publishedAt: "2024-02-10T00:00:00Z", 
              duration: "PT15M45S",
              popularityScore: 88.2,
              topicId: topicSlug,
              createdAt: "2024-02-10T00:00:00Z",
              updatedAt: "2024-02-10T00:00:00Z"
            }
          ];
        }

        // Handle mock video lookup for fallback
        if (query.includes('SELECT * FROM youtube_videos WHERE id')) {
          const videoId = values[0];
          console.log('Mock SQL: Looking for video with ID:', videoId);
          // Return a mock video for testing
          return [{
            id: videoId,
            title: "Sample Homesteading Video",
            description: "This is a sample video for testing the video player functionality.",
            thumbnailUrl: `https://picsum.photos/480/360?random=${videoId}`,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            channelTitle: "Homestead Expert",
            viewCount: 15000,
            likeCount: 1200,
            publishedAt: "2024-01-15T00:00:00Z",
            duration: "PT10M30S",
            popularityScore: 95.5,
            topicId: "beekeeping",
            createdAt: "2024-01-15T00:00:00Z",
            updatedAt: "2024-01-15T00:00:00Z"
          }];
        }
        
        return [];
      };
    }

    // Handle individual video endpoint: /api/video/VIDEO_ID
    if (pathSegments[0] === 'video' && pathSegments[1]) {
      const videoId = pathSegments[1];
      console.log(`Video endpoint called for ID: ${videoId}`);
      try {
        const result = await sql`SELECT * FROM youtube_videos WHERE id = ${videoId}`;
        if (result.length === 0) {
          return res.status(404).json({ message: "Video not found" });
        }
        return res.json(result[0]);
      } catch (error) {
        console.error('Error fetching individual video:', error);
        return res.status(500).json({ message: "Failed to fetch video" });
      }
    }
    
    // Route: /api/topics/slug/videos - Get videos for topic
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      const limit = parseInt(query.get('limit')) || 12;
      
      console.log(`Videos endpoint called for slug: ${slug}`);
      
      try {
        // Check if we're in mock mode (database connection failed)
        if (typeof sql === 'function' && sql.toString().includes('topicData')) {
          console.log('Mock mode detected - using YouTube API directly');
          
          // Use YouTube API directly since database is in mock mode
          if (!process.env.YOUTUBE_API_KEY) {
            console.error('YOUTUBE_API_KEY not found');
            return res.status(500).json({ message: "YouTube API key not configured" });
          }
          
          const { YouTubeService } = await import('./youtubeService.js');
          const youtubeService = new YouTubeService();
          
          const searchTerm = slug.replace(/-/g, ' ');
          const videos = await youtubeService.searchVideos(searchTerm, limit);
          
          console.log(`Fetched ${videos.length} videos from YouTube API for ${searchTerm}`);
          return res.status(200).json(videos);
        }
        
        // Try database first (real connection)
        const result = await sql`
          SELECT v.* FROM youtube_videos v
          INNER JOIN topics t ON v.topic_id = t.id
          WHERE t.slug = ${slug}
          ORDER BY v.popularity_score DESC
          LIMIT ${limit}
        `;
        
        if (result.length > 0) {
          console.log(`Found ${result.length} videos in database for ${slug}`);
          return res.status(200).json(result);
        }
        
        // If no videos in database, fetch from YouTube API
        console.log(`No videos in database for ${slug}, fetching from YouTube API`);
        if (!process.env.YOUTUBE_API_KEY) {
          console.error('YOUTUBE_API_KEY not found');
          return res.status(500).json({ message: "YouTube API key not configured" });
        }
        
        const { YouTubeService } = await import('./youtubeService.js');
        const youtubeService = new YouTubeService();
        
        const searchTerm = slug.replace(/-/g, ' ');
        const videos = await youtubeService.searchVideos(searchTerm, limit);
        
        console.log(`Fetched ${videos.length} videos from YouTube API for ${searchTerm}`);
        return res.status(200).json(videos);
        
      } catch (videoError) {
        console.error('Error in videos endpoint:', videoError.message);
        return res.status(500).json({ 
          message: "Error fetching videos", 
          error: videoError.message 
        });
      }
    }

    // Route: /api/topics/slug - Get single topic by slug
    if (pathSegments.length === 2 && pathSegments[0] === 'topics') {
      const slug = pathSegments[1];
      console.log(`Single topic endpoint called for slug: ${slug}`);
      
      const result = await sql`SELECT * FROM topics WHERE slug = ${slug}`;
      if (result.length === 0) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(result[0]);
    }

    // Route: /api/topics or /api - Get all topics
    if ((urlPath === '/api' || urlPath === '/api/topics') && !query.get('action')) {
      const result = await sql`SELECT * FROM topics ORDER BY name`;
      return res.status(200).json(result);
    }

    // Route: /api?action=videos&slug=X - Get videos for topic
    if (query.get('action') === 'videos') {
      const slug = query.get('slug');
      const limit = parseInt(query.get('limit')) || 12;
      
      if (!slug) {
        return res.status(400).json({ message: "Topic slug is required" });
      }
      
      try {
        // Try to get videos from database first
        const result = await sql`
          SELECT v.* FROM youtube_videos v
          INNER JOIN topics t ON v.topic_id = t.id
          WHERE t.slug = ${slug}
          ORDER BY v.popularity_score DESC
          LIMIT ${limit}
        `;
        
        if (result.length > 0) {
          console.log(`Found ${result.length} videos in database for ${slug}`);
          return res.status(200).json(result);
        }
        
        // If no videos in database, fetch from YouTube API
        console.log(`No videos in database for ${slug}, fetching from YouTube API`);
        if (!process.env.YOUTUBE_API_KEY) {
          console.error('YOUTUBE_API_KEY not found');
          return res.status(500).json({ message: "YouTube API key not configured" });
        }
        
        // Import and use YouTube service
        const { YouTubeService } = await import('./youtubeService.js');
        const youtubeService = new YouTubeService();
        
        // Convert slug to search term
        const searchTerm = slug.replace(/-/g, ' ');
        const videos = await youtubeService.searchVideos(searchTerm, limit);
        
        console.log(`Fetched ${videos.length} videos from YouTube for ${searchTerm}`);
        console.log('Sample video titles:', videos.slice(0, 2).map(v => v.title));
        
        // Store videos in database for future use
        if (videos.length > 0) {
          for (const video of videos) {
            try {
              await sql`
                INSERT INTO youtube_videos (
                  id, topic_id, title, description, thumbnail_url, video_url,
                  channel_id, channel_title, published_at, like_count, view_count,
                  duration, is_arizona_specific, relevance_score, popularity_score,
                  ranking, last_updated, created_at
                ) VALUES (
                  ${video.id}, ${slug}, ${video.title}, ${video.description},
                  ${video.thumbnailUrl}, ${video.videoUrl}, ${video.channelId},
                  ${video.channelTitle}, ${video.publishedAt}, ${video.likeCount},
                  ${video.viewCount}, ${video.duration}, ${video.isArizonaSpecific},
                  ${video.relevanceScore}, ${video.popularityScore}, ${video.ranking},
                  ${video.lastUpdated}, ${video.createdAt}
                )
                ON CONFLICT (id) DO UPDATE SET
                  like_count = EXCLUDED.like_count,
                  view_count = EXCLUDED.view_count,
                  popularity_score = EXCLUDED.popularity_score,
                  last_updated = EXCLUDED.last_updated
              `;
            } catch (insertError) {
              console.error('Error inserting video:', insertError.message);
            }
          }
        }
        
        return res.status(200).json(videos);
        
      } catch (dbError) {
        console.error('Database error in videos endpoint:', dbError.message);
        return res.status(500).json({ 
          message: "Database error", 
          error: dbError.message 
        });
      }
    }

    // Default route - return all topics (for backward compatibility)
    const result = await sql`SELECT * FROM topics ORDER BY name`;
    return res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message,
      stack: error.stack,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
}
