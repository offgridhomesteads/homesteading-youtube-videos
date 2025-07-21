// Single API handler for all routes
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
  
  try {
    // Route: /api/topics
    if (url === '/api/topics' || url === '/api/topics/') {
      const staticTopics = [
        {
          id: "organic-gardening",
          name: "Organic Gardening", 
          description: "Growing fruits and vegetables without synthetic pesticides.",
          slug: "organic-gardening",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "raising-chickens",
          name: "Raising Chickens",
          description: "Complete guide to backyard chicken farming.", 
          slug: "raising-chickens",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "permaculture-design",
          name: "Permaculture Design",
          description: "Sustainable land management principles.",
          slug: "permaculture-design", 
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "food-preservation", 
          name: "Food Preservation",
          description: "Traditional and modern methods for preserving your harvest.",
          slug: "food-preservation",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "water-harvesting",
          name: "Water Harvesting", 
          description: "Essential techniques for collecting and storing water in arid climates.",
          slug: "water-harvesting",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "solar-energy",
          name: "Solar Energy",
          description: "Harness Arizona's abundant sunshine with solar power systems.",
          slug: "solar-energy",
          createdAt: "2025-01-01T00:00:00Z", 
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "composting",
          name: "Composting",
          description: "Creating nutrient-rich soil amendments from organic waste.",
          slug: "composting",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "beekeeping", 
          name: "Beekeeping",
          description: "Managing honey bee colonies for pollination and honey production.",
          slug: "beekeeping",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "livestock-management",
          name: "Livestock Management",
          description: "Caring for farm animals in sustainable and humane ways.",
          slug: "livestock-management",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "herbal-medicine",
          name: "Herbal Medicine", 
          description: "Growing and using medicinal plants for natural health remedies.",
          slug: "herbal-medicine",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "diy-home-maintenance",
          name: "DIY Home Maintenance",
          description: "Essential skills for maintaining and repairing your homestead.",
          slug: "diy-home-maintenance",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "soil-building-in-arid-climates",
          name: "Soil Building in Arid Climates",
          description: "Improving soil health in desert environments.",
          slug: "soil-building-in-arid-climates",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "off-grid-water-systems", 
          name: "Off-Grid Water Systems",
          description: "Independent water solutions for remote homesteads.",
          slug: "off-grid-water-systems",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: "homestead-security",
          name: "Homestead Security",
          description: "Protecting your property and family in rural settings.",
          slug: "homestead-security",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        }
      ];
      
      return res.status(200).json(staticTopics);
    }
    
    // Route: /api/topics/[slug]/videos - return empty array for now
    const videoMatch = url.match(/^\/api\/topics\/([^\/]+)\/videos/);
    if (videoMatch) {
      return res.status(200).json([]);
    }
    
    // Default response
    res.status(404).json({ message: 'API endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
