module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const ws = require("ws");
    
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    res.status(200).json({
      success: true,
      currentTime: result.rows[0].current_time,
      availableTables: tables,
      hasTopicsTable: tables.includes('topics'),
      hasVideosTable: tables.includes('youtube_videos')
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
