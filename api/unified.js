// Production API handler - stable working version before ranking text
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

export default function handler(req, res) {
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
    console.log(`[API] ${method} ${url}`);

    // Route: /api/topics - Get all topics
    if (pathSegments.length === 1 && pathSegments[0] === 'topics') {
      return res.status(200).json(topicsData);
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

    // Route: /api/topics/slug/videos - Get videos for topic
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      
      // Mock video data that was working before
      const sampleVideos = [
        {
          id: "nZTQIiJiFn4",
          title: "Our Beehive SWARMED! Too Much HONEY!",
          description: "Our beehive was almost lost when the bees swarmed to find more space to live. The hive was totally full of honey!",
          thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg",
          channelTitle: "Self Sufficient Me",
          publishedAt: "2024-10-15T00:00:00Z",
          viewCount: 25843,
          likeCount: 1203,
          topicId: slug
        },
        {
          id: "ileODNqkqwM",
          title: "Part 5 | Debt free, off-grid home build — Concrete block walls!",
          description: "Building concrete block walls for off-grid homestead construction on a budget.",
          thumbnailUrl: "https://i.ytimg.com/vi/ileODNqkqwM/mqdefault.jpg",
          channelTitle: "Off Grid Life",
          publishedAt: "2024-10-10T00:00:00Z",
          viewCount: 34562,
          likeCount: 987,
          topicId: slug
        },
        {
          id: "B6qk0IbCC5U",
          title: "Make $10,000 per acre with Pastured Pigs | Joel Salatin",
          description: "Joel Salatin demonstrates profitable pastured pig systems for small homesteads.",
          thumbnailUrl: "https://i.ytimg.com/vi/B6qk0IbCC5U/mqdefault.jpg",
          channelTitle: "Farm Like A Lunatic with Joel Salatin",
          publishedAt: "2024-10-08T00:00:00Z",
          viewCount: 45672,
          likeCount: 1534,
          topicId: slug
        }
      ];

      return res.status(200).json(sampleVideos);
    }

    // Route: /api/video/videoId - Get single video
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      
      const video = {
        id: videoId,
        title: "Homesteading Tutorial Video",
        description: "Learn essential homesteading techniques with this comprehensive guide. Perfect for beginners and experienced homesteaders alike.",
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: "Homesteading Guide",
        publishedAt: "2024-10-15T00:00:00Z",
        viewCount: 15000,
        likeCount: 500,
        topicId: "beekeeping"
      };
      
      return res.status(200).json(video);
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
