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
  console.log(`Video endpoint called for ID: ${videoId}`);
  
  // Create mock video data
  const mockVideo = {
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
  };

  // Try to connect to database and fetch real data
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`SELECT * FROM youtube_videos WHERE id = ${videoId}`;
    
    if (result.length > 0) {
      console.log(`Found video in database: ${result[0].title}`);
      return res.json(result[0]);
    } else {
      console.log(`Video ${videoId} not found in database`);
      
      // Try to fetch video from any topic's video list as fallback
      const allVideos = await sql`SELECT * FROM youtube_videos LIMIT 100`;
      const randomVideo = allVideos.find(v => v.id === videoId) || 
                         allVideos[Math.floor(Math.random() * allVideos.length)];
      
      if (randomVideo) {
        console.log(`Using fallback video: ${randomVideo.title}`);
        return res.json(randomVideo);
      }
    }
  } catch (error) {
    console.error('Database error, using fallback:', error.message);
  }
  
  // Return mock video as fallback
  return res.json(mockVideo);
}
