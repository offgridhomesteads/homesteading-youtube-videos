// Test endpoint using ES6 export
export default async function handler(req, res) {
  try {
    res.status(200).json({ 
      message: "Test endpoint working with ES6",
      timestamp: new Date().toISOString(),
      hasDatabase: !!process.env.DATABASE_URL,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    res.status(500).json({
      message: "Test failed",
      error: error.message
    });
  }
}
