// Static API route for organic-gardening videos
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const videos = [
      {"id":"7Txv1ndELhM","topicId":"organic-gardening","title":"Organic Gardening Basics for Beginners","description":"Learn the fundamentals of organic gardening","thumbnailUrl":"https://i.ytimg.com/vi/7Txv1ndELhM/mqdefault.jpg","channelId":"UC123","channelTitle":"Garden Channel","publishedAt":"2024-01-15T10:00:00Z","likeCount":1250,"viewCount":25000,"isArizonaSpecific":false,"relevanceScore":0.85,"popularityScore":0.92,"ranking":1,"lastUpdated":"2025-07-17T21:31:45.018Z","createdAt":"2025-07-17T21:31:45.018Z"},
      {"id":"8Uxw2oeEMhN","topicId":"organic-gardening","title":"Desert Organic Gardening Tips","description":"Special techniques for growing organic food in desert climates","thumbnailUrl":"https://i.ytimg.com/vi/8Uxw2oeEMhN/mqdefault.jpg","channelId":"UC456","channelTitle":"Desert Grow","publishedAt":"2024-02-01T14:30:00Z","likeCount":890,"viewCount":18500,"isArizonaSpecific":true,"relevanceScore":0.95,"popularityScore":0.88,"ranking":2,"lastUpdated":"2025-07-17T21:31:45.018Z","createdAt":"2025-07-17T21:31:45.018Z"}
    ];
    return res.status(200).json(videos);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
