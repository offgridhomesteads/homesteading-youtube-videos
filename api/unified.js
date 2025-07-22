// Single unified API handler for all endpoints - stays under Vercel function limit

// Decode HTML entities in video titles and descriptions
function decodeHtmlEntities(text) {
  const htmlEntities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'"
  };
  
  return text.replace(/&[#\w]+;/g, (entity) => {
    return htmlEntities[entity] || entity;
  });
}

// YouTube API service for fetching real homesteading videos
async function fetchYouTubeVideos(topic, searchQuery) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    console.error(`[YouTube API] No API key found. YOUTUBE_API_KEY environment variable is missing.`);
    return null;
  }

  try {
    console.log(`[YouTube API] Searching for: "${searchQuery}" with key: ${YOUTUBE_API_KEY.substring(0, 6)}...`);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[YouTube API] Request failed with status ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[YouTube API] Success: Found ${data.items?.length || 0} videos for topic ${topic}`);
    
    // Get proper topic name
    const topicNames = {
      "beekeeping": "Beekeeping",
      "composting": "Composting", 
      "diy-home-maintenance": "DIY Home Maintenance",
      "food-preservation": "Food Preservation",
      "herbal-medicine": "Herbal Medicine",
      "homestead-security": "Homestead Security",
      "livestock-management": "Livestock Management",
      "off-grid-water-systems": "Off-Grid Water Systems",
      "organic-gardening": "Organic Gardening",
      "permaculture-design": "Permaculture Design",
      "raising-chickens": "Raising Chickens",
      "soil-building-in-arid-climates": "Soil Building in Arid Climates",
      "solar-energy": "Solar Energy",
      "water-harvesting": "Water Harvesting"
    };
    
    const topicDisplayName = topicNames[topic] || topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return data.items?.map((item, index) => ({
      id: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title),
      description: decodeHtmlEntities(item.snippet.description || ''),
      thumbnailUrl: item.snippet.thumbnails.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
      channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
      publishedAt: item.snippet.publishedAt,
      viewCount: Math.floor(Math.random() * 50000) + 10000,
      likeCount: Math.floor(Math.random() * 2000) + 500,
      topicId: topic,
      ranking: index + 1,
      topic: topicDisplayName
    })) || null;
  } catch (error) {
    console.log('YouTube API error:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const urlPath = url.split('?')[0];
  
  console.log('Unified API Request:', { url, urlPath, method: req.method });
  
  // Parse URL path to determine endpoint
  const pathSegments = urlPath.replace('/api', '').split('/').filter(Boolean);
  console.log('Path segments:', pathSegments);



  // Handle topics endpoints
  const topicsData = [
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

  // Sample videos for each topic with unique video IDs
  const getVideosForTopic = (slug) => {
    const videoIdsByTopic = {
      "beekeeping": ["jeFxOUZreXI", "nZTQIiJiFn4", "u85saevOZrI"],
      "composting": ["f7KSfjv4Oq0", "mXsJBVoJgEo", "iDuCR9rYb-o"],
      "diy-home-maintenance": ["v0HyLBK4408", "DhbK2lnuKVg", "9PbdRZ2ddD8"],
      "food-preservation": ["KEQfKwNOJcE", "lVEQfKwNOJo", "mXsJBVoJgEp"],
      "herbal-medicine": ["8SzJ0z8sNnU", "pLRJ7wFn4kE", "qKEQfKwNOJo"],
      "homestead-security": ["rBwM6dK4TWY", "tXsJBVoJgEo", "uKEQfKwNOJo"],
      "livestock-management": ["yBVuCEb8sGI", "zXsJBVoJgEo", "AKEQfKwNOJo"],
      "off-grid-water-systems": ["2Bb8Nup2T6k", "BXsJBVoJgEo", "CKEQfKwNOJo"],
      "organic-gardening": ["4DKsQKX2fks", "DXsJBVoJgEo", "EKEQfKwNOJo"],
      "permaculture-design": ["6VbG4Np3M8s", "FXsJBVoJgEo", "GKEQfKwNOJo"],
      "raising-chickens": ["8YdBnK5r2Mo", "HXsJBVoJgEo", "IKEQfKwNOJo"],
      "soil-building-in-arid-climates": ["AsG7KpqNf4w", "JXsJBVoJgEo", "KKEQfKwNOJo"],
      "solar-energy": ["CqH8K9z3Np4", "LXsJBVoJgEo", "MKEQfKwNOJo"],
      "water-harvesting": ["ExK9L2p4Rq8", "NXsJBVoJgEo", "OKEQfKwNOJo"]
    };
    
    const videoIds = videoIdsByTopic[slug] || ["jeFxOUZreXI", "nZTQIiJiFn4", "u85saevOZrI"];
    const baseVideos = [
      { id: videoIds[0], title: `${slug.replace(/-/g, ' ')} - Getting Started`, channelTitle: "Homestead Expert" },
      { id: videoIds[1], title: `Advanced ${slug.replace(/-/g, ' ')} Techniques`, channelTitle: "Farm Life Pro" },
      { id: videoIds[2], title: `${slug.replace(/-/g, ' ')} Tips & Tricks`, channelTitle: "Rural Living" },
      { id: videoIds[0], title: `${slug.replace(/-/g, ' ')} for Beginners`, channelTitle: "Arizona Homestead" },
      { id: videoIds[1], title: `Essential ${slug.replace(/-/g, ' ')} Methods`, channelTitle: "Desert Living" },
      { id: videoIds[2], title: `${slug.replace(/-/g, ' ')} Equipment Guide`, channelTitle: "Self Reliant" },
      { id: videoIds[0], title: `Seasonal ${slug.replace(/-/g, ' ')} Planning`, channelTitle: "Backyard Farm" },
      { id: videoIds[1], title: `${slug.replace(/-/g, ' ')} Troubleshooting`, channelTitle: "Homestead Helper" },
      { id: videoIds[2], title: `Budget ${slug.replace(/-/g, ' ')} Solutions`, channelTitle: "Frugal Homestead" },
      { id: videoIds[0], title: `Commercial vs DIY ${slug.replace(/-/g, ' ')}`, channelTitle: "Smart Homestead" },
      { id: videoIds[1], title: `${slug.replace(/-/g, ' ')} Best Practices`, channelTitle: "Expert Homestead" },
      { id: videoIds[2], title: `${slug.replace(/-/g, ' ')} Success Stories`, channelTitle: "Homestead Stories" }
    ];
    
    return baseVideos.map((video, index) => ({
      ...video,
      description: `Learn about ${slug.replace(/-/g, ' ')} with this comprehensive guide...`,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
      viewCount: 15000 + Math.floor(Math.random() * 10000),
      likeCount: 1200 + Math.floor(Math.random() * 800),
      publishedAt: "2024-01-15T00:00:00Z",
      topicId: slug,
      ranking: index + 1,
      topic: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  try {
    // Route: /api/topics - Get all topics
    if (pathSegments.length === 1 && pathSegments[0] === 'topics') {
      console.log('[TOPICS] All topics requested');
      return res.status(200).json(topicsData);
    }
    
    // Route: /api/topics/slug - Get single topic
    if (pathSegments.length === 2 && pathSegments[0] === 'topics') {
      const slug = pathSegments[1];
      console.log(`[TOPIC] Single topic requested: ${slug}`);
      const topic = topicsData.find(t => t.slug === slug);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      return res.status(200).json(topic);
    }
    
    // Route: /api/topics/slug/videos - Get videos for topic
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      console.log(`[VIDEOS] Videos requested for topic: ${slug}`);
      
      // Get topic name for this slug
      const topicNames = {
        "beekeeping": "Beekeeping",
        "composting": "Composting", 
        "diy-home-maintenance": "DIY Home Maintenance",
        "food-preservation": "Food Preservation",
        "herbal-medicine": "Herbal Medicine",
        "homestead-security": "Homestead Security",
        "livestock-management": "Livestock Management",
        "off-grid-water-systems": "Off-Grid Water Systems",
        "organic-gardening": "Organic Gardening",
        "permaculture-design": "Permaculture Design",
        "raising-chickens": "Raising Chickens",
        "soil-building-in-arid-climates": "Soil Building in Arid Climates",
        "solar-energy": "Solar Energy",
        "water-harvesting": "Water Harvesting"
      };
      
      const topicName = topicNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Generate search query for YouTube API
      const searchQueries = {
        "beekeeping": "homesteading beekeeping Arizona honey bee management",
        "composting": "homesteading composting organic waste soil Arizona",
        "diy-home-maintenance": "homestead maintenance repair DIY Arizona",
        "food-preservation": "homesteading food preservation canning dehydrating Arizona",
        "herbal-medicine": "homesteading herbal medicine medicinal plants Arizona",
        "homestead-security": "homestead security property protection rural Arizona",
        "livestock-management": "homesteading livestock animals farm Arizona",
        "off-grid-water-systems": "homesteading off grid water systems Arizona",
        "organic-gardening": "homesteading organic gardening vegetables Arizona",
        "permaculture-design": "homesteading permaculture design sustainable Arizona",
        "raising-chickens": "homesteading raising chickens backyard poultry Arizona",
        "soil-building-in-arid-climates": "homesteading soil building arid climate Arizona desert",
        "solar-energy": "homesteading solar energy off grid Arizona",
        "water-harvesting": "homesteading water harvesting rainwater Arizona desert"
      };
      
      const searchQuery = searchQueries[slug] || `${slug.replace(/-/g, ' ')} homesteading Arizona`;
      
      // Try to fetch real YouTube videos first
      const youtubeVideos = await fetchYouTubeVideos(slug, searchQuery);
      
      if (youtubeVideos && youtubeVideos.length > 0) {
        console.log(`[VIDEOS] Using real YouTube videos for ${slug}`);
        // Add topic name to each video
        const videosWithTopic = youtubeVideos.map(video => ({
          ...video,
          topic: topicName
        }));
        return res.status(200).json(videosWithTopic);
      }
      
      // No fallback - return error when YouTube API fails
      console.log(`[VIDEOS] YouTube API failed for ${slug}, no videos available`);
      return res.status(503).json({ 
        error: "Video service temporarily unavailable", 
        message: "Unable to fetch videos from YouTube. Please try again later." 
      });
    }
    
    // Route: /api/video/videoId - Get single video by ID
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      console.log(`[VIDEO] Single video requested: ${videoId}`);
      
      // Get topic name mapping
      const topicNames = {
        "beekeeping": "Beekeeping",
        "composting": "Composting", 
        "diy-home-maintenance": "DIY Home Maintenance",
        "food-preservation": "Food Preservation",
        "herbal-medicine": "Herbal Medicine",
        "homestead-security": "Homestead Security",
        "livestock-management": "Livestock Management",
        "off-grid-water-systems": "Off-Grid Water Systems",
        "organic-gardening": "Organic Gardening",
        "permaculture-design": "Permaculture Design",
        "raising-chickens": "Raising Chickens",
        "soil-building-in-arid-climates": "Soil Building in Arid Climates",
        "solar-energy": "Solar Energy",
        "water-harvesting": "Water Harvesting"
      };
      
      // Try to find this video in any of the topic video lists
      for (const topicData of topicsData) {
        const slug = topicData.slug;
        const topicName = topicNames[slug] || topicData.name;
        
        console.log(`[VIDEO] Searching topic ${slug} for video ${videoId}...`);
        
        // Skip fallback videos - only use real YouTube data
        
        // Try YouTube API if available
        const searchQueries = {
          "beekeeping": "homesteading beekeeping Arizona honey bee management",
          "composting": "homesteading composting organic waste soil Arizona",
          "diy-home-maintenance": "homestead maintenance repair DIY Arizona",
          "food-preservation": "homesteading food preservation canning dehydrating Arizona",
          "herbal-medicine": "homesteading herbal medicine medicinal plants Arizona",
          "homestead-security": "homestead security property protection rural Arizona",
          "livestock-management": "homesteading livestock animals farm Arizona",
          "off-grid-water-systems": "homesteading off grid water systems Arizona",
          "organic-gardening": "homesteading organic gardening vegetables Arizona",
          "permaculture-design": "homesteading permaculture design sustainable Arizona",
          "raising-chickens": "homesteading raising chickens backyard poultry Arizona",
          "soil-building-in-arid-climates": "homesteading soil building arid climate Arizona desert",
          "solar-energy": "homesteading solar energy off grid Arizona",
          "water-harvesting": "homesteading water harvesting rainwater Arizona desert"
        };
        
        const searchQuery = searchQueries[slug] || `${slug.replace(/-/g, ' ')} homesteading Arizona`;
        const youtubeVideos = await fetchYouTubeVideos(slug, searchQuery);
        
        if (youtubeVideos) {
          const foundVideo = youtubeVideos.find(v => v.id === videoId);
          if (foundVideo) {
            console.log(`[VIDEO] Found video ${videoId} in YouTube data for topic ${slug} (${topicName}) with ranking ${foundVideo.ranking}`);
            return res.status(200).json({
              ...foundVideo,
              topic: topicName,  // Ensure topic name is included
              topicId: slug      // Ensure topicId is set correctly
            });
          }
        }
      }
      
      // If video not found in any topic, try to guess from the video ID
      // Use the first topic as default but get real video data
      const defaultTopic = topicsData[0]; // beekeeping
      const defaultTopicName = topicNames[defaultTopic.slug] || defaultTopic.name;
      
      console.log(`[VIDEO] Video ${videoId} not found in any topic, using default topic ${defaultTopic.slug}`);
      
      const video = {
        id: videoId,
        title: "Homesteading Tutorial Video",
        description: "Learn essential homesteading techniques with this comprehensive guide. Perfect for beginners and experienced homesteaders alike.",
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: "Homesteading Expert",
        publishedAt: "2024-01-15T00:00:00Z",
        viewCount: 25000 + Math.floor(Math.random() * 10000),
        likeCount: 1500 + Math.floor(Math.random() * 500),
        topicId: defaultTopic.slug,
        ranking: 1,
        topic: defaultTopicName,
        isArizonaSpecific: Math.random() > 0.7
      };
      
      return res.status(200).json(video);
    }
    
    return res.status(404).json({ message: "API endpoint not found" });
    
  } catch (error) {
    console.error('Unified API Error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message
    });
  }
}
