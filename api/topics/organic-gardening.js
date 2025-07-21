// Static API route for organic-gardening topic
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const topic = {"id":"organic-gardening","name":"Organic Gardening","description":"Growing fruits and vegetables without synthetic pesticides.","slug":"organic-gardening","createdAt":"2025-07-17T21:31:45.018Z"};
    return res.status(200).json(topic);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
