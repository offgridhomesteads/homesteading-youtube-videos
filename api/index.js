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
      
      // Fallback to basic fetch-based SQL
      sql = async (strings, ...values) => {
        // Simple mock for now to test deployment
        if (strings[0].includes('SELECT * FROM topics')) {
          return [
            { id: 'test', name: 'Test Topic', slug: 'test', description: 'Test description' }
          ];
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
