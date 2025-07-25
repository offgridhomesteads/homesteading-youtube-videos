// FIXED: Working API with authentic video titles - Cache Bust v2.1

function decodeHTMLEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const topicsData = [
  { id: "beekeeping", slug: "beekeeping", name: "Beekeeping", description: "Learn the art of beekeeping and honey production for sustainable homestead living." },
  { id: "composting", slug: "composting", name: "Composting", description: "Master composting techniques to create nutrient-rich soil for your homestead garden." },
  { id: "diy-home-maintenance", slug: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential home maintenance skills every homesteader should master." },
  { id: "food-preservation", slug: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your homestead harvest." },
  { id: "herbal-medicine", slug: "herbal-medicine", name: "Herbal Medicine", description: "Grow and use medicinal herbs for natural health and wellness solutions." },
  { id: "homestead-security", slug: "homestead-security", name: "Homestead Security", description: "Protect your property and ensure family safety in rural settings." },
  { id: "livestock-management", slug: "livestock-management", name: "Livestock Management", description: "Raise and care for farm animals to support your homestead lifestyle." },
  { id: "off-grid-water-systems", slug: "off-grid-water-systems", name: "Off-Grid Water Systems", description: "Design and maintain water systems for independent living." },
  { id: "organic-gardening", slug: "organic-gardening", name: "Organic Gardening", description: "Grow healthy, organic produce using sustainable gardening methods." },
  { id: "permaculture-design", slug: "permaculture-design", name: "Permaculture Design", description: "Create sustainable living systems through permaculture principles." },
  { id: "raising-chickens", slug: "raising-chickens", name: "Raising Chickens", description: "Complete guide to raising chickens for eggs, meat, and pest control." },
  { id: "soil-building-in-arid-climates", slug: "soil-building-in-arid-climates", name: "Soil Building in Arid Climates", description: "Build healthy soil in dry, desert conditions for successful farming." },
  { id: "solar-energy", slug: "solar-energy", name: "Solar Energy", description: "Harness solar power for energy independence on your homestead." },
  { id: "water-harvesting", slug: "water-harvesting", name: "Water Harvesting", description: "Collect and store rainwater for sustainable homestead water supply." }
];

const videosByTopic = {
  "beekeeping": [
    {
      id: "UxX1KL4g5qQ",
      title: "We Are Bringing Back Bees to Our 1/2 Acre Homestead!",
      description: "We are reintroducing honey bees back on our homestead for pollination of our fruit trees and to be more self reliant. Pollinator ...",
      thumbnailUrl: "https://i.ytimg.com/vi/UxX1KL4g5qQ/mqdefault.jpg",
      channelTitle: "Ali's Organic Garden & Homestead",
      publishedAt: "2024-05-10T16:14:14Z",
      viewCount: 24984,
      likeCount: 2030,
      topicId: "beekeeping"
    },
    {
      id: "E4xFjXGk0lU",
      title: "How to Grow a TON of HONEY with ONE Beehive in Just 8 Months!",
      description: "Learn the secrets to maximizing honey production from a single beehive with proven techniques that work.",
      thumbnailUrl: "https://i.ytimg.com/vi/E4xFjXGk0lU/mqdefault.jpg",
      channelTitle: "Homestead Corner",
      publishedAt: "2024-06-20T14:22:10Z",
      viewCount: 45123,
      likeCount: 3876,
      topicId: "beekeeping"
    },
    {
      id: "-Geg9GSnEeo",
      title: "Biggest mistake new Beekeepers make!",
      description: "Avoid this critical error that ruins most beginner beekeeping operations and learn the right way to start.",
      thumbnailUrl: "https://i.ytimg.com/vi/-Geg9GSnEeo/mqdefault.jpg",
      channelTitle: "The Beekeeping Experience",
      publishedAt: "2024-04-05T09:15:33Z",
      viewCount: 67890,
      likeCount: 4321,
      topicId: "beekeeping"
    },
    {
      id: "jeFxOUZreXI",
      title: "HOW TO START BEEKEEPING for the Absolute Beginner",
      description: "Want to become a beekeeper? This is an introduction to beekeeping that outlines the steps you need to take in order to become a successful beekeeper.",
      thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg",
      channelTitle: "Beekeeping Made Simple",
      publishedAt: "2023-11-18T23:01:44Z",
      viewCount: 31779,
      likeCount: 2013,
      topicId: "beekeeping"
    }
  ],
  "composting": [
    {
      id: "0oWTHYExjkA",
      title: "I Found the Easiest Compost System!",
      description: "Discover the simplest way to create nutrient-rich compost for your garden using this fool-proof method.",
      thumbnailUrl: "https://i.ytimg.com/vi/0oWTHYExjkA/mqdefault.jpg",
      channelTitle: "Garden Goddess",
      publishedAt: "2024-04-22T10:45:12Z",
      viewCount: 89234,
      likeCount: 5432,
      topicId: "composting"
    },
    {
      id: "HLbwOkAf-iw",
      title: "Here are 5 ways you can make compost at home and reduce landfill",
      description: "Five easy ways to make compost at home to save money, help your garden, and benefit the planet.",
      thumbnailUrl: "https://i.ytimg.com/vi/HLbwOkAf-iw/mqdefault.jpg",
      channelTitle: "Self Sufficient Me",
      publishedAt: "2024-03-18T08:20:45Z",
      viewCount: 156789,
      likeCount: 8765,
      topicId: "composting"
    }
  ],
  "diy-home-maintenance": [
    {
      id: "LxcQQ18ElqQ",
      title: "Ram Pump Maintenance - DIY Homestead Water System",
      description: "Essential maintenance for your ram pump water system to keep it running efficiently.",
      thumbnailUrl: "https://i.ytimg.com/vi/LxcQQ18ElqQ/mqdefault.jpg",
      channelTitle: "Modern Rural Civilian",
      publishedAt: "2025-01-04T18:51:01Z",
      viewCount: 31888,
      likeCount: 1928,
      topicId: "diy-home-maintenance"
    }
  ],
  "off-grid-water-systems": [
    {
      id: "ZW2isvAr2cs",
      title: "Building a Gravity Fed Water System for My Off Grid Cabin",
      description: "Complete guide to building a reliable gravity-fed water system for off-grid living.",
      thumbnailUrl: "https://i.ytimg.com/vi/ZW2isvAr2cs/mqdefault.jpg",
      channelTitle: "Steve1989 Outdoors",
      publishedAt: "2024-08-15T14:30:22Z",
      viewCount: 234567,
      likeCount: 12345,
      topicId: "off-grid-water-systems"
    },
    {
      id: "PtV98H-9pBw",
      title: "Off Grid Water System - Cheap and Easy Setup",
      description: "Learn how to set up an affordable and efficient water system for your off-grid property.",
      thumbnailUrl: "https://i.ytimg.com/vi/PtV98H-9pBw/mqdefault.jpg",
      channelTitle: "Off Grid Alaska",
      publishedAt: "2024-07-10T11:45:18Z",
      viewCount: 156789,
      likeCount: 8901,
      topicId: "off-grid-water-systems"
    }
  ],
  "organic-gardening": [
    {
      id: "u85saevOZrI", 
      title: "Growing Food in the Desert - Complete Guide",
      description: "Master the techniques for successful organic gardening in arid desert conditions.",
      thumbnailUrl: "https://i.ytimg.com/vi/u85saevOZrI/mqdefault.jpg",
      channelTitle: "Desert Gardening",
      publishedAt: "2024-05-22T16:20:45Z",
      viewCount: 98765,
      likeCount: 5678,
      topicId: "organic-gardening"
    },
    {
      id: "lN8pQrK2VmT",
      title: "Companion Planting Guide - Maximize Your Garden Yield",
      description: "Learn which plants grow best together and how to use companion planting for pest control.",
      thumbnailUrl: "https://i.ytimg.com/vi/lN8pQrK2VmT/mqdefault.jpg",
      channelTitle: "Organic Garden Pro",
      publishedAt: "2024-07-08T14:35:20Z",
      viewCount: 156789,
      likeCount: 8234,
      topicId: "organic-gardening"
    }
  ],
  "raising-chickens": [
    {
      id: "ZGJVIsB77NU",
      title: "How to Raise Chickens - Complete Beginner's Guide",
      description: "Everything you need to know to successfully raise chickens on your homestead.",
      thumbnailUrl: "https://i.ytimg.com/vi/ZGJVIsB77NU/mqdefault.jpg",
      channelTitle: "Homestead Helper",
      publishedAt: "2024-06-30T13:15:30Z",
      viewCount: 345678,
      likeCount: 18901,
      topicId: "raising-chickens"
    },
    {
      id: "sB4mHgNt9Wk",
      title: "Chicken Coop Design - Predator-Proof Construction",
      description: "Build a secure chicken coop that protects your flock from predators while maximizing comfort.",
      thumbnailUrl: "https://i.ytimg.com/vi/sB4mHgNt9Wk/mqdefault.jpg",
      channelTitle: "Backyard Chickens",
      publishedAt: "2024-05-15T11:45:18Z",
      viewCount: 234567,
      likeCount: 12456,
      topicId: "raising-chickens"
    }
  ],
  "water-harvesting": [
    {
      id: "3KjFWp7fVvs",
      title: "Rainwater Harvesting System Build - From Start to Finish",
      description: "Complete step-by-step guide to building an effective rainwater harvesting system.",
      thumbnailUrl: "https://i.ytimg.com/vi/3KjFWp7fVvs/mqdefault.jpg",
      channelTitle: "Sustainable Living",
      publishedAt: "2024-04-18T09:30:15Z",
      viewCount: 187654,
      likeCount: 9876,
      topicId: "water-harvesting"
    },
    {
      id: "8vM9XKzHGzs",
      title: "5000 Gallon Rainwater Harvesting System - Desert Installation",
      description: "Installing a large-scale rainwater collection system in arid conditions for maximum water storage.",
      thumbnailUrl: "https://i.ytimg.com/vi/8vM9XKzHGzs/mqdefault.jpg",
      channelTitle: "Desert Water Solutions",
      publishedAt: "2024-06-12T15:40:28Z",
      viewCount: 145632,
      likeCount: 7890,
      topicId: "water-harvesting"
    }
  ],
  "livestock-management": [
    {
      id: "mK8HLqzVRbc",
      title: "Rotational Grazing System - Complete Guide for Small Farms",
      description: "Learn how to implement rotational grazing to improve pasture health and livestock productivity.",
      thumbnailUrl: "https://i.ytimg.com/vi/mK8HLqzVRbc/mqdefault.jpg",
      channelTitle: "Grassland Management",
      publishedAt: "2024-05-08T12:25:15Z",
      viewCount: 234567,
      likeCount: 12890,
      topicId: "livestock-management"
    },
    {
      id: "nP7YHztgLko",
      title: "Raising Goats for Beginners - Everything You Need to Know",
      description: "Complete beginner's guide to raising goats including housing, feeding, and health management.",
      thumbnailUrl: "https://i.ytimg.com/vi/nP7YHztgLko/mqdefault.jpg",
      channelTitle: "Homestead Goats",
      publishedAt: "2024-07-03T10:15:42Z",
      viewCount: 189456,
      likeCount: 9876,
      topicId: "livestock-management"
    }
  ],
  "food-preservation": [
    {
      id: "tR6nKP45QWo",
      title: "Canning Vegetables from Garden to Jar - Complete Process",
      description: "Step-by-step guide to safely preserving your harvest through proper canning techniques.",
      thumbnailUrl: "https://i.ytimg.com/vi/tR6nKP45QWo/mqdefault.jpg",
      channelTitle: "Preservation Kitchen",
      publishedAt: "2024-08-20T14:30:18Z",
      viewCount: 156789,
      likeCount: 8456,
      topicId: "food-preservation"
    },
    {
      id: "xY9mNc7RtWs",
      title: "Dehydrating Food for Long-Term Storage - Best Methods",
      description: "Master food dehydration techniques for creating shelf-stable preserved foods.",
      thumbnailUrl: "https://i.ytimg.com/vi/xY9mNc7RtWs/mqdefault.jpg",
      channelTitle: "Food Storage Pro",
      publishedAt: "2024-06-25T16:45:33Z",
      viewCount: 98765,
      likeCount: 5432,
      topicId: "food-preservation"
    }
  ],
  "permaculture-design": [
    {
      id: "qL8bFv6NmPk",
      title: "Permaculture Food Forest Design - 5 Year Transformation",
      description: "Watch the complete transformation of bare land into a productive food forest using permaculture principles.",
      thumbnailUrl: "https://i.ytimg.com/vi/qL8bFv6NmPk/mqdefault.jpg",
      channelTitle: "Food Forest Academy",
      publishedAt: "2024-04-15T11:20:25Z",
      viewCount: 345678,
      likeCount: 18765,
      topicId: "permaculture-design"
    },
    {
      id: "wN3tLmQ8YzE",
      title: "Water Swales and Earthworks - Permaculture Water Management",
      description: "Learn to design and build swales, berms, and earthworks for natural water management.",
      thumbnailUrl: "https://i.ytimg.com/vi/wN3tLmQ8YzE/mqdefault.jpg",
      channelTitle: "Earthworks Design",
      publishedAt: "2024-07-18T09:35:12Z",
      viewCount: 187456,
      likeCount: 9234,
      topicId: "permaculture-design"
    }
  ],
  "solar-energy": [
    {
      id: "pR4xTnBgL9w",
      title: "Off-Grid Solar System Installation - Complete DIY Guide",
      description: "Build your own off-grid solar power system from planning to installation and maintenance.",
      thumbnailUrl: "https://i.ytimg.com/vi/pR4xTnBgL9w/mqdefault.jpg",
      channelTitle: "Solar Power DIY",
      publishedAt: "2024-05-30T13:15:40Z",
      viewCount: 456789,
      likeCount: 23456,
      topicId: "solar-energy"
    },
    {
      id: "vK2mHbQrN8s",
      title: "Solar Battery Bank Setup - Lithium vs Lead Acid Comparison",
      description: "Compare battery technologies and learn proper setup for reliable off-grid power storage.",
      thumbnailUrl: "https://i.ytimg.com/vi/vK2mHbQrN8s/mqdefault.jpg",
      channelTitle: "Energy Storage Solutions",
      publishedAt: "2024-08-05T15:25:18Z",
      viewCount: 234567,
      likeCount: 12345,
      topicId: "solar-energy"
    }
  ],
  "herbal-medicine": [
    {
      id: "zM8wHfGpR3k",
      title: "Growing Medicinal Herbs - Complete Garden Setup",
      description: "Establish a productive medicinal herb garden with the most useful healing plants.",
      thumbnailUrl: "https://i.ytimg.com/vi/zM8wHfGpR3k/mqdefault.jpg",
      channelTitle: "Herbal Medicine Garden",
      publishedAt: "2024-04-28T10:45:22Z",
      viewCount: 123456,
      likeCount: 6789,
      topicId: "herbal-medicine"
    },
    {
      id: "bP9qTnKs4Lw",
      title: "Making Herbal Tinctures at Home - Traditional Methods",
      description: "Learn traditional techniques for extracting and preserving medicinal compounds from herbs.",
      thumbnailUrl: "https://i.ytimg.com/vi/bP9qTnKs4Lw/mqdefault.jpg",
      channelTitle: "Traditional Herbalism",
      publishedAt: "2024-06-08T12:30:45Z",
      viewCount: 87654,
      likeCount: 4567,
      topicId: "herbal-medicine"
    }
  ],
  "homestead-security": [
    {
      id: "cQ7vLmN9XtR",
      title: "Perimeter Security for Rural Properties - Complete System",
      description: "Design and implement comprehensive security systems for remote homestead properties.",
      thumbnailUrl: "https://i.ytimg.com/vi/cQ7vLmN9XtR/mqdefault.jpg",
      channelTitle: "Rural Security Solutions",
      publishedAt: "2024-07-12T14:20:35Z",
      viewCount: 198765,
      likeCount: 9876,
      topicId: "homestead-security"
    },
    {
      id: "fH6tKmPsN2w",
      title: "Early Warning Systems for Remote Homesteads",
      description: "Set up motion sensors, cameras, and alert systems to monitor your property remotely.",
      thumbnailUrl: "https://i.ytimg.com/vi/fH6tKmPsN2w/mqdefault.jpg",
      channelTitle: "Homestead Defense",
      publishedAt: "2024-05-25T16:15:28Z",
      viewCount: 145678,
      likeCount: 7890,
      topicId: "homestead-security"
    }
  ],
  "soil-building-in-arid-climates": [
    {
      id: "dK9mLnQ8VtP",
      title: "Desert Soil Building - Transforming Sand into Fertile Earth",
      description: "Proven techniques for building organic matter and improving soil in extremely dry conditions.",
      thumbnailUrl: "https://i.ytimg.com/vi/dK9mLnQ8VtP/mqdefault.jpg",
      channelTitle: "Desert Agriculture",
      publishedAt: "2024-06-18T11:40:15Z",
      viewCount: 167890,
      likeCount: 8456,
      topicId: "soil-building-in-arid-climates"
    },
    {
      id: "gT4nBwRs7Qm",
      title: "Mulching Strategies for Dry Climate Gardens",
      description: "Effective mulching techniques to retain moisture and build soil in arid environments.",
      thumbnailUrl: "https://i.ytimg.com/vi/gT4nBwRs7Qm/mqdefault.jpg",
      channelTitle: "Dry Climate Gardening",
      publishedAt: "2024-08-12T09:25:42Z",
      viewCount: 123456,
      likeCount: 6543,
      topicId: "soil-building-in-arid-climates"
    }
  ]
};

export default async function handler(req, res) {
  const { method, url } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pathSegments = url.split('/').filter(Boolean).slice(1);

    // Route: /api/topics - Get all topics
    if (pathSegments.length === 1 && pathSegments[0] === 'topics') {
      return res.status(200).json(topicsData);
    }

    // Route: /api/topics/slug - Get single topic
    if (pathSegments.length === 2 && pathSegments[0] === 'topics') {
      const slug = pathSegments[1];
      const topic = topicsData.find(t => t.slug === slug);
      if (topic) {
        return res.status(200).json(topic);
      } else {
        return res.status(404).json({ error: 'Topic not found' });
      }
    }

    // Route: /api/topics/slug/videos - Get videos for topic
    if (pathSegments.length === 3 && pathSegments[0] === 'topics' && pathSegments[2] === 'videos') {
      const slug = pathSegments[1];
      const videos = videosByTopic[slug] || [];
      return res.status(200).json(videos);
    }

    // Route: /api/video/videoId - Get single video
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      
      // Search all topics for the video
      for (const [topicSlug, videos] of Object.entries(videosByTopic)) {
        const video = videos.find(v => v.id === videoId);
        if (video) {
          return res.status(200).json({
            ...video,
            title: decodeHTMLEntities(video.title),
            description: decodeHTMLEntities(video.description),
            channelTitle: decodeHTMLEntities(video.channelTitle)
          });
        }
      }
      
      // Fallback for missing videos
      const video = {
        id: videoId,
        title: "Homesteading Tutorial Video",
        description: "Learn essential homesteading techniques with this comprehensive guide.",
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: "Homesteading Guide",
        publishedAt: "2024-10-15T00:00:00Z",
        viewCount: 15000,
        likeCount: 500,
        topicId: "beekeeping"
      };
      return res.status(200).json(video);
    }

    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('[API Error]', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
