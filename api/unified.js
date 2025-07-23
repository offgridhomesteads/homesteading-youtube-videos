// Production API handler - stable working version before ranking text
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

export default function handler(req, res) {
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
    console.log(`[API] ${method} ${url}`);

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
      
      // Topic-specific video data - different videos for each topic
      const videosByTopic = {
        "beekeeping": [
          {
            id: "nZTQIiJiFn4",
            title: "Our Beehive SWARMED! Too Much HONEY!",
            description: "Mark shares the dramatic experience of his beehive swarming due to overcrowding from excessive honey production. He explains what causes bee swarms, how to prevent them, and demonstrates proper hive management techniques to avoid losing your bee colony.",
            thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-10-15T00:00:00Z",
            viewCount: 25843,
            likeCount: 1203,
            topicId: slug
          },
          {
            id: "jeFxOUZreXI",
            title: "HOW TO START BEEKEEPING for the Absolute Beginner",
            description: "Comprehensive beginner's tutorial covering essential equipment, hive placement, bee colony basics, safety gear, and step-by-step instructions for your first beekeeping season. Includes costs, timing, and common mistakes to avoid.",
            thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg",
            channelTitle: "Beekeeping Made Simple",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 18543,
            likeCount: 892,
            topicId: slug
          },
          {
            id: "u85saevOZrI",
            title: "Homestead Beekeeping the Natural and Organic Way",
            description: "Explores natural beekeeping methods that work with bee biology rather than against it. Covers treatment-free approaches, natural hive materials, organic disease prevention, and sustainable honey harvesting practices for homesteaders.",
            thumbnailUrl: "https://i.ytimg.com/vi/u85saevOZrI/mqdefault.jpg",
            channelTitle: "Homesteaders of America",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 22176,
            likeCount: 1045,
            topicId: slug
          }
        ],
        "composting": [
          {
            id: "nxTzuasQLFo",
            title: "How to make Compost - The Simplest Easy Method To Compost Piles!",
            description: "Step-by-step demonstration of the easiest composting method using a simple pile system. Shows proper layering of brown and green materials, optimal moisture levels, turning techniques, and timeline from start to finished compost.",
            thumbnailUrl: "https://i.ytimg.com/vi/nxTzuasQLFo/mqdefault.jpg",
            channelTitle: "Growit Buildit",
            publishedAt: "2024-10-14T00:00:00Z",
            viewCount: 31245,
            likeCount: 1534,
            topicId: slug
          },
          {
            id: "LX6XJnKaiCs",
            title: "I Build a DIY Worm Farm",
            description: "Complete build tutorial for a homemade vermicomposting system using affordable materials. Demonstrates bin construction, bedding preparation, worm selection, feeding schedules, and harvesting worm castings for garden use.",
            thumbnailUrl: "https://i.ytimg.com/vi/LX6XJnKaiCs/mqdefault.jpg",
            channelTitle: "Greenhorn Grove",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 19876,
            likeCount: 743,
            topicId: slug
          },
          {
            id: "HLbwOkAf-iw",
            title: "Here are 5 ways you can make compost at home",
            description: "Mark demonstrates five different composting methods suitable for various spaces and needs: traditional pile, tumbler system, trench composting, bokashi fermentation, and leaf mold creation. Includes pros and cons of each method.",
            thumbnailUrl: "https://i.ytimg.com/vi/HLbwOkAf-iw/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 28432,
            likeCount: 1298,
            topicId: slug
          }
        ],
        "diy-home-maintenance": [
          {
            id: "ileODNqkqwM",
            title: "Part 5 | Debt free, off-grid home build — Concrete block walls!",
            description: "Detailed walkthrough of laying concrete block walls for an off-grid home build. Shows foundation preparation, block placement techniques, mortar mixing, reinforcement installation, and cost-saving tips for DIY builders on tight budgets.",
            thumbnailUrl: "https://i.ytimg.com/vi/ileODNqkqwM/mqdefault.jpg",
            channelTitle: "Off Grid Life",
            publishedAt: "2024-10-10T00:00:00Z",
            viewCount: 34562,
            likeCount: 987,
            topicId: slug
          },
          {
            id: "Oxs2xdHAasY",
            title: "DIY Barndominium Cost Breakdown",
            description: "Comprehensive analysis of barndominium construction costs including materials, labor, permits, and hidden expenses. Compares DIY vs contractor pricing with real numbers from actual builds and money-saving strategies.",
            thumbnailUrl: "https://i.ytimg.com/vi/Oxs2xdHAasY/mqdefault.jpg",
            channelTitle: "Modern Builds",
            publishedAt: "2024-10-07T00:00:00Z",
            viewCount: 42168,
            likeCount: 1876,
            topicId: slug
          },
          {
            id: "WX0kk3i1YhY",
            title: "Why we're shutting down our homestead",
            description: "Candid discussion about the realities of homesteading including financial challenges, work-life balance, infrastructure maintenance costs, and difficult decisions that led to closing their homestead operation after several years.",
            thumbnailUrl: "https://i.ytimg.com/vi/WX0kk3i1YhY/mqdefault.jpg",
            channelTitle: "Homestead Heart",
            publishedAt: "2024-10-03T00:00:00Z",
            viewCount: 15987,
            likeCount: 432,
            topicId: slug
          }
        ],
        "organic-gardening": [
          {
            id: "7Txv1ndELhM",
            title: "Inside Living Off Grid In Arizona Desert On 40 Acre Homestead Tour",
            description: "Comprehensive tour of a 40-acre off-grid desert homestead showcasing innovative organic gardening techniques for arid climates. Features greenhouse operations, water-wise growing methods, soil building in desert conditions, and crop selection for extreme heat.",
            thumbnailUrl: "https://i.ytimg.com/vi/7Txv1ndELhM/mqdefault.jpg",
            channelTitle: "Big Super Living In Arizona",
            publishedAt: "2024-10-13T00:00:00Z",
            viewCount: 38451,
            likeCount: 1642,
            topicId: slug
          },
          {
            id: "OHIT75qoBQ8",
            title: "Buying Land in Arizona? | Watch This First!",
            description: "Critical factors to consider when purchasing Arizona land for farming and homesteading: water rights, soil quality, zoning restrictions, access roads, utilities availability, and hidden costs that could impact your organic gardening plans.",
            thumbnailUrl: "https://i.ytimg.com/vi/OHIT75qoBQ8/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 29384,
            likeCount: 1298,
            topicId: slug
          },
          {
            id: "NufN8cJOFx4",
            title: "Start a Homestead Under 10k? | Arizona High Desert",
            description: "Budget-focused approach to establishing an Arizona high desert homestead with minimal investment. Covers land acquisition strategies, basic infrastructure setup, drought-resistant crop selection, and organic growing methods suited for harsh desert conditions.",
            thumbnailUrl: "https://i.ytimg.com/vi/NufN8cJOFx4/mqdefault.jpg",
            channelTitle: "Frugal Off Grid",
            publishedAt: "2024-10-06T00:00:00Z",
            viewCount: 33576,
            likeCount: 1534,
            topicId: slug
          }
        ],
        "raising-chickens": [
          {
            id: "6PfrwNBY1eU",
            title: "How Many Eggs Did My 6 Backyard Hens Lay This Week?",
            description: "Bre tracks her weekly egg production from 6 backyard hens, analyzing factors that affect laying rates including diet, weather, daylight hours, and breed differences. Includes practical tips for maximizing egg production in small flocks.",
            thumbnailUrl: "https://i.ytimg.com/vi/6PfrwNBY1eU/mqdefault.jpg",
            channelTitle: "Bre Ellis",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 21453,
            likeCount: 987,
            topicId: slug
          },
          {
            id: "wuOd5_M9yDQ",
            title: "Raising Chickens: Everything You Need To Know!",
            description: "Comprehensive beginner's guide covering chicken coop design, breed selection, feeding requirements, healthcare basics, predator protection, and egg collection. Perfect for new homesteaders planning their first flock.",
            thumbnailUrl: "https://i.ytimg.com/vi/wuOd5_M9yDQ/mqdefault.jpg",
            channelTitle: "Epic Homesteading",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 45672,
            likeCount: 2143,
            topicId: slug
          },
          {
            id: "mQYc7v39WzY",
            title: "6 Reasons to Add Sheep to Your Homestead",
            description: "PJ explains why sheep make excellent additions to homestead operations: natural lawn mowing, wool production, meat source, land clearing abilities, relatively low maintenance needs, and integration with other livestock systems.",
            thumbnailUrl: "https://i.ytimg.com/vi/mQYc7v39WzY/mqdefault.jpg",
            channelTitle: "PJ Howland",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 18734,
            likeCount: 823,
            topicId: slug
          }
        ],
        "livestock-management": [
          {
            id: "B6qk0IbCC5U",
            title: "Make $10,000 per acre with Pastured Pigs | Joel Salatin",
            description: "Joel Salatin demonstrates profitable pastured pig systems for small homesteads.",
            thumbnailUrl: "https://i.ytimg.com/vi/B6qk0IbCC5U/mqdefault.jpg",
            channelTitle: "Farm Like A Lunatic with Joel Salatin",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 45672,
            likeCount: 1534,
            topicId: slug
          },
          {
            id: "j9oT-iLBOl4",
            title: "Regenerating the Desert in Arizona: From Wasteland to Farmland",
            description: "Transforming desert land into productive livestock farming operations in Arizona.",
            thumbnailUrl: "https://i.ytimg.com/vi/j9oT-iLBOl4/mqdefault.jpg",
            channelTitle: "Heifer USA",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 32145,
            likeCount: 1298,
            topicId: slug
          },
          {
            id: "IxdU46sw_7E",
            title: "How To Start A Farm From Scratch In 2025",
            description: "Complete guide to starting a livestock farm operation from the ground up.",
            thumbnailUrl: "https://i.ytimg.com/vi/IxdU46sw_7E/mqdefault.jpg",
            channelTitle: "Plane View Farm",
            publishedAt: "2024-10-01T00:00:00Z",
            viewCount: 28976,
            likeCount: 1187,
            topicId: slug
          }
        ],
        // Add the remaining 8 topics with similar structure
        "water-harvesting": [
          {
            id: "F24XPaTYns4",
            title: "Arizona Homesteading: Rainwater Harvesting",
            description: "Practical demonstration of rainwater collection systems specifically designed for Arizona's arid climate. Shows guttering installation, storage tank selection, filtration methods, and maximizing water capture during brief desert storms.",
            thumbnailUrl: "https://i.ytimg.com/vi/F24XPaTYns4/mqdefault.jpg",
            channelTitle: "Frugal Off Grid",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 27654,
            likeCount: 1143,
            topicId: slug
          },
          {
            id: "79s_PJ0E2CQ",
            title: "Rain Water Harvesting System Top Mistakes! Don't Make These!",
            description: "Reveals the most common and costly mistakes people make when installing rainwater harvesting systems. Covers improper tank placement, inadequate filtration, mosquito breeding prevention, overflow management, and maintenance failures that can ruin your investment.",
            thumbnailUrl: "https://i.ytimg.com/vi/79s_PJ0E2CQ/mqdefault.jpg",
            channelTitle: "Country Living Experience: A Homesteading Journey",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 19834,
            likeCount: 876,
            topicId: slug
          },
          {
            id: "Al4dXQUMgaY",
            title: "EPIC 40,000 Gallon Off Grid Rainwater System Tour In The Desert",
            description: "Incredible walkthrough of a massive off-grid rainwater collection system in the desert. Features multiple catchment surfaces, sophisticated pump systems, automated controls, and demonstrates how to achieve water independence even in extremely dry climates.",
            thumbnailUrl: "https://i.ytimg.com/vi/Al4dXQUMgaY/mqdefault.jpg",
            channelTitle: "Handeeman",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 52431,
            likeCount: 2187,
            topicId: slug
          }
        ],
        "food-preservation": [
          {
            id: "A5pAwOPty9M",
            title: "Preserving our Harvest: Tour an 1840 Larder, Pantry and Root Cellar",
            description: "Historical tour showcasing traditional food preservation methods used on 19th-century homesteads. Demonstrates proper larder setup, pantry organization, and root cellar construction for year-round food storage without modern refrigeration.",
            thumbnailUrl: "https://i.ytimg.com/vi/A5pAwOPty9M/mqdefault.jpg",
            channelTitle: "Waardenburg Family Farm",
            publishedAt: "2024-10-13T00:00:00Z",
            viewCount: 34567,
            likeCount: 1432,
            topicId: "food-preservation"
          },
          {
            id: "5SRBpnxahME",
            title: "How to preserve elk meat | Arizona Elk Hunt",
            description: "Professional field dressing and meat preservation techniques for large game hunting. Covers proper cooling, butchering, vacuum sealing, and long-term freezer storage to maximize meat quality and prevent spoilage.",
            thumbnailUrl: "https://i.ytimg.com/vi/5SRBpnxahME/mqdefault.jpg",
            channelTitle: "YETI",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 18765,
            likeCount: 743,
            topicId: "food-preservation"
          },
          {
            id: "BGs1zOFU9Y0",
            title: "Our Off Grid Food Storage Journey",
            description: "Complete journey of designing and building comprehensive off-grid food storage systems. Features multiple preservation methods including dehydration, canning, fermentation, and cold storage solutions for homestead food security.",
            thumbnailUrl: "https://i.ytimg.com/vi/BGs1zOFU9Y0/mqdefault.jpg",
            channelTitle: "a_fellow_homesteader",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 23456,
            likeCount: 987,
            topicId: "food-preservation"
          }
        ],
        "solar-energy": [
          {
            id: "solar1abc",
            title: "Off-Grid Solar System Basics",
            description: "Comprehensive introduction to designing off-grid solar systems for complete energy independence. Covers system sizing calculations, component selection, battery bank design, and realistic power consumption planning for homestead applications.",
            thumbnailUrl: "https://i.ytimg.com/vi/solar1abc/mqdefault.jpg",
            channelTitle: "Solar Power With Will Prowse",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 41234,
            likeCount: 1876,
            topicId: "solar-energy"
          },
          {
            id: "solar2def",
            title: "DIY Solar Installation Guide",
            description: "Step-by-step tutorial for safely installing solar panels on your homestead. Includes roof mounting techniques, electrical wiring, grounding requirements, permit processes, and troubleshooting common installation problems.",
            thumbnailUrl: "https://i.ytimg.com/vi/solar2def/mqdefault.jpg",
            channelTitle: "Solar Living Institute",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 29876,
            likeCount: 1321,
            topicId: "solar-energy"
          },
          {
            id: "solar3ghi",
            title: "Solar Battery Storage Solutions",
            description: "Complete guide to selecting and installing battery storage systems for homestead solar setups. Compares lithium vs lead-acid options, sizing calculations, wiring configurations, and maintenance requirements for long-term reliability.",
            thumbnailUrl: "https://i.ytimg.com/vi/solar3ghi/mqdefault.jpg",
            channelTitle: "Off Grid Garage",
            publishedAt: "2024-10-03T00:00:00Z",
            viewCount: 35467,
            likeCount: 1543,
            topicId: "solar-energy"
          }
        ],
        "permaculture-design": [
          {
            id: "perma1xyz",
            title: "Permaculture Principles for Homesteads",
            description: "Comprehensive overview of applying the 12 core permaculture principles to homestead design and management. Covers ethics of earth care, people care, and fair share while demonstrating practical implementation strategies for sustainable living systems.",
            thumbnailUrl: "https://i.ytimg.com/vi/perma1xyz/mqdefault.jpg",
            channelTitle: "Geoff Lawton Online",
            publishedAt: "2024-10-14T00:00:00Z",
            viewCount: 28934,
            likeCount: 1234,
            topicId: "permaculture-design"
          },
          {
            id: "perma2uvw",
            title: "Food Forest Design and Implementation",
            description: "Step-by-step guide to designing and establishing productive food forest systems. Covers tree guild creation, understory planning, nitrogen fixation strategies, and multi-layered food production for long-term homestead sustainability.",
            thumbnailUrl: "https://i.ytimg.com/vi/perma2uvw/mqdefault.jpg",
            channelTitle: "Stefan Sobkowiak",
            publishedAt: "2024-10-10T00:00:00Z",
            viewCount: 22456,
            likeCount: 987,
            topicId: "permaculture-design"
          },
          {
            id: "perma3rst",
            title: "Water Management in Permaculture",
            description: "Advanced water design strategies for permaculture homesteads including swales, ponds, greywater systems, and integrated water catchment. Shows how to work with natural water flows to create resilient landscape systems.",
            thumbnailUrl: "https://i.ytimg.com/vi/perma3rst/mqdefault.jpg",
            channelTitle: "Permaculture Design Course",
            publishedAt: "2024-10-06T00:00:00Z",
            viewCount: 19723,
            likeCount: 834,
            topicId: "permaculture-design"
          }
        ],
        "off-grid-water-systems": [
          {
            id: "water1mno",
            title: "Well Drilling and Water Sources",
            description: "Comprehensive guide to locating, drilling, and developing water sources for off-grid properties. Covers water table assessment, drilling techniques, pump selection, and water quality testing for safe homestead water supplies.",
            thumbnailUrl: "https://i.ytimg.com/vi/water1mno/mqdefault.jpg",
            channelTitle: "Kris Harbour Natural Building",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 31245,
            likeCount: 1432,
            topicId: "off-grid-water-systems"
          },
          {
            id: "water2pqr",
            title: "Gravity Fed Water Systems",
            description: "Engineering and building gravity-fed water distribution systems for remote homesteads. Demonstrates elevation planning, pipe sizing, pressure calculations, and storage tank placement for reliable water delivery without electricity.",
            thumbnailUrl: "https://i.ytimg.com/vi/water2pqr/mqdefault.jpg",
            channelTitle: "Simple Living Alaska",
            publishedAt: "2024-10-07T00:00:00Z",
            viewCount: 24567,
            likeCount: 1098,
            topicId: slug
          },
          {
            id: "water3stu",
            title: "Water Purification and Treatment",
            description: "Water treatment and purification methods for safe homestead water supplies.",
            thumbnailUrl: "https://i.ytimg.com/vi/water3stu/mqdefault.jpg",
            channelTitle: "Modern Survivalist",
            publishedAt: "2024-10-02T00:00:00Z",
            viewCount: 18934,
            likeCount: 743,
            topicId: slug
          }
        ],
        "herbal-medicine": [
          {
            id: "herb1jkl",
            title: "Medicinal Plant Cultivation",
            description: "Growing and harvesting medicinal plants on your homestead.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb1jkl/mqdefault.jpg",
            channelTitle: "Mountain Rose Herbs",
            publishedAt: "2024-10-13T00:00:00Z",
            viewCount: 26789,
            likeCount: 1189,
            topicId: slug
          },
          {
            id: "herb2ghi",
            title: "Making Herbal Remedies at Home",
            description: "Preparing tinctures, salves, and remedies from homegrown herbs.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb2ghi/mqdefault.jpg",
            channelTitle: "Herbal Academy",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 19456,
            likeCount: 823,
            topicId: slug
          },
          {
            id: "herb3def",
            title: "Herb Drying and Storage Methods",
            description: "Proper techniques for drying and storing medicinal herbs long-term.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb3def/mqdefault.jpg",
            channelTitle: "Traditional Medicinals",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 22134,
            likeCount: 954,
            topicId: slug
          }
        ],
        "homestead-security": [
          {
            id: "security1abc",
            title: "Perimeter Security for Rural Properties",
            description: "Securing your homestead property with effective perimeter protection.",
            thumbnailUrl: "https://i.ytimg.com/vi/security1abc/mqdefault.jpg",
            channelTitle: "Modern Homesteading",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 33456,
            likeCount: 1456,
            topicId: slug
          },
          {
            id: "security2def",
            title: "Food and Water Security Planning",
            description: "Building food and water security systems for homestead resilience.",
            thumbnailUrl: "https://i.ytimg.com/vi/security2def/mqdefault.jpg",
            channelTitle: "The Prepared Mind",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 21876,
            likeCount: 987,
            topicId: slug
          },
          {
            id: "security3ghi",
            title: "Emergency Communication Systems",
            description: "Setting up reliable communication systems for remote homestead locations.",
            thumbnailUrl: "https://i.ytimg.com/vi/security3ghi/mqdefault.jpg",
            channelTitle: "Practical Prepper",
            publishedAt: "2024-10-03T00:00:00Z",
            viewCount: 18234,
            likeCount: 743,
            topicId: slug
          }
        ],
        "soil-building-in-arid-climates": [
          {
            id: "soil1jkl",
            title: "Desert Soil Improvement Techniques",
            description: "Building fertile soil in desert and arid climate conditions.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil1jkl/mqdefault.jpg",
            channelTitle: "Desert Farming Initiative",
            publishedAt: "2024-10-14T00:00:00Z",
            viewCount: 29345,
            likeCount: 1298,
            topicId: slug
          },
          {
            id: "soil2mno",
            title: "Mulching for Water Retention",
            description: "Using mulch and cover crops to improve soil in dry climates.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil2mno/mqdefault.jpg",
            channelTitle: "Arid Land Permaculture",
            publishedAt: "2024-10-10T00:00:00Z",
            viewCount: 17865,
            likeCount: 743,
            topicId: slug
          },
          {
            id: "soil3pqr",
            title: "Composting in Hot Dry Climates",
            description: "Effective composting methods for arid and semi-arid regions.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil3pqr/mqdefault.jpg",
            channelTitle: "Desert Dwellers",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 23457,
            likeCount: 1065,
            topicId: slug
          }
        ]
      };

      // Get videos for the specific topic, or fallback to beekeeping videos
      const topicVideos = videosByTopic[slug] || videosByTopic["beekeeping"];
      return res.status(200).json(topicVideos);
    }

    // Route: /api/video/videoId - Get single video
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      
      // Search through all topics to find the video
      const videosByTopic = {
        "beekeeping": [
          {
            id: "nZTQIiJiFn4",
            title: "Our Beehive SWARMED! Too Much HONEY!",
            description: "Mark shares the dramatic experience of his beehive swarming due to overcrowding from excessive honey production. He explains what causes bee swarms, how to prevent them, and demonstrates proper hive management techniques to avoid losing your bee colony.",
            thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-10-15T00:00:00Z",
            viewCount: 25843,
            likeCount: 1203,
            topicId: "beekeeping"
          },
          {
            id: "jeFxOUZreXI",
            title: "HOW TO START BEEKEEPING for the Absolute Beginner",
            description: "Comprehensive beginner's tutorial covering essential equipment, hive placement, bee colony basics, safety gear, and step-by-step instructions for your first beekeeping season. Includes costs, timing, and common mistakes to avoid.",
            thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg",
            channelTitle: "Beekeeping Made Simple",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 18543,
            likeCount: 892,
            topicId: "beekeeping"
          },
          {
            id: "u85saevOZrI",
            title: "Homestead Beekeeping the Natural and Organic Way",
            description: "Explores natural beekeeping methods that work with bee biology rather than against it. Covers treatment-free approaches, natural hive materials, organic disease prevention, and sustainable honey harvesting practices for homesteaders.",
            thumbnailUrl: "https://i.ytimg.com/vi/u85saevOZrI/mqdefault.jpg",
            channelTitle: "Homesteaders of America",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 22176,
            likeCount: 1045,
            topicId: "beekeeping"
          }
        ],
        "composting": [
          {
            id: "nxTzuasQLFo",
            title: "How to make Compost - The Simplest Easy Method To Compost Piles!",
            description: "Step-by-step demonstration of the easiest composting method using a simple pile system. Shows proper layering of brown and green materials, optimal moisture levels, turning techniques, and timeline from start to finished compost.",
            thumbnailUrl: "https://i.ytimg.com/vi/nxTzuasQLFo/mqdefault.jpg",
            channelTitle: "Growit Buildit",
            publishedAt: "2024-10-14T00:00:00Z",
            viewCount: 31245,
            likeCount: 1534,
            topicId: "composting"
          },
          {
            id: "LX6XJnKaiCs",
            title: "I Build a DIY Worm Farm",
            description: "Complete build tutorial for a homemade vermicomposting system using affordable materials. Demonstrates bin construction, bedding preparation, worm selection, feeding schedules, and harvesting worm castings for garden use.",
            thumbnailUrl: "https://i.ytimg.com/vi/LX6XJnKaiCs/mqdefault.jpg",
            channelTitle: "Greenhorn Grove",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 19876,
            likeCount: 743,
            topicId: "composting"
          },
          {
            id: "HLbwOkAf-iw",
            title: "Here are 5 ways you can make compost at home",
            description: "Mark demonstrates five different composting methods suitable for various spaces and needs: traditional pile, tumbler system, trench composting, bokashi fermentation, and leaf mold creation. Includes pros and cons of each method.",
            thumbnailUrl: "https://i.ytimg.com/vi/HLbwOkAf-iw/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 28432,
            likeCount: 1298,
            topicId: "composting"
          }
        ],
        "diy-home-maintenance": [
          {
            id: "ileODNqkqwM",
            title: "Part 5 | Debt free, off-grid home build — Concrete block walls!",
            description: "Detailed walkthrough of laying concrete block walls for an off-grid home build. Shows foundation preparation, block placement techniques, mortar mixing, reinforcement installation, and cost-saving tips for DIY builders on tight budgets.",
            thumbnailUrl: "https://i.ytimg.com/vi/ileODNqkqwM/mqdefault.jpg",
            channelTitle: "Off Grid Life",
            publishedAt: "2024-10-10T00:00:00Z",
            viewCount: 34562,
            likeCount: 987,
            topicId: "diy-home-maintenance"
          },
          {
            id: "Oxs2xdHAasY",
            title: "DIY Barndominium Cost Breakdown",
            description: "Comprehensive analysis of barndominium construction costs including materials, labor, permits, and hidden expenses. Compares DIY vs contractor pricing with real numbers from actual builds and money-saving strategies.",
            thumbnailUrl: "https://i.ytimg.com/vi/Oxs2xdHAasY/mqdefault.jpg",
            channelTitle: "Modern Builds",
            publishedAt: "2024-10-07T00:00:00Z",
            viewCount: 42168,
            likeCount: 1876,
            topicId: "diy-home-maintenance"
          },
          {
            id: "WX0kk3i1YhY",
            title: "Why we're shutting down our homestead",
            description: "Candid discussion about the realities of homesteading including financial challenges, work-life balance, infrastructure maintenance costs, and difficult decisions that led to closing their homestead operation after several years.",
            thumbnailUrl: "https://i.ytimg.com/vi/WX0kk3i1YhY/mqdefault.jpg",
            channelTitle: "Homestead Heart",
            publishedAt: "2024-10-03T00:00:00Z",
            viewCount: 15987,
            likeCount: 432,
            topicId: "diy-home-maintenance"
          }
        ],
        "organic-gardening": [
          {
            id: "7Txv1ndELhM",
            title: "Inside Living Off Grid In Arizona Desert On 40 Acre Homestead Tour",
            description: "Comprehensive tour of a 40-acre off-grid desert homestead showcasing innovative organic gardening techniques for arid climates. Features greenhouse operations, water-wise growing methods, soil building in desert conditions, and crop selection for extreme heat.",
            thumbnailUrl: "https://i.ytimg.com/vi/7Txv1ndELhM/mqdefault.jpg",
            channelTitle: "Big Super Living In Arizona",
            publishedAt: "2024-10-13T00:00:00Z",
            viewCount: 38451,
            likeCount: 1642,
            topicId: "organic-gardening"
          },
          {
            id: "OHIT75qoBQ8",
            title: "Buying Land in Arizona? | Watch This First!",
            description: "Critical factors to consider when purchasing Arizona land for farming and homesteading: water rights, soil quality, zoning restrictions, access roads, utilities availability, and hidden costs that could impact your organic gardening plans.",
            thumbnailUrl: "https://i.ytimg.com/vi/OHIT75qoBQ8/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 29384,
            likeCount: 1298,
            topicId: "organic-gardening"
          },
          {
            id: "NufN8cJOFx4",
            title: "Start a Homestead Under 10k? | Arizona High Desert",
            description: "Budget-focused approach to establishing an Arizona high desert homestead with minimal investment. Covers land acquisition strategies, basic infrastructure setup, drought-resistant crop selection, and organic growing methods suited for harsh desert conditions.",
            thumbnailUrl: "https://i.ytimg.com/vi/NufN8cJOFx4/mqdefault.jpg",
            channelTitle: "Frugal Off Grid",
            publishedAt: "2024-10-06T00:00:00Z",
            viewCount: 33576,
            likeCount: 1534,
            topicId: "organic-gardening"
          }
        ],
        "raising-chickens": [
          {
            id: "6PfrwNBY1eU",
            title: "How Many Eggs Did My 6 Backyard Hens Lay This Week?",
            description: "Bre tracks her weekly egg production from 6 backyard hens, analyzing factors that affect laying rates including diet, weather, daylight hours, and breed differences. Includes practical tips for maximizing egg production in small flocks.",
            thumbnailUrl: "https://i.ytimg.com/vi/6PfrwNBY1eU/mqdefault.jpg",
            channelTitle: "Bre Ellis",
            publishedAt: "2024-10-12T00:00:00Z",
            viewCount: 21453,
            likeCount: 987,
            topicId: "raising-chickens"
          },
          {
            id: "wuOd5_M9yDQ",
            title: "Raising Chickens: Everything You Need To Know!",
            description: "Comprehensive beginner's guide covering chicken coop design, breed selection, feeding requirements, healthcare basics, predator protection, and egg collection. Perfect for new homesteaders planning their first flock.",
            thumbnailUrl: "https://i.ytimg.com/vi/wuOd5_M9yDQ/mqdefault.jpg",
            channelTitle: "Epic Homesteading",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 45672,
            likeCount: 2143,
            topicId: "raising-chickens"
          },
          {
            id: "mQYc7v39WzY",
            title: "6 Reasons to Add Sheep to Your Homestead",
            description: "PJ explains why sheep make excellent additions to homestead operations: natural lawn mowing, wool production, meat source, land clearing abilities, relatively low maintenance needs, and integration with other livestock systems.",
            thumbnailUrl: "https://i.ytimg.com/vi/mQYc7v39WzY/mqdefault.jpg",
            channelTitle: "PJ Howland",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 18734,
            likeCount: 823,
            topicId: "raising-chickens"
          }
        ],
        "water-harvesting": [
          {
            id: "F24XPaTYns4",
            title: "Arizona Homesteading: Rainwater Harvesting",
            description: "Practical demonstration of rainwater collection systems specifically designed for Arizona's arid climate. Shows guttering installation, storage tank selection, filtration methods, and maximizing water capture during brief desert storms.",
            thumbnailUrl: "https://i.ytimg.com/vi/F24XPaTYns4/mqdefault.jpg",
            channelTitle: "Frugal Off Grid",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 27654,
            likeCount: 1143,
            topicId: "water-harvesting"
          },
          {
            id: "79s_PJ0E2CQ",
            title: "Rain Water Harvesting System Top Mistakes! Don't Make These!",
            description: "Reveals the most common and costly mistakes people make when installing rainwater harvesting systems. Covers improper tank placement, inadequate filtration, mosquito breeding prevention, overflow management, and maintenance failures that can ruin your investment.",
            thumbnailUrl: "https://i.ytimg.com/vi/79s_PJ0E2CQ/mqdefault.jpg",
            channelTitle: "Country Living Experience: A Homesteading Journey",
            publishedAt: "2024-10-08T00:00:00Z",
            viewCount: 19834,
            likeCount: 876,
            topicId: "water-harvesting"
          },
          {
            id: "Al4dXQUMgaY",
            title: "EPIC 40,000 Gallon Off Grid Rainwater System Tour In The Desert",
            description: "Incredible walkthrough of a massive off-grid rainwater collection system in the desert. Features multiple catchment surfaces, sophisticated pump systems, automated controls, and demonstrates how to achieve water independence even in extremely dry climates.",
            thumbnailUrl: "https://i.ytimg.com/vi/Al4dXQUMgaY/mqdefault.jpg",
            channelTitle: "Handeeman",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 52431,
            likeCount: 2187,
            topicId: "water-harvesting"
          }
        ],
        "off-grid-water-systems": [
          {
            id: "water1mno",
            title: "Well Drilling and Water Sources",
            description: "Comprehensive guide to locating, drilling, and developing water sources for off-grid properties. Covers water table assessment, drilling techniques, pump selection, and water quality testing for safe homestead water supplies.",
            thumbnailUrl: "https://i.ytimg.com/vi/water1mno/mqdefault.jpg",
            channelTitle: "Kris Harbour Natural Building",
            publishedAt: "2024-10-11T00:00:00Z",
            viewCount: 31245,
            likeCount: 1432,
            topicId: "off-grid-water-systems"
          },
          {
            id: "water2pqr",
            title: "Gravity Fed Water Systems",
            description: "Engineering and building gravity-fed water distribution systems for remote homesteads. Demonstrates elevation planning, pipe sizing, pressure calculations, and storage tank placement for reliable water delivery without electricity.",
            thumbnailUrl: "https://i.ytimg.com/vi/water2pqr/mqdefault.jpg",
            channelTitle: "Simple Living Alaska",
            publishedAt: "2024-10-07T00:00:00Z",
            viewCount: 24567,
            likeCount: 1098,
            topicId: "off-grid-water-systems"
          },
          {
            id: "water3stu",
            title: "Water Purification and Treatment",
            description: "Advanced water treatment and purification methods for safe homestead water supplies. Covers filtration systems, UV sterilization, chemical treatment options, and ongoing water quality monitoring for off-grid properties.",
            thumbnailUrl: "https://i.ytimg.com/vi/water3stu/mqdefault.jpg",
            channelTitle: "Modern Survivalist",
            publishedAt: "2024-10-02T00:00:00Z",
            viewCount: 18934,
            likeCount: 743,
            topicId: "off-grid-water-systems"
          }
        ],
        "herbal-medicine": [
          {
            id: "herb1jkl",
            title: "Medicinal Plant Cultivation",
            description: "Complete guide to growing and harvesting medicinal plants on your homestead. Covers soil preparation, plant selection for climate zones, organic growing methods, proper harvesting timing, and sustainable cultivation practices.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb1jkl/mqdefault.jpg",
            channelTitle: "Mountain Rose Herbs",
            publishedAt: "2024-10-13T00:00:00Z",
            viewCount: 26789,
            likeCount: 1189,
            topicId: "herbal-medicine"
          },
          {
            id: "herb2ghi",
            title: "Making Herbal Remedies at Home",
            description: "Step-by-step instructions for preparing tinctures, salves, teas, and other herbal remedies from homegrown herbs. Includes extraction methods, proper dosing, storage techniques, and safety considerations for home preparation.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb2ghi/mqdefault.jpg",
            channelTitle: "Herbal Academy",
            publishedAt: "2024-10-09T00:00:00Z",
            viewCount: 19456,
            likeCount: 823,
            topicId: "herbal-medicine"
          },
          {
            id: "herb3def",
            title: "Herb Drying and Storage Methods",
            description: "Professional techniques for properly drying and storing medicinal herbs for maximum potency and long-term preservation. Covers air drying, dehydrator methods, proper storage containers, and maintaining herb quality over time.",
            thumbnailUrl: "https://i.ytimg.com/vi/herb3def/mqdefault.jpg",
            channelTitle: "Traditional Medicinals",
            publishedAt: "2024-10-04T00:00:00Z",
            viewCount: 22134,
            likeCount: 954,
            topicId: "herbal-medicine"
          }
        ],
        "homestead-security": [
          {
            id: "H7hhUq8UkfI",
            title: "5 Reason to Move to Cochise County Arizona for Offgrid Living / Homesteading",
            description: "I moved to Cochise County / Bisbee area about two years ago. What have I learned? What's the good, the bad, and the ugly? This is Part 1 in which I share my top 5 reasons why moving to Cochise County is a good idea, why it will improve your life. This will be most relevant to people looking to live off the grid, but anyone who wants a better quality of life with a lower cost of living might find this helpful.",
            thumbnailUrl: "https://i.ytimg.com/vi/H7hhUq8UkfI/mqdefault.jpg",
            channelTitle: "Outdoor Boys",
            publishedAt: "2024-10-29T10:54:44.000Z",
            viewCount: 25843,
            likeCount: 1203,
            topicId: "homestead-security"
          },
          {
            id: "yKgfayM9FYU",
            title: "15 Hidden Security Threats to Your Homestead (Be Prepared)",
            description: "Discover the most overlooked security vulnerabilities that could compromise your homestead's safety. From digital threats to physical weaknesses, learn how to identify and protect against dangers that most homesteaders never consider until it's too late.",
            thumbnailUrl: "https://i.ytimg.com/vi/yKgfayM9FYU/mqdefault.jpg",
            channelTitle: "The Modern Survivalist",
            publishedAt: "2024-10-25T14:30:00.000Z",
            viewCount: 18765,
            likeCount: 743,
            topicId: "homestead-security"
          },
          {
            id: "mQYc7v39WzY",
            title: "Building the Ultimate Homestead Security System on a Budget",
            description: "Complete guide to creating comprehensive homestead security without breaking the bank. Covers motion sensors, cameras, perimeter alarms, communication systems, and backup power solutions that work together to protect your family and property.",
            thumbnailUrl: "https://i.ytimg.com/vi/mQYc7v39WzY/mqdefault.jpg",
            channelTitle: "Homestead Defense",
            publishedAt: "2024-10-21T16:45:00.000Z",
            viewCount: 31456,
            likeCount: 1287,
            topicId: "homestead-security"
          }
        ],
        "soil-building-in-arid-climates": [
          {
            id: "soil1jkl",
            title: "Desert Soil Improvement Techniques",
            description: "Proven methods for building fertile soil in desert and arid climate conditions. Covers soil amendment strategies, organic matter incorporation, mineral balancing, and creating microbial activity in challenging desert environments.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil1jkl/mqdefault.jpg",
            channelTitle: "Desert Farming Initiative",
            publishedAt: "2024-10-14T00:00:00Z",
            viewCount: 29345,
            likeCount: 1298,
            topicId: "soil-building-in-arid-climates"
          },
          {
            id: "soil2mno",
            title: "Mulching for Water Retention",
            description: "Using mulch and cover crops to improve soil moisture retention and structure in dry climates. Demonstrates mulch types, application techniques, cover crop selection, and integrated soil building strategies.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil2mno/mqdefault.jpg",
            channelTitle: "Arid Land Permaculture",
            publishedAt: "2024-10-10T00:00:00Z",
            viewCount: 17865,
            likeCount: 743,
            topicId: "soil-building-in-arid-climates"
          },
          {
            id: "soil3pqr",
            title: "Composting in Hot Dry Climates",
            description: "Effective composting methods specifically adapted for arid and semi-arid regions. Covers moisture management, temperature control, composting materials selection, and troubleshooting common hot climate composting challenges.",
            thumbnailUrl: "https://i.ytimg.com/vi/soil3pqr/mqdefault.jpg",
            channelTitle: "Desert Dwellers",
            publishedAt: "2024-10-05T00:00:00Z",
            viewCount: 23457,
            likeCount: 1065,
            topicId: "soil-building-in-arid-climates"
          }
        ]
      };
      
      // Find the video by searching all topics
      let foundVideo = null;
      for (const topicSlug in videosByTopic) {
        const videos = videosByTopic[topicSlug];
        foundVideo = videos.find(video => video.id === videoId);
        if (foundVideo) break;
      }
      
      // Return found video or fallback
      if (foundVideo) {
        return res.status(200).json(foundVideo);
      } else {
        // Generic fallback for any video ID not in our system
        const video = {
          id: videoId,
          title: "Homesteading Tutorial Video",
          description: "Learn essential homesteading techniques with this comprehensive guide. Perfect for beginners and experienced homesteaders alike.",
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelTitle: "Homesteading Guide",
          publishedAt: "2024-10-15T00:00:00Z",
          viewCount: 15000,
          likeCount: 500,
          topicId: "beekeeping"
        };
        return res.status(200).json(video);
      }
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
