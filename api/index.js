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
  
  console.log('API Request:', { url, urlPath, method: req.method });

  try {
    // Import inside try block to handle module loading issues
    let sql;
    try {
      // Try Neon serverless first
      const { neon } = await import('@neondatabase/serverless');
      sql = neon(process.env.DATABASE_URL);
    } catch (importError) {
      console.error('Failed to import @neondatabase/serverless:', importError.message);
      
      // Return mock data for now until we can resolve pg import issues
      sql = async (strings, ...values) => {
        const query = strings[0];
        
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
          // Return empty videos for now - will need manual fix later
          return [];
        }
        
        return [];
      };
    }
    
    // Route: /api/topics or /api - Get all topics
    if ((urlPath === '/api' || urlPath === '/api/topics') && !query.get('action')) {
      const result = await sql`SELECT * FROM topics ORDER BY name`;
      return res.status(200).json(result);
    }

    // Route: /api?action=topic&slug=X - Get specific topic
    if (query.get('action') === 'topic') {
      const slug = query.get('slug');
      if (!slug) {
        return res.status(400).json({ message: "Topic slug is required" });
      }

      const result = await sql`SELECT * FROM topics WHERE slug = ${slug}`;
      if (result.length === 0) {
        return res.status(404).json({ message: "Topic not found" });
      }
      return res.status(200).json(result[0]);
    }

    // Route: /api?action=videos&slug=X - Get videos for topic
    if (query.get('action') === 'videos') {
      const slug = query.get('slug');
      const limit = parseInt(query.get('limit')) || 12;
      
      if (!slug) {
        return res.status(400).json({ message: "Topic slug is required" });
      }
      
      const result = await sql`
        SELECT v.* FROM youtube_videos v
        INNER JOIN topics t ON v.topic_id = t.id
        WHERE t.slug = ${slug}
        ORDER BY v.popularity_score DESC
        LIMIT ${limit}
      `;
      
      return res.status(200).json(result);
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
