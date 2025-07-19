module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const staticTopics = [
    {
      id: "organic-gardening",
      name: "Organic Gardening",
      description: "Growing fruits and vegetables without synthetic pesticides.",
      slug: "organic-gardening",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    },
    {
      id: "raising-chickens",
      name: "Raising Chickens",
      description: "Complete guide to backyard chicken farming.",
      slug: "raising-chickens",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    },
    {
      id: "beekeeping",
      name: "Beekeeping",
      description: "Managing honey bee colonies for pollination and honey production.",
      slug: "beekeeping",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    }
  ];

  res.status(200).json(staticTopics);
};
