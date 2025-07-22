// Restore original working API - don't modify database connections
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const urlPath = url.split('?')[0];
  const query = new URLSearchParams(url.split('?')[1] || '');
  
  console.log('API Request:', { url, urlPath, method: req.method });
  
  // Parse URL path to determine endpoint
  const pathSegments = urlPath.replace('/api', '').split('/').filter(Boolean);
  console.log('Path segments:', pathSegments);

  // Use original mock data approach that was working
  const sql = async (strings, ...values) => {
    const queryStr = strings[0];
    
    if (queryStr.includes('SELECT * FROM topics WHERE slug')) {
      const slug = values[0];
      console.log('Mock SQL: Looking for topic with slug:', slug);
      
      const topicData = {
        "beekeeping": {id: "beekeeping", name: "Beekeeping", description: "Managing honey bee colonies for pollination and honey production.", slug: "beekeeping", createdAt: "2025-07-17T21:31:45.359Z"},
        "composting": {id: "composting", name: "Composting", description: "Creating nutrient-rich soil amendments from organic waste.", slug: "composting", createdAt: "2025-07-17T21:31:45.319Z"},
        "diy-home-maintenance": {id: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential skills for maintaining and repairing your homestead.", slug: "diy-home-maintenance", createdAt: "2025-07-17T21:31:45.481Z"},
        "food-preservation": {id: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your harvest.", slug: "food-preservation", createdAt: "2025-07-17T21:31:45.196Z"},
        "herbal-medicine": {id: "herbal-medicine", name: "Herbal Medicine", description: "Growing and using medicinal plants for natural health remedions.", slug: "herbal-medicine", createdAt: "2025-07-17T21:31:45.441Z"},
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
      return foundTopic ? [foundTopic] : [];
    }
    
    if (queryStr.includes('SELECT * FROM topics')) {
      // Return all topics
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
    
    // Handle video queries with sample data
    if (queryStr.includes('youtube_videos')) {
      const topicId = values[0] || 'general';
      // Return sample videos for the topic
      return [
        {
          id: "jeFxOUZreXI",
          title: "HOW TO START BEEKEEPING for the Absolute Beginner",
          description: "Want to become a beekeeper? This is an introduction to beekeeping...",
          thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg",
          channelTitle: "Beekeeping Expert",
          viewCount: 25000,
          likeCount: 1800,
          publishedAt: "2024-01-15T00:00:00Z",
          topicId: topicId
        },
        {
          id: "nZTQIiJiFn4",
          title: "Our Beehive SWARMED! Too Much HONEY!",
          description: "Our beehive was almost lost when the bees swarmed...",
          thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg",
          channelTitle: "Homestead Life",
          viewCount: 15000,
          likeCount: 1200,
          publishedAt: "2024-02-01T00:00:00Z",
          topicId: topicId
        }
      ];
    }
    
    return [];
  };

  try {
    // Route: /api/topics - Get all topics
    if (pathSegments.length === 1 && pathSegments[0] === 'topics') {
      console.log('Topics endpoint called');
      const result = await sql`SELECT * FROM topics ORDER BY name`;
      return res.status(200).json(result);
    }
    
    // Route: /api/topics/slug - Get single topic
    if (pathSegments.length === 2 && pathSegments[0] === 'topics') {
      const slug = pathSegments[1];
      console.log(`Topic endpoint called for slug: ${slug}`);
      const result = await sql`SELECT * FROM topics WHERE slug = ${slug}`;
      if (result.length === 0) {
        return res.status(404).json({ message: "Topic not found" });
      }
      return res.status(200).json(result[0]);
    }
    
    // Route: /api/topics/slug/videos - Get videos for topic
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      console.log(`Videos endpoint called for slug: ${slug}`);
      const result = await sql`SELECT * FROM youtube_videos WHERE topicId = ${slug}`;
      return res.status(200).json(result);
    }
    
    return res.status(404).json({ message: "API endpoint not found" });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message
    });
  }
}
