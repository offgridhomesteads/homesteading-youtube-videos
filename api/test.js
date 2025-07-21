// Simple test endpoint to verify Vercel deployment
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({ 
      message: "API is working",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      hasDatabase: !!process.env.DATABASE_URL,
      databasePrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "not found"
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Test endpoint error",
      error: error.message
    });
  }
}
