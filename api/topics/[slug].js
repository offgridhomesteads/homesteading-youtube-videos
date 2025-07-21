// Vercel API route for individual topic
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;

  // Mock data for testing
  const TOPICS_DATA = [
    {"id":"organic-gardening","name":"Organic Gardening","description":"Growing fruits and vegetables without synthetic pesticides.","slug":"organic-gardening","createdAt":"2025-07-17T21:31:45.018Z"},
    {"id":"raising-chickens","name":"Raising Chickens","description":"Complete guide to backyard chicken farming.","slug":"raising-chickens","createdAt":"2025-07-17T21:31:45.114Z"},
    {"id":"permaculture-design","name":"Permaculture Design","description":"Sustainable land management principles.","slug":"permaculture-design","createdAt":"2025-07-17T21:31:45.156Z"},
    {"id":"food-preservation","name":"Food Preservation","description":"Traditional and modern methods for preserving your harvest.","slug":"food-preservation","createdAt":"2025-07-17T21:31:45.196Z"},
    {"id":"water-harvesting","name":"Water Harvesting","description":"Essential techniques for collecting and storing water in arid climates.","slug":"water-harvesting","createdAt":"2025-07-17T21:31:45.237Z"},
    {"id":"solar-energy","name":"Solar Energy","description":"Harness Arizona's abundant sunshine with solar power systems.","slug":"solar-energy","createdAt":"2025-07-17T21:31:45.278Z"},
    {"id":"composting","name":"Composting","description":"Creating nutrient-rich soil amendments from organic waste.","slug":"composting","createdAt":"2025-07-17T21:31:45.319Z"},
    {"id":"beekeeping","name":"Beekeeping","description":"Managing honey bee colonies for pollination and honey production.","slug":"beekeeping","createdAt":"2025-07-17T21:31:45.359Z"},
    {"id":"livestock-management","name":"Livestock Management","description":"Caring for farm animals in sustainable and humane ways.","slug":"livestock-management","createdAt":"2025-07-17T21:31:45.401Z"},
    {"id":"herbal-medicine","name":"Herbal Medicine","description":"Growing and using medicinal plants for natural health remedies.","slug":"herbal-medicine","createdAt":"2025-07-17T21:31:45.441Z"},
    {"id":"diy-home-maintenance","name":"DIY Home Maintenance","description":"Essential skills for maintaining and repairing your homestead.","slug":"diy-home-maintenance","createdAt":"2025-07-17T21:31:45.481Z"},
    {"id":"soil-building-in-arid-climates","name":"Soil Building in Arid Climates","description":"Improving soil health in desert environments.","slug":"soil-building-in-arid-climates","createdAt":"2025-07-17T21:31:45.522Z"},
    {"id":"off-grid-water-systems","name":"Off-Grid Water Systems","description":"Independent water solutions for remote homesteads.","slug":"off-grid-water-systems","createdAt":"2025-07-17T21:31:45.563Z"},
    {"id":"homestead-security","name":"Homestead Security","description":"Protecting your property and family in rural settings.","slug":"homestead-security","createdAt":"2025-07-17T21:31:45.604Z"}
  ];

  if (req.method === 'GET') {
    const topic = TOPICS_DATA.find(t => t.slug === slug);
    
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    
    return res.status(200).json(topic);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
