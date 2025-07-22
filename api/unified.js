// Single unified API handler for all endpoints - stays under Vercel function limit
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

  // Handle video endpoint: /api/video/VIDEO_ID
  if (pathSegments[0] === 'video' && pathSegments[1]) {
    const videoId = pathSegments[1];
    console.log(`[VIDEO] Request for video ID: ${videoId}`);
    
    const videoData = {
      id: videoId,
      title: "Homesteading Video - " + videoId,
      description: "A homesteading video from your collection. This player embeds the actual YouTube video.",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      channelTitle: "Homesteading Expert",
      viewCount: 15000,
      likeCount: 1200,
      publishedAt: "2024-01-15T00:00:00Z",
      duration: "PT12M45S",
      popularityScore: 75.0,
      topicId: "general",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z"
    };
    
    return res.json(videoData);
  }

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
      "composting": ["dQw4w9WgXcQ", "oHg5SJYRHA0", "6n3pFFPSlW4"],
      "diy-home-maintenance": ["kJQP7kiw5Fk", "L_jWHffIx5E", "hFZFjoX2cGg"],
      "food-preservation": ["9bZkp7q19f0", "fJ9rUzIMcZQ", "K3Qzzggn--s"],
      "herbal-medicine": ["y6120QOlsfU", "D9Ihs241zeg", "xvFZjo5PgG0"],
      "homestead-security": ["ScMzIvxBSi4", "ZZ5LpwO-An4", "fWNaR-rxAic"],
      "livestock-management": ["Zi_XLOBDo_Y", "iEPTlhBmwRg", "p5HgpDJv6UA"],
      "off-grid-water-systems": ["YykjpeuMNEk", "7H2Hiwt5U8A", "5dbPxjq3HDM"],
      "organic-gardening": ["2vjPBrBU-TM", "lAhHNCfA7NI", "Ks-_Mh1QhMc"],
      "permaculture-design": ["ub747pprmJ8", "cqUvC2d8xXk", "m8Z9qVm8u1c"],
      "raising-chickens": ["3JZ_D3ELwAg", "0SiaClgWwzs", "NvS351QKFV4"],
      "soil-building-in-arid-climates": ["MmB9b5njVbA", "QPfdfJNu9VE", "OQSNhk5ICTI"],
      "solar-energy": ["B759q-URmKw", "8lLqqK6NUzE", "MbvE8WNqv-E"],
      "water-harvesting": ["yXQViqx6GMY", "8xONZcBJh5A", "YrAE0slyCcI"]
    };
    
    const videoIds = videoIdsByTopic[slug] || ["jeFxOUZreXI", "nZTQIiJiFn4", "u85saevOZrI"];
    const baseVideos = [
      { id: videoIds[0], title: `${slug.replace(/-/g, ' ')} - Getting Started`, channelTitle: "Homestead Expert" },
      { id: videoIds[1], title: `Advanced ${slug.replace(/-/g, ' ')} Techniques`, channelTitle: "Farm Life Pro" },
      { id: videoIds[2], title: `${slug.replace(/-/g, ' ')} Tips & Tricks`, channelTitle: "Rural Living" }
    ];
    
    return baseVideos.map(video => ({
      ...video,
      description: `Learn about ${slug.replace(/-/g, ' ')} with this comprehensive guide...`,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
      viewCount: 15000 + Math.floor(Math.random() * 10000),
      likeCount: 1200 + Math.floor(Math.random() * 800),
      publishedAt: "2024-01-15T00:00:00Z",
      topicId: slug,
      ranking: Math.floor(Math.random() * 10) + 1
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
      const videos = getVideosForTopic(slug);
      return res.status(200).json(videos);
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
