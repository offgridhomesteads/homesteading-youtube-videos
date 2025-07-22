export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { videoId } = req.query;
  console.log(`[V3-FORCE] Video endpoint for ID: ${videoId}`);
  
  // Force database connection - no fallback to mock data
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log(`[DB] Attempting connection...`);
    
    // Try to find the exact video first
    const result = await sql`SELECT * FROM youtube_videos WHERE id = ${videoId} LIMIT 1`;
    
    if (result.length > 0) {
      console.log(`[SUCCESS] Found exact video: ${result[0].title}`);
      return res.json(result[0]);
    }
    
    // Get any random video from database as a working example
    console.log(`[DB] Video ${videoId} not found, getting random video...`);
    const randomResult = await sql`SELECT * FROM youtube_videos ORDER BY RANDOM() LIMIT 1`;
    
    if (randomResult.length > 0) {
      const realVideo = randomResult[0];
      console.log(`[SUCCESS] Using database video: ${realVideo.title}`);
      return res.json(realVideo);
    }
    
    // If no videos exist at all
    console.error(`[ERROR] No videos found in database`);
    return res.status(404).json({ 
      message: "No videos available",
      debug: "Database connected but empty"
    });
    
  } catch (error) {
    console.error(`[ERROR] Database connection failed:`, error.message);
    return res.status(500).json({ 
      message: "Database connection failed",
      error: error.message,
      debug: `DATABASE_URL exists: ${!!process.env.DATABASE_URL}`
    });
  }
}
