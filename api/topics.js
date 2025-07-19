const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Use direct query instead of drizzle execute for better debugging
    const result = await pool.query(`
      SELECT id, name, description, slug, created_at, updated_at
      FROM topics
      ORDER BY name
    `);
    
    const topics = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      slug: row.slug,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.status(200).json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch topics',
      error: error.message,
      type: error.constructor.name
    });
  }
}
