// Production API handler - stable working version before ranking text

// Function to decode HTML entities like &#39; to apostrophes
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
      
      // Get videos from database
      try {
        const { Client } = require('pg');
        const client = new Client({
          connectionString: process.env.DATABASE_URL,
        });
        
        await client.connect();
        
        // Get videos for this topic from database
        const query = `
          SELECT v.*, t.slug as topic_slug 
          FROM youtube_videos v 
          JOIN topics t ON v.topic_id = t.id 
          WHERE t.slug = $1 
          ORDER BY v.is_arizona_specific ASC, v.ranking ASC
        `;
        
        const result = await client.query(query, [slug]);
        await client.end();
        
        if (result.rows.length > 0) {
          // Transform database rows to match frontend format
          const videos = result.rows.map(row => ({
            id: row.id,
            title: decodeHTMLEntities(row.title),
            description: decodeHTMLEntities(row.description || ''),
            thumbnailUrl: row.thumbnail_url,
            channelTitle: decodeHTMLEntities(row.channel_title),
            publishedAt: row.published_at,
            viewCount: row.view_count || 0,
            likeCount: row.like_count || 0,
            topicId: slug,
            isArizonaSpecific: row.is_arizona_specific || false
          }));
          
          return res.status(200).json(videos);
        }
        
        // If no database results, fall back to hardcoded data
        console.log(`No database videos found for ${slug}, using fallback data`);
        
      } catch (dbError) {
        console.error('Database error:', dbError);
        console.log('Falling back to hardcoded video data');
      }
      
      // Fallback: Topic-specific video data for when database is unavailable
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
            topicId: slug
          },
          {
            id: "tkYS4IhP12w",
            title: "Beekeeping 101: The Hive",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/tkYS4IhP12w/mqdefault.jpg",
            channelTitle: "Greenhorn Grove",
            publishedAt: "2024-03-11T10:55:54Z",
            viewCount: 18577,
            likeCount: 1811,
            topicId: slug
          },
          {
            id: "7Va-jUCYS2I",
            title: "Biggest mistake new Beekeepers make!",
            description: "Everyone is teaching \"big farma\" beekeeping and we want to change that! Most videos you see are heavy on the sugar water, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/7Va-jUCYS2I/mqdefault.jpg",
            channelTitle: "OFF GRID with DOUG & STACY",
            publishedAt: "2024-04-27T19:44:08Z",
            viewCount: 58309,
            likeCount: 1069,
            topicId: slug
          },
          {
            id: "jeFxOUZreXI",
            title: "HOW TO START BEEKEEPING for the Absolute Beginner | Become a Beekeeper | Beekeeping 101",
            description: "Want to become a beekeeper? This is an introduction to beekeeping that outlines the steps you need to take in order to become a ...",
            thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg",
            channelTitle: "Beekeeping Made Simple",
            publishedAt: "2023-11-18T23:01:44Z",
            viewCount: 31779,
            likeCount: 2013,
            topicId: slug
          },
          {
            id: "u85saevOZrI",
            title: "Homestead Beekeeping the Natural and Organic Way | Adam Martin of Bee Kept",
            description: "As a homesteader who values organic and sustainable farming practices, Adam looked around and wondered why he couldn't ...",
            thumbnailUrl: "https://i.ytimg.com/vi/u85saevOZrI/mqdefault.jpg",
            channelTitle: "Homesteaders of America",
            publishedAt: "2025-02-26T12:45:11Z",
            viewCount: 17435,
            likeCount: 1453,
            topicId: slug
          },
          {
            id: "E4xFjXGk0lU",
            title: "Natural Bee keeping in a Horizontal Hive works Too GOOD!",
            description: "Doug and Stacy live in a log cabin like the Pioneers. They support the Bee population and help provide them a safe place to live ...",
            thumbnailUrl: "https://i.ytimg.com/vi/E4xFjXGk0lU/mqdefault.jpg",
            channelTitle: "OFF GRID with DOUG & STACY",
            publishedAt: "2020-06-16T21:20:05Z",
            viewCount: 34717,
            likeCount: 925,
            topicId: slug
          },
          {
            id: "nZTQIiJiFn4",
            title: "Our Beehive SWARMED! Too Much HONEY!",
            description: "Our beehive was almost lost when the bees swarmed to find more space to live. The hive was totally full of honey!",
            thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-10-29T10:54:44Z",
            viewCount: 59789,
            likeCount: 832,
            topicId: slug
          },
          {
            id: "-Geg9GSnEeo",
            title: "How to Grow a TON of HONEY with ONE Beehive in Just 8 Months!",
            description: "In this video, I give you 5 tips on how to grow a ton of honey with one beehive in just 8 months! Order my book here: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-Geg9GSnEeo/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2024-03-09T13:05:40Z",
            viewCount: 10825,
            likeCount: 2433,
            topicId: slug
          },
          {
            id: "lxfU9Elp680",
            title: "Natural beekeeping Warre hive management and uncovering Bee keeper beekeeping naturally",
            description: "Natural beekeeping Warre hive management and uncovering Bee keeper beekeeping naturally You can read about our bee ...",
            thumbnailUrl: "https://i.ytimg.com/vi/lxfU9Elp680/mqdefault.jpg",
            channelTitle: "Kevin Wallace",
            publishedAt: "2017-02-24T11:19:07Z",
            viewCount: 28405,
            likeCount: 2324,
            topicId: slug
          },
          {
            id: "tsXg1fTxBvw",
            title: "HOMESTEAD BEEKEEPING - Natural Ant Repellant",
            description: "Canela Molida is not real cinamon, but I use it as an ant repellant around my bee yard. Join my wife and myself on our adventure ...",
            thumbnailUrl: "https://i.ytimg.com/vi/tsXg1fTxBvw/mqdefault.jpg",
            channelTitle: "PINE MEADOWS HOBBY FARM A Frugal Homestead",
            publishedAt: "2017-10-31T14:36:46Z",
            viewCount: 18611,
            likeCount: 1121,
            topicId: slug
          },
          {
            id: "nA4c654Ecd0",
            title: "Beekeeping in the Desert",
            description: "Beekeeping in the Desert is very challenging and rewarding.",
            thumbnailUrl: "https://i.ytimg.com/vi/nA4c654Ecd0/mqdefault.jpg",
            channelTitle: "Vegas Bees",
            publishedAt: "2023-02-04T11:26:33Z",
            viewCount: 6323,
            likeCount: 1295,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "zjnIPw8_bHU",
            title: "Raising Native Bees in Arizona - Year 2",
            description: "This video summarizes my experience and lessons learned from nurturing native leaf-cutter bees in my backyard over a period of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/zjnIPw8_bHU/mqdefault.jpg",
            channelTitle: "Modest Maker",
            publishedAt: "2022-05-12T19:48:07Z",
            viewCount: 12917,
            likeCount: 1437,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "composting": [
          {
            id: "nxTzuasQLFo",
            title: "How to make Compost - The Simplest Easy Method To Compost Piles!",
            description: "Complete guide start to finish on composting. This is the most basic and simple way to compost. In this video you will learn: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/nxTzuasQLFo/mqdefault.jpg",
            channelTitle: "Growit Buildit",
            publishedAt: "2020-11-14T16:45:01Z",
            viewCount: 32685,
            likeCount: 2084,
            topicId: slug
          },
          {
            id: "Y0o0xmDn3eA",
            title: "5 Composting Myths You Should Stop Believing Right Now",
            description: "What if I told you your compost should actually smell GOOD?? In this video, we bust the top 5 myths and misconceptions about ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Y0o0xmDn3eA/mqdefault.jpg",
            channelTitle: "Epic Gardening",
            publishedAt: "2023-04-29T19:32:03Z",
            viewCount: 46013,
            likeCount: 519,
            topicId: slug
          },
          {
            id: "qSLBhavAu9w",
            title: "How to build a compost bin",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/qSLBhavAu9w/mqdefault.jpg",
            channelTitle: "The Homesteading RD",
            publishedAt: "2022-11-26T22:08:52Z",
            viewCount: 43463,
            likeCount: 816,
            topicId: slug
          },
          {
            id: "0oWTHYExjkA",
            title: "I Found the Easiest Compost System!",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/0oWTHYExjkA/mqdefault.jpg",
            channelTitle: "Greenhorn Grove",
            publishedAt: "2025-03-12T10:00:03Z",
            viewCount: 14902,
            likeCount: 1124,
            topicId: slug
          },
          {
            id: "HLbwOkAf-iw",
            title: "Here are 5 ways you can make compost at home and reduce landfill. #EarthDay #YouTubePartner",
            description: "In this video, I show you five easy ways to make compost at home to save money, help your garden, and benefit the planet by ...",
            thumbnailUrl: "https://i.ytimg.com/vi/HLbwOkAf-iw/mqdefault.jpg",
            channelTitle: "Self Sufficient Me",
            publishedAt: "2023-04-24T23:13:19Z",
            viewCount: 33732,
            likeCount: 2231,
            topicId: slug
          },
          {
            id: "sEqsO4XnUPM",
            title: "How I Make HEAPS of Compost in My Backyard (Feat. Chickens)",
            description: "Want to know how to make compost at scale without it becoming a full-time job? I walk you through my low-effort, high-yield ...",
            thumbnailUrl: "https://i.ytimg.com/vi/sEqsO4XnUPM/mqdefault.jpg",
            channelTitle: "Ben Strong - Urban Homestead",
            publishedAt: "2024-07-28T08:22:19Z",
            viewCount: 10612,
            likeCount: 628,
            topicId: slug
          },
          {
            id: "MnfEYeWNoC0",
            title: "Composting 101: The 4 Key Ingredients 🌱",
            description: "Want to create amazing compost that nourishes your garden? Here are the four key ingredients that are essential for successful ...",
            thumbnailUrl: "https://i.ytimg.com/vi/MnfEYeWNoC0/mqdefault.jpg",
            channelTitle: "Banana Compost",
            publishedAt: "2024-10-02T16:47:08Z",
            viewCount: 31634,
            likeCount: 1141,
            topicId: slug
          },
          {
            id: "3GZ4EgD-0x0",
            title: "Make Your Own Compost (JOSH&#39;S EASY METHOD)",
            description: "Composting can seem like a mystery. Some people throw everything in a pile and let it break down over time, on the other ...",
            thumbnailUrl: "https://i.ytimg.com/vi/3GZ4EgD-0x0/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2021-05-29T12:00:05Z",
            viewCount: 37875,
            likeCount: 583,
            topicId: slug
          },
          {
            id: "HXl_OjG4dsk",
            title: "Let&#39;s Build a Winning Compost Pile - Part 1: Sourcing Diverse Ingredients for a High-Quality Soil",
            description: "thefoodforestnamibia @TheFFOz @BESHYSBEES In Part One of our compost challenge series, we take you on a mission across ...",
            thumbnailUrl: "https://i.ytimg.com/vi/HXl_OjG4dsk/mqdefault.jpg",
            channelTitle: "Green and Abundant Namibia",
            publishedAt: "2025-07-22T20:53:42Z",
            viewCount: 57746,
            likeCount: 2401,
            topicId: slug
          },
          {
            id: "_K25WjjCBuw",
            title: "How To Make Compost - Fast and Easy",
            description: "For more videos on composting, watch these next: How to Make a Compost Bin from Pallets https://youtu.be/fW_DVNUt7ms ...",
            thumbnailUrl: "https://i.ytimg.com/vi/_K25WjjCBuw/mqdefault.jpg",
            channelTitle: "GrowVeg",
            publishedAt: "2022-11-05T15:45:02Z",
            viewCount: 27103,
            likeCount: 596,
            topicId: slug
          },
          {
            id: "Eb0LtsNBfos",
            title: "5 Tips for Desert Composting",
            description: "In this video we share 5 of our favorite tips for folks who are new to composting in the desert southwest! 1: 2:25 Start Small 2: 3:43 ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Eb0LtsNBfos/mqdefault.jpg",
            channelTitle: "Southwest Victory Gardens",
            publishedAt: "2020-04-02T14:05:11Z",
            viewCount: 18867,
            likeCount: 606,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 31346,
            likeCount: 1644,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "diy-home-maintenance": [
          {
            id: "LxcQQ18ElqQ",
            title: "Ram Pump Maintenance 🤝🛠️💧#diy #homestead #life #offgrid #water #system #selfsufficient",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/LxcQQ18ElqQ/mqdefault.jpg",
            channelTitle: "Modern Rural Civilian",
            publishedAt: "2025-01-04T18:51:01Z",
            viewCount: 31888,
            likeCount: 1928,
            topicId: slug
          },
          {
            id: "PtV98H-9pBw",
            title: "Off-grid Antique Ram Pump Restoration Part 2💧🛠️ #diy #idaho #homestead #life #antique #ram #pump",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/PtV98H-9pBw/mqdefault.jpg",
            channelTitle: "Modern Rural Civilian",
            publishedAt: "2024-08-27T16:42:49Z",
            viewCount: 57233,
            likeCount: 1017,
            topicId: slug
          },
          {
            id: "VTDe1f56z9g",
            title: "CAN WE FIX THIS...? I COUPLE BUILDS OFF GRID HOMESTEAD",
            description: "If you're interested in a high quality desk. Join FlexiSpot Fall Sale Now! Up to $160 OFF!https://bit.ly/3qYk6xC . FlexiSpot Pro Plus ...",
            thumbnailUrl: "https://i.ytimg.com/vi/VTDe1f56z9g/mqdefault.jpg",
            channelTitle: "Life Elevated Off Grid",
            publishedAt: "2022-09-25T15:00:31Z",
            viewCount: 48168,
            likeCount: 518,
            topicId: slug
          },
          {
            id: "VoD2UQ_KBa0",
            title: "Off-Grid Homestead Backup Power System 🔋🔋#diy #idaho #homestead #life #offgrid #powerstation",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/VoD2UQ_KBa0/mqdefault.jpg",
            channelTitle: "Modern Rural Civilian",
            publishedAt: "2024-08-28T20:53:44Z",
            viewCount: 27584,
            likeCount: 503,
            topicId: slug
          },
          {
            id: "ZfHlhBk26vo",
            title: "Off grid solar homestead ( Ford diesel tractor repair)",
            description: "Just helping a brother get his tractor running again. I'm going to rewire it and do a complete service. Engine oil and filter, hydraulic ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ZfHlhBk26vo/mqdefault.jpg",
            channelTitle: "Off Grid In The Pacific North West",
            publishedAt: "2016-02-09T02:20:38Z",
            viewCount: 55642,
            likeCount: 794,
            topicId: slug
          },
          {
            id: "ABGC5h3i2yY",
            title: "Off-Grid Water System Upgrade 🤝🛠️💧 #diy #homestead #life #offgrid #water #system #fix",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/ABGC5h3i2yY/mqdefault.jpg",
            channelTitle: "Modern Rural Civilian",
            publishedAt: "2025-01-05T17:50:53Z",
            viewCount: 15897,
            likeCount: 2468,
            topicId: slug
          },
          {
            id: "zI-3xuhNx9U",
            title: "Glue that sticks to plastic fuel tanks to repair cracks in tanks",
            description: "Fuel Primer bulbs on chainsaws/ whipper snippers ( weed wacker, grass trimmer etc) how they work, how to replace them and ...",
            thumbnailUrl: "https://i.ytimg.com/vi/zI-3xuhNx9U/mqdefault.jpg",
            channelTitle: "Aussie Homestead",
            publishedAt: "2024-10-15T09:23:54Z",
            viewCount: 17792,
            likeCount: 900,
            topicId: slug
          },
          {
            id: "EZWJVsn2D3A",
            title: "Solar Power for dummies, This system is easy!",
            description: "Renogy solar is possibly the best Solar Power set up for the beginner or novice! 5 Strings Solar Combiner Box Perfect for both ...",
            thumbnailUrl: "https://i.ytimg.com/vi/EZWJVsn2D3A/mqdefault.jpg",
            channelTitle: "OFF GRID with DOUG & STACY",
            publishedAt: "2022-12-20T20:44:39Z",
            viewCount: 34981,
            likeCount: 951,
            topicId: slug
          },
          {
            id: "aZCEhWRMzo8",
            title: "Off-grid Antique Ram Pump Restoration Part 3💧🛠️ #diy #idaho #homestead #life #antique #ram #pump",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/aZCEhWRMzo8/mqdefault.jpg",
            channelTitle: "Modern Rural Civilian",
            publishedAt: "2024-09-02T15:03:58Z",
            viewCount: 37718,
            likeCount: 2194,
            topicId: slug
          },
          {
            id: "A-iZowT0qk8",
            title: "How to do basic maintenance on your off grid lead acid solar battery bank #homestead #offgrid",
            description: "Taking care of lead acid batteries can be fairly simple and straight forward. Just make sure they're topped off with Distilled water, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/A-iZowT0qk8/mqdefault.jpg",
            channelTitle: "Windwalker Homestead",
            publishedAt: "2022-12-21T14:00:04Z",
            viewCount: 16768,
            likeCount: 1008,
            topicId: slug
          },
          {
            id: "OHIT75qoBQ8",
            title: "Buying Land in Arizona? | Watch This First!",
            description: "Many of us dream of owning our own piece of land, far away from the noise of the city. Does your dream include owning a piece of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/OHIT75qoBQ8/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2021-10-02T19:00:06Z",
            viewCount: 21226,
            likeCount: 1656,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 23445,
            likeCount: 1170,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "food-preservation": [
          {
            id: "kNXWn-3QYI8",
            title: "What Can We Get Done in 3 Hours? Canning &amp; Dehydrating | Preserving the Harvest | Food Preservation",
            description: "Spend the afternoon with me getting as much food preservation done as we can in a short window of time. A full day of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/kNXWn-3QYI8/mqdefault.jpg",
            channelTitle: "Abbey Verigin",
            publishedAt: "2023-09-02T13:00:38Z",
            viewCount: 45215,
            likeCount: 983,
            topicId: slug
          },
          {
            id: "hU9C4rbK6wg",
            title: "How to Preserve a Year&#39;s Worth of Food WITHOUT GOING INSANE",
            description: "Preserving food doesn't have to put you under. Let's talk strategies. Thanks to LMNT for sponsoring this video! Head to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/hU9C4rbK6wg/mqdefault.jpg",
            channelTitle: "More Than Farmers",
            publishedAt: "2024-08-26T13:00:47Z",
            viewCount: 37172,
            likeCount: 1749,
            topicId: slug
          },
          {
            id: "1VwcZRhRJl0",
            title: "Freeze Drying vs. Dehydrating How are they Different?",
            description: "What's the difference between freeze-drying and dehydrating? Quite a bit actually! So which one is better? BOTH! See why I love ...",
            thumbnailUrl: "https://i.ytimg.com/vi/1VwcZRhRJl0/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2022-04-02T12:00:01Z",
            viewCount: 51126,
            likeCount: 1847,
            topicId: slug
          },
          {
            id: "10YMhZmYTyE",
            title: "Food Preservation Methods and Their Benefits",
            description: "Vintage Canning Charts: https://www.patreon.com/posts/vintage-water-55550513 Home Canning for Beginners: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/10YMhZmYTyE/mqdefault.jpg",
            channelTitle: "Rain Country",
            publishedAt: "2025-07-15T13:00:03Z",
            viewCount: 25775,
            likeCount: 1456,
            topicId: slug
          },
          {
            id: "zJ43J2UsIV0",
            title: "How we preserve whole tomatoes for Winter 🍅 #growyourownfood #canning #offgridliving",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/zJ43J2UsIV0/mqdefault.jpg",
            channelTitle: "Homegrown Handgathered",
            publishedAt: "2024-09-23T12:23:59Z",
            viewCount: 35408,
            likeCount: 1994,
            topicId: slug
          },
          {
            id: "s-bvQOZcJG4",
            title: "Preserve WHOLE Apples - No canning or dehydration. #homesteading #foodpreservation #shorts",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/s-bvQOZcJG4/mqdefault.jpg",
            channelTitle: "The Acadian Garden & Apothecary",
            publishedAt: "2023-01-20T13:11:33Z",
            viewCount: 21766,
            likeCount: 959,
            topicId: slug
          },
          {
            id: "jh4oUAKAb0o",
            title: "I Lost $100s in Stored Food Until I Learned THIS (How to Store Freeze Dried Food)",
            description: "There's nothing worse than going to all the effort of freeze drying your food and storing it on the shelf, only to come back later and ...",
            thumbnailUrl: "https://i.ytimg.com/vi/jh4oUAKAb0o/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2024-11-13T13:01:01Z",
            viewCount: 42062,
            likeCount: 1590,
            topicId: slug
          },
          {
            id: "LVzEfWt5ooc",
            title: "I Will NEVER Can Another Tomato (Freeze Dried Tomatoes &amp; How to Use Them)",
            description: "I used to spend weeks on end canning up all the tomatoes from the garden into various tomato products. Though I loved having ...",
            thumbnailUrl: "https://i.ytimg.com/vi/LVzEfWt5ooc/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2024-08-28T12:00:33Z",
            viewCount: 30554,
            likeCount: 1204,
            topicId: slug
          },
          {
            id: "zZMxpMvY1zI",
            title: "A Week of Food Preservation | Homesteading VLOG",
            description: "It's peak gardening season here in Zone 6b, which means it's also peak season for food preservation. I'm participating in the ...",
            thumbnailUrl: "https://i.ytimg.com/vi/zZMxpMvY1zI/mqdefault.jpg",
            channelTitle: "Heritage Homestead",
            publishedAt: "2024-08-18T16:01:00Z",
            viewCount: 16965,
            likeCount: 1732,
            topicId: slug
          },
          {
            id: "B_4Oc-RKt8M",
            title: "Introduction to Dehydrating - Preservation 101",
            description: "All about dehydrating! Different methods for dehydrating, what food works best, plus tips and tricks! Dehydration is another great ...",
            thumbnailUrl: "https://i.ytimg.com/vi/B_4Oc-RKt8M/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2020-10-11T10:00:03Z",
            viewCount: 42934,
            likeCount: 1120,
            topicId: slug
          },
          {
            id: "eZV6wZpxcOE",
            title: "Storing Mangos 🥭 in Desert Sand for 24 Hours – Desert Sand Experiment! Part 1 #lifehacks #experiment",
            description: "1. 24 Hours in Desert Sand: Mangos Storage Experiment!- Part 1 2. Can Mangos Survive 24 Hrs in Desert Sand? Part 1 3.",
            thumbnailUrl: "https://i.ytimg.com/vi/eZV6wZpxcOE/mqdefault.jpg",
            channelTitle: "Deserts facts",
            publishedAt: "2025-07-05T05:09:53Z",
            viewCount: 15356,
            likeCount: 314,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 9584,
            likeCount: 851,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "herbal-medicine": [
          {
            id: "Bh7HUetelMc",
            title: "Grow Your Own Pharmacy, 10 Healing Herbs You Need! 🌿",
            description: "ORDER MY NEW BOOK PLANT TO PLATE NOW geni.us/planttoplate ❤️ this is my list of the top ingredients I grow for the ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Bh7HUetelMc/mqdefault.jpg",
            channelTitle: "Gaz Oakley",
            publishedAt: "2024-09-25T18:00:15Z",
            viewCount: 27390,
            likeCount: 1703,
            topicId: slug
          },
          {
            id: "e70QcEmnNj8",
            title: "Natural Medicine | Herbs I Store and How I Use Them!",
            description: "Hey Friend, Join me in my home for a tour of my homestead herbal apothecary. I'm sharing all the herbs and tools I store to keep ...",
            thumbnailUrl: "https://i.ytimg.com/vi/e70QcEmnNj8/mqdefault.jpg",
            channelTitle: "Seed and Sparrow Homestead",
            publishedAt: "2024-10-25T14:00:42Z",
            viewCount: 47846,
            likeCount: 2301,
            topicId: slug
          },
          {
            id: "iz0fhrxLDtw",
            title: "How to START Using Medicinal Herbs",
            description: "We are so excited to have Veterinarian and Herb Specialist Doc Jones with us today to discuss how to start using medicinal herbs.",
            thumbnailUrl: "https://i.ytimg.com/vi/iz0fhrxLDtw/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2022-09-17T12:00:34Z",
            viewCount: 37072,
            likeCount: 1233,
            topicId: slug
          },
          {
            id: "BNWmyfVqQOc",
            title: "WHEN &amp; HOW TO HARVEST HERBS FOR MEDICINAL USES",
            description: "Knowing when to harvest your medicinal herbs is different depending on what part of the plant you'll be using for medicinal ...",
            thumbnailUrl: "https://i.ytimg.com/vi/BNWmyfVqQOc/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2020-08-26T12:00:02Z",
            viewCount: 53806,
            likeCount: 1122,
            topicId: slug
          },
          {
            id: "U-_G5xaxMWU",
            title: "The Must Have HERB BOOKS You Need on Your Bookshelf",
            description: "In this video I share with you my TOP herb books that are a must have on every herbalist's shelf! #herbs #herbalism #herbalist ...",
            thumbnailUrl: "https://i.ytimg.com/vi/U-_G5xaxMWU/mqdefault.jpg",
            channelTitle: "Amy K. Fewell",
            publishedAt: "2021-10-14T19:03:26Z",
            viewCount: 42306,
            likeCount: 1587,
            topicId: slug
          },
          {
            id: "EqE3gvH1_e0",
            title: "YIKES! A Professional Herbalist Inspects My Medicinal Cottage Garden",
            description: "My medicinal herb garden is a few years old now, but I've never had a professional herbalist inspect it! What will he say?",
            thumbnailUrl: "https://i.ytimg.com/vi/EqE3gvH1_e0/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2022-08-27T12:00:08Z",
            viewCount: 24782,
            likeCount: 2051,
            topicId: slug
          },
          {
            id: "MOd8mCYw1Sc",
            title: "10 Must-Have Herbs That Every Homestead Needs",
            description: "Discover the must-have herbs every homesteader should grow — not just for your family, but for your animals too! Digital ID ...",
            thumbnailUrl: "https://i.ytimg.com/vi/MOd8mCYw1Sc/mqdefault.jpg",
            channelTitle: "Ali's Organic Garden & Homestead",
            publishedAt: "2025-04-19T22:29:30Z",
            viewCount: 33704,
            likeCount: 1233,
            topicId: slug
          },
          {
            id: "UnyB6mQlLZA",
            title: "12 MUST-KNOW Backyard Medicinal Herbs (Foraging Medicinal Herbs)",
            description: "Learn about urban foraging and the skillsets needed to forage for food in your surrounding areas. Whether you are living in a rural ...",
            thumbnailUrl: "https://i.ytimg.com/vi/UnyB6mQlLZA/mqdefault.jpg",
            channelTitle: "Homesteading Family",
            publishedAt: "2024-04-27T12:00:33Z",
            viewCount: 52931,
            likeCount: 1739,
            topicId: slug
          },
          {
            id: "ySNLQvousl4",
            title: "How to Make Cannabis Tinctures | Beginner-Friendly Masterclass",
            description: "Discover the world of cannabis tinctures with this free replay of my beginner-friendly masterclass! Whether you're new to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ySNLQvousl4/mqdefault.jpg",
            channelTitle: "Emily Kyle 🍃 Cannabis Educator",
            publishedAt: "2025-07-21T18:52:48Z",
            viewCount: 27055,
            likeCount: 1566,
            topicId: slug
          },
          {
            id: "00MZ3TNikVk",
            title: "15 Medicinal Herbs and Their Uses for This Fall | Herb Garden Tour",
            description: "These 15 medicinal herbs are easy to grow at home! Join me for an herbal garden tour and learn which medicinal herbs and their ...",
            thumbnailUrl: "https://i.ytimg.com/vi/00MZ3TNikVk/mqdefault.jpg",
            channelTitle: "Melissa K. Norris - Modern Homesteading",
            publishedAt: "2020-08-12T23:00:00Z",
            viewCount: 39357,
            likeCount: 940,
            topicId: slug
          },
          {
            id: "UWFlO3VDE2U",
            title: "9 MEDICINAL &amp; EDIBLE Southwestern HERBS — Ep. 191",
            description: "I had recently traveled through the Tucson, Arizona region to capture some of the exemplar horticulture and iconic plants of the ...",
            thumbnailUrl: "https://i.ytimg.com/vi/UWFlO3VDE2U/mqdefault.jpg",
            channelTitle: "Flock Finger Lakes",
            publishedAt: "2023-08-01T11:00:31Z",
            viewCount: 28450,
            likeCount: 1285,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "7ujmpR3bLnY",
            title: "Healing America: My Top 3 Herbs in Each State- Arizona #herbal #arizona #flowers #nature #health",
            description: "Here's a quick video on my Top 3 Herbs From Arizona. Stay tuned for more. Leave a comment if there's something I can improve ...",
            thumbnailUrl: "https://i.ytimg.com/vi/7ujmpR3bLnY/mqdefault.jpg",
            channelTitle: "Where Science Meets Nature",
            publishedAt: "2023-03-28T13:06:51Z",
            viewCount: 9116,
            likeCount: 913,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "homestead-security": [
          {
            id: "niu34joWfcs",
            title: "Homestead Security - How Much Is Too Much?",
            description: "In this video we are improving our homestead security system. Security on your Homestead is a very important part of living the ...",
            thumbnailUrl: "https://i.ytimg.com/vi/niu34joWfcs/mqdefault.jpg",
            channelTitle: "Martin Johnson - Off Grid Living",
            publishedAt: "2021-05-08T14:12:20Z",
            viewCount: 34018,
            likeCount: 1258,
            topicId: slug
          },
          {
            id: "jLYECy2-t-0",
            title: "Home Security - How to Harden Your Home With Navy SEAL &quot;Coch&quot;",
            description: "Retired Navy SEAL, Mark \"Coch\" Cochiolo, talks about home security in this video. Specifically, he talks about how to harden your ...",
            thumbnailUrl: "https://i.ytimg.com/vi/jLYECy2-t-0/mqdefault.jpg",
            channelTitle: "Tactical Hyve",
            publishedAt: "2022-06-30T23:35:51Z",
            viewCount: 58644,
            likeCount: 2340,
            topicId: slug
          },
          {
            id: "2qJsXzlhDDM",
            title: "Rural and homestead security for everyday and these crazy times of high crime civil unrest.",
            description: "in these crazy times/ SHTF you have to protect your homestead. I do go over the importance of the Dakota alerts MURS driveway ...",
            thumbnailUrl: "https://i.ytimg.com/vi/2qJsXzlhDDM/mqdefault.jpg",
            channelTitle: "Homestead Reliance ",
            publishedAt: "2022-08-16T12:30:30Z",
            viewCount: 22863,
            likeCount: 1655,
            topicId: slug
          },
          {
            id: "j59YFqoscYY",
            title: "How to Secure Your Rural Property",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/j59YFqoscYY/mqdefault.jpg",
            channelTitle: "Alberta Provincial Rural Crime Watch Association",
            publishedAt: "2019-02-04T21:55:38Z",
            viewCount: 31225,
            likeCount: 1751,
            topicId: slug
          },
          {
            id: "dyCFM3C64JQ",
            title: "Rural Security 101: Ten tips for a safe farmyard",
            description: "Rural crime has been a major issue for a long time, but vehicle and equipment thefts appear to be rising. Farms are often remote ...",
            thumbnailUrl: "https://i.ytimg.com/vi/dyCFM3C64JQ/mqdefault.jpg",
            channelTitle: "RealAgriculture",
            publishedAt: "2024-10-16T15:17:59Z",
            viewCount: 33081,
            likeCount: 1015,
            topicId: slug
          },
          {
            id: "tyz5BaI7EDo",
            title: "Homestead Security",
            description: "https://linktr.ee/permapasturesfarm #Security #Homesteading #Permaculture Support the channel here: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/tyz5BaI7EDo/mqdefault.jpg",
            channelTitle: "Perma Pastures Farm",
            publishedAt: "2021-06-22T21:00:18Z",
            viewCount: 22284,
            likeCount: 646,
            topicId: slug
          },
          {
            id: "VaoBzNBMbD8",
            title: "Homestead SECURITY.",
            description: "Last episode of Modern Homestead was a fun one! We sharpened our skills with knife throwing, archery, and shooting. Check out ...",
            thumbnailUrl: "https://i.ytimg.com/vi/VaoBzNBMbD8/mqdefault.jpg",
            channelTitle: "Modern Homestead",
            publishedAt: "2023-12-18T16:06:20Z",
            viewCount: 58891,
            likeCount: 1407,
            topicId: slug
          },
          {
            id: "04I9FbgjDlY",
            title: "Homestead Security",
            description: "Stock up now on long term freeze dried food and many of your prepping needs at my store http://www.preparewithtravis.com ...",
            thumbnailUrl: "https://i.ytimg.com/vi/04I9FbgjDlY/mqdefault.jpg",
            channelTitle: "The Prepared Homestead",
            publishedAt: "2020-08-04T21:30:00Z",
            viewCount: 33761,
            likeCount: 1245,
            topicId: slug
          },
          {
            id: "-PNMycLZGaA",
            title: "Proof That Rural Living Doesn&#39;t Make You Safe",
            description: "Proof That Rural Living Doesn't Make You Safe Just because you move to a rural environment doesn't mean you're automatically ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-PNMycLZGaA/mqdefault.jpg",
            channelTitle: "Magic Prepper",
            publishedAt: "2023-09-22T23:00:00Z",
            viewCount: 13199,
            likeCount: 1685,
            topicId: slug
          },
          {
            id: "U_b9Fukv1dc",
            title: "Why I&#39;m Adding More Security On The Homestead",
            description: "These last few weeks have been crazy on the homestead. I quickly realized I needed to set up more security. ☟ Security Kit ...",
            thumbnailUrl: "https://i.ytimg.com/vi/U_b9Fukv1dc/mqdefault.jpg",
            channelTitle: "Gubba Homestead",
            publishedAt: "2022-11-16T18:42:09Z",
            viewCount: 10376,
            likeCount: 1028,
            topicId: slug
          },
          {
            id: "smAPSIC7BFA",
            title: "Start Your Homestead Dream: 1.25 Acres in Mohave County, AZ",
            description: "Are you dreaming of a place where your children can run free and you can build a self-sustainable future? This pristine 1.25-acre ...",
            thumbnailUrl: "https://i.ytimg.com/vi/smAPSIC7BFA/mqdefault.jpg",
            channelTitle: "Bear Fruit Properties",
            publishedAt: "2024-12-31T17:58:30Z",
            viewCount: 6367,
            likeCount: 1410,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "8YX8EIU8Bac",
            title: "Get An LLC To Avoid Paying High Taxes?",
            description: "Start eliminating debt for free with EveryDollar - https://ter.li/3w6nto Have a question for the show? Call 888-825-5225 ...",
            thumbnailUrl: "https://i.ytimg.com/vi/8YX8EIU8Bac/mqdefault.jpg",
            channelTitle: "The Ramsey Show Highlights",
            publishedAt: "2022-04-28T17:00:03Z",
            viewCount: 27488,
            likeCount: 876,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "livestock-management": [
          {
            id: "QJhmMQIoYJM",
            title: "SELF SUFFICIENT HOMESTEAD - What LIVESTOCK And HOW MANY of Each",
            description: "You have your land, beautiful grass growing, and even some fencing up, and now you find yourself asking the question all new ...",
            thumbnailUrl: "https://i.ytimg.com/vi/QJhmMQIoYJM/mqdefault.jpg",
            channelTitle: "Homesteady",
            publishedAt: "2019-04-19T12:13:55Z",
            viewCount: 55559,
            likeCount: 2080,
            topicId: slug
          },
          {
            id: "AzDWmpVOk5I",
            title: "BEST AND WORST Livestock for Beginners",
            description: "WHAT LIVESTOCK DO YOU SUGGEST FOR BEGINNERS AND WHY? - My livestock for beginners list... , , , , , - After ...",
            thumbnailUrl: "https://i.ytimg.com/vi/AzDWmpVOk5I/mqdefault.jpg",
            channelTitle: "Homesteady",
            publishedAt: "2020-02-17T21:45:00Z",
            viewCount: 22299,
            likeCount: 770,
            topicId: slug
          },
          {
            id: "ZGJVIsB77NU",
            title: "The 5 BEST Beginner Farm Animals To Start Your Homestead!",
            description: "Homesteading is a dream for many but once you're ready to start a farm, which animals are the best beginner farm animals to start ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ZGJVIsB77NU/mqdefault.jpg",
            channelTitle: "Wickens Wicked Reptiles",
            publishedAt: "2022-05-09T20:15:00Z",
            viewCount: 49124,
            likeCount: 1605,
            topicId: slug
          },
          {
            id: "gY-5e4KqUeU",
            title: "SHEEP FARMING FOR BEGINNERS // What I Wish We Knew Before Starting a Sheep Farm",
            description: "CLEMSON UNIVERSITY SHEEP DEWORMER GUIDE: https://bit.ly/DewormingSheep Sheep farming for beginners: what I wish ...",
            thumbnailUrl: "https://i.ytimg.com/vi/gY-5e4KqUeU/mqdefault.jpg",
            channelTitle: "the Shepherdess",
            publishedAt: "2021-09-29T11:15:05Z",
            viewCount: 58417,
            likeCount: 2353,
            topicId: slug
          },
          {
            id: "IxdU46sw_7E",
            title: "How To Start A Farm From Scratch In 2025",
            description: "Starting a farm is more than just saying you're a farmer. When you start a farm, you're starting a business and like any business, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/IxdU46sw_7E/mqdefault.jpg",
            channelTitle: "Plane View Farm",
            publishedAt: "2024-11-28T16:00:12Z",
            viewCount: 56381,
            likeCount: 2054,
            topicId: slug
          },
          {
            id: "Pl5LSIte2_w",
            title: "How We Produce 80% of Our Food on 1/2 Acre Homestead",
            description: "Ready to homestead but think you need more space? Get our FREE beginner's guide & learn how to start with what you have ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Pl5LSIte2_w/mqdefault.jpg",
            channelTitle: "Ali's Organic Garden & Homestead",
            publishedAt: "2024-05-25T23:47:53Z",
            viewCount: 41065,
            likeCount: 1830,
            topicId: slug
          },
          {
            id: "m93TUdtn9A4",
            title: "COWS VS GOATS... What is the BEST HOMESTEAD DAIRY ANIMAL?",
            description: "This episode was brought to you by LAUREL MOUNTAIN SOAPS Get farm fresh goat milk soaps, deodorants, beard balms and ...",
            thumbnailUrl: "https://i.ytimg.com/vi/m93TUdtn9A4/mqdefault.jpg",
            channelTitle: "Homesteady",
            publishedAt: "2025-02-28T21:30:07Z",
            viewCount: 42315,
            likeCount: 2415,
            topicId: slug
          },
          {
            id: "d49A1QE-Ods",
            title: "First Farm Chores on My New Farm! | Matt Mathews",
            description: "COME SEE ME ON TOUR! Boujee on a Budget tickets: https://www.mattmathews.com/comedy-tour Welcome to the very FIRST ...",
            thumbnailUrl: "https://i.ytimg.com/vi/d49A1QE-Ods/mqdefault.jpg",
            channelTitle: "Matt Mathews",
            publishedAt: "2025-07-21T22:00:07Z",
            viewCount: 22586,
            likeCount: 871,
            topicId: slug
          },
          {
            id: "rk1mXh9ptBI",
            title: "Why Pigs Are the Perfect Homestead Animal",
            description: "Are you considering adding pigs to your homestead or farm? Pigs are often overlooked as the perfect homestead animal, but they ...",
            thumbnailUrl: "https://i.ytimg.com/vi/rk1mXh9ptBI/mqdefault.jpg",
            channelTitle: "The Farming Realtor",
            publishedAt: "2025-07-23T01:21:53Z",
            viewCount: 27141,
            likeCount: 1102,
            topicId: slug
          },
          {
            id: "B6qk0IbCC5U",
            title: "Make $10,000 per acre with Pastured Pigs | Joel Salatin #farming #pig #rotationalgrazing #homestead",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/B6qk0IbCC5U/mqdefault.jpg",
            channelTitle: "Farm Like A Lunatic with Joel Salatin",
            publishedAt: "2024-11-11T15:42:57Z",
            viewCount: 21796,
            likeCount: 1833,
            topicId: slug
          },
          {
            id: "RnKz-4GQGps",
            title: "A New Animal Joins the Farm! | Planting a Desert Turkey Pasture",
            description: "We've been raising livestock in the Arizona desert for over 6 years. Today we're introducing a new animal to the farm and also ...",
            thumbnailUrl: "https://i.ytimg.com/vi/RnKz-4GQGps/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2023-03-25T19:00:16Z",
            viewCount: 32378,
            likeCount: 1658,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "cJZIdEsg5AU",
            title: "Regenerative Farm in the High Desert growing trees and cows",
            description: "Join my free Permaculture Homestead Community! Get instant access to free courses, connect with like-minded homesteaders, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/cJZIdEsg5AU/mqdefault.jpg",
            channelTitle: "Stefano Creatini",
            publishedAt: "2023-07-27T11:00:24Z",
            viewCount: 18241,
            likeCount: 1606,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "off-grid-water-systems": [
          {
            id: "wEsv4L6CWZ4",
            title: "How We Shower, Use the Bathroom, Have Drinking Water  #offgrid #homestead",
            description: "Our biggest challenge living off grid has been WATER. Water is our most important resource and making sure you know how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/wEsv4L6CWZ4/mqdefault.jpg",
            channelTitle: "Raising Wildflowers",
            publishedAt: "2024-06-14T23:33:13Z",
            viewCount: 11980,
            likeCount: 2010,
            topicId: slug
          },
          {
            id: "t5i48Drpjq0",
            title: "💦 Simple Pump! The BEST OFF-GRID Well Water Source! 💦",
            description: "We LOVE our Simple Pump for a pure source of Off-Grid well water! Come along for all the highlights! See you on the farm!",
            thumbnailUrl: "https://i.ytimg.com/vi/t5i48Drpjq0/mqdefault.jpg",
            channelTitle: "Appalachia's Homestead with Patara",
            publishedAt: "2023-01-03T16:01:19Z",
            viewCount: 13210,
            likeCount: 1709,
            topicId: slug
          },
          {
            id: "yNrGK34marM",
            title: "How Our Off Grid Water System Works",
            description: "We built a pressurized on demand hot water system for our homestead. All you need are a few simple components and you can ...",
            thumbnailUrl: "https://i.ytimg.com/vi/yNrGK34marM/mqdefault.jpg",
            channelTitle: "An American Homestead",
            publishedAt: "2022-05-03T08:50:31Z",
            viewCount: 38425,
            likeCount: 906,
            topicId: slug
          },
          {
            id: "MQHQXC_Qt4Q",
            title: "We Got A Well Drilled! A Simple Well For Off Grid Homesteading",
            description: "We finally got a well drilled on our off grid homestead. We now have access to unlimited clean drinking water. #diy #homestead ...",
            thumbnailUrl: "https://i.ytimg.com/vi/MQHQXC_Qt4Q/mqdefault.jpg",
            channelTitle: "KYLES CABIN",
            publishedAt: "2023-08-07T23:30:55Z",
            viewCount: 45479,
            likeCount: 826,
            topicId: slug
          },
          {
            id: "kV3g2dX0K54",
            title: "Off Grid Water Pressure Tanks",
            description: "How to choose a water pressure tank (aka bladder tank or household diaphragm tank) for your home, especially if you plan on ...",
            thumbnailUrl: "https://i.ytimg.com/vi/kV3g2dX0K54/mqdefault.jpg",
            channelTitle: "The Ready Life",
            publishedAt: "2018-04-27T00:31:49Z",
            viewCount: 52454,
            likeCount: 1815,
            topicId: slug
          },
          {
            id: "1MIhXcEhEHg",
            title: "Getting Started With Off-Grid Water Systems",
            description: "Interested in learning more about getting your water off the grid? Join us as we explore different methods and techniques for ...",
            thumbnailUrl: "https://i.ytimg.com/vi/1MIhXcEhEHg/mqdefault.jpg",
            channelTitle: "Insteading",
            publishedAt: "2023-07-20T22:00:02Z",
            viewCount: 30501,
            likeCount: 2281,
            topicId: slug
          },
          {
            id: "DNVS5D1G3-8",
            title: "EASY Off Grid Water Storage System- With on Demand Pump",
            description: "In this video I show you my off grid water system. I'm using a 300 gallon food grade IBC tote and an on demand, 110v water pump.",
            thumbnailUrl: "https://i.ytimg.com/vi/DNVS5D1G3-8/mqdefault.jpg",
            channelTitle: "Triple T Acres",
            publishedAt: "2024-05-04T11:00:11Z",
            viewCount: 25927,
            likeCount: 809,
            topicId: slug
          },
          {
            id: "FTNGjKikmRE",
            title: "Off-Grid survival Water",
            description: "If you're living off-grid, then you know the importance of having access to water. This video is about how to build a simple water ...",
            thumbnailUrl: "https://i.ytimg.com/vi/FTNGjKikmRE/mqdefault.jpg",
            channelTitle: "OKLAHOMA OFF-GRID",
            publishedAt: "2023-11-03T00:54:01Z",
            viewCount: 44190,
            likeCount: 1242,
            topicId: slug
          },
          {
            id: "E-pn41fqYXs",
            title: "How to INSTALL YOUR OWN WELL with a Sledge Hammer for FREE OFF GRID WATER",
            description: "Drill a WELL in YOUR BACKYARD YOURSELF in a day with basic tools. Step by step of how I did it & you can too . FREE water ...",
            thumbnailUrl: "https://i.ytimg.com/vi/E-pn41fqYXs/mqdefault.jpg",
            channelTitle: "Silver Cymbal",
            publishedAt: "2021-09-04T13:12:58Z",
            viewCount: 52047,
            likeCount: 1027,
            topicId: slug
          },
          {
            id: "Al4dXQUMgaY",
            title: "EPIC 40,000 Gallon Off Grid Rainwater System Tour In The Desert",
            description: "In today's video, I explain the layout and tour our 40000 gallon off grid rainwater catchment system in the desert. Check out the ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Al4dXQUMgaY/mqdefault.jpg",
            channelTitle: "Handeeman",
            publishedAt: "2023-03-30T19:00:04Z",
            viewCount: 20213,
            likeCount: 1091,
            topicId: slug
          },
          {
            id: "e5fvcwZu2nI",
            title: "How to dig your own well in Az  update 5 years later.",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/e5fvcwZu2nI/mqdefault.jpg",
            channelTitle: "  The Windy Yucca Homestead ",
            publishedAt: "2023-06-14T16:09:18Z",
            viewCount: 7006,
            likeCount: 678,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "ZW2isvAr2is",
            title: "Thriving Off Grid in the Desert without a Well | PARAGRAPHIC",
            description: "Tour a 100% off grid modern home in the desert and learn the possibilities of sustainable living. Take the tour for yourself: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ZW2isvAr2is/mqdefault.jpg",
            channelTitle: "PARAGRAPHIC",
            publishedAt: "2023-05-27T13:35:00Z",
            viewCount: 22072,
            likeCount: 374,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "organic-gardening": [
          {
            id: "Pl5LSIte2_w",
            title: "How We Produce 80% of Our Food on 1/2 Acre Homestead",
            description: "Ready to homestead but think you need more space? Get our FREE beginner's guide & learn how to start with what you have ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Pl5LSIte2_w/mqdefault.jpg",
            channelTitle: "Ali's Organic Garden & Homestead",
            publishedAt: "2024-05-25T23:47:53Z",
            viewCount: 56996,
            likeCount: 1720,
            topicId: slug
          },
          {
            id: "Yzdabta1nAA",
            title: "1/8 Acre Abundance: FULL TOUR + BEST TIPS for Growing",
            description: "Michelle is a multi-generational gardener, and she's sharing her BEST TIPS with you in this organic garden tour. We grow all of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Yzdabta1nAA/mqdefault.jpg",
            channelTitle: "More Than Farmers",
            publishedAt: "2023-07-02T19:07:38Z",
            viewCount: 26885,
            likeCount: 1564,
            topicId: slug
          },
          {
            id: "KM1Q5--igLs",
            title: "How We Feed our Family with a 20x40 ft. Garden - COMPLETE TOUR",
            description: "gardening #homestead #homesteading #garden #vegetables #fruit #selfcare #selfimprovement #growyourchannel #youtube ...",
            thumbnailUrl: "https://i.ytimg.com/vi/KM1Q5--igLs/mqdefault.jpg",
            channelTitle: "Together We Harvest ",
            publishedAt: "2023-08-11T21:00:15Z",
            viewCount: 20149,
            likeCount: 1037,
            topicId: slug
          },
          {
            id: "K48WGZYWsxc",
            title: "Woman&#39;s Incredible Backyard Homestead Produces TONS of Food for Her Family – URBAN GARDEN TOUR",
            description: "Asia started off with a single garden bed in her backyard, and over the last three years, she has transformed it into a thriving urban ...",
            thumbnailUrl: "https://i.ytimg.com/vi/K48WGZYWsxc/mqdefault.jpg",
            channelTitle: "Exploring Alternatives",
            publishedAt: "2023-08-25T18:37:54Z",
            viewCount: 13791,
            likeCount: 2100,
            topicId: slug
          },
          {
            id: "-_8Yl8lpBz0",
            title: "5 SURVIVAL FOODS TO GROW! 🌽",
            description: "Here's my favorite soil: https://amzn.to/4cDsety Compost: https://amzn.to/3LkAse8 Worm Castings: https://amzn.to/3S3nF3g Straw ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-_8Yl8lpBz0/mqdefault.jpg",
            channelTitle: "Anh Lin",
            publishedAt: "2024-07-18T15:30:00Z",
            viewCount: 46678,
            likeCount: 1381,
            topicId: slug
          },
          {
            id: "vAmglTjpDfw",
            title: "Top 6 Easy To Grow Vegetables For Beginners/SEED TO HARVEST",
            description: "In today's video, I'm sharing my top 6 easy vegetables for beginners to grow in their spring garden. I'll take you from seed to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/vAmglTjpDfw/mqdefault.jpg",
            channelTitle: "Next Level Gardening",
            publishedAt: "2024-01-21T15:00:47Z",
            viewCount: 55548,
            likeCount: 1259,
            topicId: slug
          },
          {
            id: "Jl2Ma_heuLA",
            title: "Family Growing 90% of Their Food on an Impressive Permaculture Homestead",
            description: "After only three years of homesteading, this family is already growing 90% of their food for a family of four on 2.3 acres, and most ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Jl2Ma_heuLA/mqdefault.jpg",
            channelTitle: "Exploring Alternatives",
            publishedAt: "2023-12-26T19:01:21Z",
            viewCount: 41281,
            likeCount: 2478,
            topicId: slug
          },
          {
            id: "Fwe6XHoDIhk",
            title: "How We Produce 80% of Our Food on Just 1/2 Acre (Complete Tour)",
            description: "Ready to homestead but think you need more space? Get our FREE beginner's guide & learn how to start with what you have ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Fwe6XHoDIhk/mqdefault.jpg",
            channelTitle: "Ali's Organic Garden & Homestead",
            publishedAt: "2025-05-30T17:00:31Z",
            viewCount: 28594,
            likeCount: 2463,
            topicId: slug
          },
          {
            id: "OTT0jwcJY0s",
            title: "Optimizing My 1/2 Acre Homestead Garden for Self Sustainably",
            description: "You can be self sufficient on small acreage and provide your family with healthy produce from your garden and orchard.",
            thumbnailUrl: "https://i.ytimg.com/vi/OTT0jwcJY0s/mqdefault.jpg",
            channelTitle: "Ali's Organic Garden & Homestead",
            publishedAt: "2024-06-09T12:45:36Z",
            viewCount: 53595,
            likeCount: 1698,
            topicId: slug
          },
          {
            id: "26qTgXJKMAE",
            title: "He Farms 35 Hours a Week By Himself and Makes 6 Figures",
            description: "5 year ago, I met a guy named Andrew at a farm to table dinner. He told me about his market farming operation and we've stayed ...",
            thumbnailUrl: "https://i.ytimg.com/vi/26qTgXJKMAE/mqdefault.jpg",
            channelTitle: "Epic Gardening",
            publishedAt: "2023-05-18T17:36:01Z",
            viewCount: 25378,
            likeCount: 2113,
            topicId: slug
          },
          {
            id: "kawiOCXYGG4",
            title: "VEGETABLE GARDENING in Arizona, 7 Principles for SUCCESS: Growing in the Garden",
            description: "Gardening in Arizona is different, not impossible. We have different seasons than most. Zone maps on the back of seed packets ...",
            thumbnailUrl: "https://i.ytimg.com/vi/kawiOCXYGG4/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2022-05-20T15:02:19Z",
            viewCount: 29137,
            likeCount: 753,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 13466,
            likeCount: 804,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "permaculture-design": [
          {
            id: "CLgnlcPJIZg",
            title: "Designing a Sustainable Garden For My Tiny Homestead | A Blueprint for Self Sufficiency",
            description: "Finally it's spring here in Denmark and now time to design my new permaculture forest garden at my tiny cabin in the woods.",
            thumbnailUrl: "https://i.ytimg.com/vi/CLgnlcPJIZg/mqdefault.jpg",
            channelTitle: "Anders Boisen ",
            publishedAt: "2025-04-19T13:50:45Z",
            viewCount: 39351,
            likeCount: 2445,
            topicId: slug
          },
          {
            id: "acjpwIxZzlA",
            title: "Self-Sufficiency Made Easier Using These 12 Principles!",
            description: "This year I have decided to dedicate a playlist to all things permaculture. It is my hope that it will act as a valuable free resource ...",
            thumbnailUrl: "https://i.ytimg.com/vi/acjpwIxZzlA/mqdefault.jpg",
            channelTitle: "Huw Richards",
            publishedAt: "2023-01-28T10:56:55Z",
            viewCount: 18364,
            likeCount: 1817,
            topicId: slug
          },
          {
            id: "Jl2Ma_heuLA",
            title: "Family Growing 90% of Their Food on an Impressive Permaculture Homestead",
            description: "After only three years of homesteading, this family is already growing 90% of their food for a family of four on 2.3 acres, and most ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Jl2Ma_heuLA/mqdefault.jpg",
            channelTitle: "Exploring Alternatives",
            publishedAt: "2023-12-26T19:01:21Z",
            viewCount: 25417,
            likeCount: 844,
            topicId: slug
          },
          {
            id: "Yg5mzpjmOrI",
            title: "Beautiful 8 Acre Permaculture Farm Combines Trees, Livestock, and a Productive CSA Market Garden",
            description: "Following on from the Agroforestry video we made @TapoNothFarm, we now look more deeply into their whole farm design, way ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Yg5mzpjmOrI/mqdefault.jpg",
            channelTitle: "Regenerative Media",
            publishedAt: "2022-01-29T13:16:41Z",
            viewCount: 48241,
            likeCount: 1025,
            topicId: slug
          },
          {
            id: "dztgMnaH1rw",
            title: "Hugely Abundant 1-Acre Permaculture Homestead Tour – Limestone Permaculture Farm Revisit",
            description: "Watch the first tour we did back in 2015! https://youtu.be/jSNc13cmknE In Episode 3 of Permaculture Tours we revisit the amazing ...",
            thumbnailUrl: "https://i.ytimg.com/vi/dztgMnaH1rw/mqdefault.jpg",
            channelTitle: "Happen Films",
            publishedAt: "2020-04-16T23:03:04Z",
            viewCount: 18790,
            likeCount: 1496,
            topicId: slug
          },
          {
            id: "It9FFqcxcmA",
            title: "How We Designed Our Permaculture-Inspired Homestead",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/It9FFqcxcmA/mqdefault.jpg",
            channelTitle: "The Dutch Farmer",
            publishedAt: "2023-09-08T14:01:37Z",
            viewCount: 39984,
            likeCount: 1867,
            topicId: slug
          },
          {
            id: "Qq6gthmfFfM",
            title: "Master Permaculture Design: How to Create Zones for a Thriving Garden &amp; Livestock!",
            description: "Unlock the power of permaculture with this in-depth guide on creating zones for a sustainable garden and homestead! In this ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Qq6gthmfFfM/mqdefault.jpg",
            channelTitle: "Celtic Farm",
            publishedAt: "2024-10-05T00:54:49Z",
            viewCount: 49040,
            likeCount: 1312,
            topicId: slug
          },
          {
            id: "Bs7CT8jh-PY",
            title: "How I built out my Permaculture Garden from Scratch #vegetablegarden #gardendesign",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/Bs7CT8jh-PY/mqdefault.jpg",
            channelTitle: "Erika Nolan - The Holistic Homestead",
            publishedAt: "2024-08-22T17:23:57Z",
            viewCount: 49636,
            likeCount: 1041,
            topicId: slug
          },
          {
            id: "t_dNb07yMeY",
            title: "How to build a 1 acre Homestead",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/t_dNb07yMeY/mqdefault.jpg",
            channelTitle: "Greenhorn Grove",
            publishedAt: "2024-04-18T09:41:05Z",
            viewCount: 24043,
            likeCount: 2343,
            topicId: slug
          },
          {
            id: "o1LWnqM6NAY",
            title: "How to Design, Layout Your Permaculture Homestead, Farm, Garden or Site",
            description: "Overwhelmed with where to start on your permaculture homestead? Unsure of where everything should go? Don't waste your ...",
            thumbnailUrl: "https://i.ytimg.com/vi/o1LWnqM6NAY/mqdefault.jpg",
            channelTitle: "The Arcadia Project (née Axe & Root Homestead)",
            publishedAt: "2023-03-16T18:34:00Z",
            viewCount: 48962,
            likeCount: 757,
            topicId: slug
          },
          {
            id: "WKrANHuWM8E",
            title: "The Half Moon Miracle in the Sahel",
            description: "Witness the incredible resurrection of barren lands as we delve into the half moon technology revitalizing the Sahel! With 7500 ...",
            thumbnailUrl: "https://i.ytimg.com/vi/WKrANHuWM8E/mqdefault.jpg",
            channelTitle: "Andrew Millison",
            publishedAt: "2024-02-29T17:00:35Z",
            viewCount: 13880,
            likeCount: 1173,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "i5yUPau-F1c",
            title: "Permaculture Garden In The High Desert",
            description: "https://youtu.be/cJO440pQhi8 See Lances 2.5 hr entire season course Join my Permaculture Homestead Community!",
            thumbnailUrl: "https://i.ytimg.com/vi/i5yUPau-F1c/mqdefault.jpg",
            channelTitle: "Stefano Creatini",
            publishedAt: "2023-12-15T16:00:24Z",
            viewCount: 6127,
            likeCount: 1577,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "raising-chickens": [
          {
            id: "6DtfXDKSITk",
            title: "BACKYARD CHICKENS FOR BEGINNERS! | Caring For Egg Laying Hens The EASY Way!",
            description: "Today I talk about backyard chickens for beginners and how to care for your egg laying hens the easy way. Chicken keeping may ...",
            thumbnailUrl: "https://i.ytimg.com/vi/6DtfXDKSITk/mqdefault.jpg",
            channelTitle: "Whitepepper Farms Homestead",
            publishedAt: "2023-06-18T14:00:03Z",
            viewCount: 33978,
            likeCount: 1168,
            topicId: slug
          },
          {
            id: "wuOd5_M9yDQ",
            title: "Raising Chickens: Everything You Need To Know!",
            description: "Get started with chicken keeping: https://shop.epicgardening.com/collections/chicken-keeping With the price of eggs skyrocketing, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/wuOd5_M9yDQ/mqdefault.jpg",
            channelTitle: "Epic Homesteading",
            publishedAt: "2023-02-07T20:00:31Z",
            viewCount: 59296,
            likeCount: 1100,
            topicId: slug
          },
          {
            id: "1rDArRNSDBE",
            title: "Raising chickens 101, getting started &amp; what they don&#39;t tell you",
            description: "Even if you've had chickens for years, you'll probably learn something in this video. Packed full of information.",
            thumbnailUrl: "https://i.ytimg.com/vi/1rDArRNSDBE/mqdefault.jpg",
            channelTitle: "Hobby Farm Nutt",
            publishedAt: "2017-08-03T04:20:31Z",
            viewCount: 29239,
            likeCount: 1253,
            topicId: slug
          },
          {
            id: "F79a92yg3U8",
            title: "Raising Backyard Chickens // Beginners Guide",
            description: "On the fence about getting backyard chickens? In this beginners guide will walk you through the ways to get baby chicks or pullets ...",
            thumbnailUrl: "https://i.ytimg.com/vi/F79a92yg3U8/mqdefault.jpg",
            channelTitle: "Little Homestead Big Dreams (Next Level Homestead)",
            publishedAt: "2023-06-04T15:42:01Z",
            viewCount: 41040,
            likeCount: 1153,
            topicId: slug
          },
          {
            id: "SDppwYI8AgU",
            title: "BACKYARD CHICKENS FOR BEGINNERS | How To Take Care Of Egg Laying Hens the EASY WAY | Urban Poultry",
            description: "We're here to give you the basics of how we care for our backyard chickens. Including everything from food, to water, to shelter, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/SDppwYI8AgU/mqdefault.jpg",
            channelTitle: "Oak Abode",
            publishedAt: "2020-08-12T23:37:12Z",
            viewCount: 36779,
            likeCount: 2128,
            topicId: slug
          },
          {
            id: "YsFJH3MvE0I",
            title: "WINTER CHICKEN CARE 101 | Keeping Backyard Chickens Warm In COLD WEATHER | EGG LAYING HEN HOMESTEAD",
            description: "Here are 9 tips on how we keep our chickens healthy & comfortable through the winter -- it's a lot easier than you might guess!",
            thumbnailUrl: "https://i.ytimg.com/vi/YsFJH3MvE0I/mqdefault.jpg",
            channelTitle: "Oak Abode",
            publishedAt: "2021-01-29T18:16:15Z",
            viewCount: 59850,
            likeCount: 847,
            topicId: slug
          },
          {
            id: "MmLcm8SGRLA",
            title: "Know these 5 Things BEFORE You Start Raising Chickens",
            description: "happychickens #backyardchickens #chickens #raisingchickens #hens #petchickens #backyardchicken #backyardhomestead ...",
            thumbnailUrl: "https://i.ytimg.com/vi/MmLcm8SGRLA/mqdefault.jpg",
            channelTitle: "Earth, Nails & Tails",
            publishedAt: "2023-09-27T14:00:16Z",
            viewCount: 57231,
            likeCount: 587,
            topicId: slug
          },
          {
            id: "ftxBgKS_F2U",
            title: "How to Get Started with Chickens: Everything you need to know",
            description: "Get free Chicken Tractor Plans NOW (free): https://www.homesteadbuilds.com Get all the plans for my coops and garden beds at ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ftxBgKS_F2U/mqdefault.jpg",
            channelTitle: "Justin Rhodes",
            publishedAt: "2023-05-09T15:00:24Z",
            viewCount: 50852,
            likeCount: 2085,
            topicId: slug
          },
          {
            id: "Ao5yXbY-vZg",
            title: "Working With What You Got #garden #chickenlife #backyardchickens #backyardfarming",
            description: "It's all about working with what you have. You don't have to have many acres to grow a garden and have chickens. Yes, some ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Ao5yXbY-vZg/mqdefault.jpg",
            channelTitle: "Chickens With Mom ",
            publishedAt: "2025-07-21T22:17:59Z",
            viewCount: 27495,
            likeCount: 761,
            topicId: slug
          },
          {
            id: "IPgIXHxt9O0",
            title: "Practical Advice for Keeping Backyard Chickens in the City",
            description: "We live just 10 min from downtown San Diego. We live on a standard city lot (7500 sq ft) and grow 80% of the food for our family of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/IPgIXHxt9O0/mqdefault.jpg",
            channelTitle: "Zero Waste Family",
            publishedAt: "2021-06-07T13:26:49Z",
            viewCount: 59682,
            likeCount: 748,
            topicId: slug
          },
          {
            id: "UGFV37esdGg",
            title: "Raising Egg Laying Chickens in the Arizona Desert | #withme | #farmwithme",
            description: "Today we're giving a comprehensive tutorial on how we raise laying hens in AZ. Support the channel for free by starting your ...",
            thumbnailUrl: "https://i.ytimg.com/vi/UGFV37esdGg/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2020-04-09T19:00:14Z",
            viewCount: 31028,
            likeCount: 713,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "-Mu5I7XvRQk",
            title: "How to keep CHICKENS COOL in HOT weather",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/-Mu5I7XvRQk/mqdefault.jpg",
            channelTitle: "Good Patriot",
            publishedAt: "2023-06-23T22:41:30Z",
            viewCount: 9402,
            likeCount: 998,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "soil-building-in-arid-climates": [
          {
            id: "QJwIhgN7pOg",
            title: "Swale + Water = Trees / How swales are built in high elevation mountain desert climate.",
            description: "Highlighting our regeneration of soil on 1 acre of high elevation desert climate. Swales allow our property to efficiently and ...",
            thumbnailUrl: "https://i.ytimg.com/vi/QJwIhgN7pOg/mqdefault.jpg",
            channelTitle: "K TheGuy",
            publishedAt: "2022-09-06T13:10:20Z",
            viewCount: 12945,
            likeCount: 1775,
            topicId: slug
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 35964,
            likeCount: 742,
            topicId: slug
          },
          {
            id: "i5yUPau-F1c",
            title: "Permaculture Garden In The High Desert",
            description: "https://youtu.be/cJO440pQhi8 See Lances 2.5 hr entire season course Join my Permaculture Homestead Community!",
            thumbnailUrl: "https://i.ytimg.com/vi/i5yUPau-F1c/mqdefault.jpg",
            channelTitle: "Stefano Creatini",
            publishedAt: "2023-12-15T16:00:24Z",
            viewCount: 38962,
            likeCount: 1723,
            topicId: slug
          },
          {
            id: "cc3-3s115mM",
            title: "How He Turned Desert Sand Into Fertile Farm Land In 3 Months!",
            description: "John Graham is a specialist in desert farming who has taught hundreds of farmers how to run profitable organic farms. He has 30 ...",
            thumbnailUrl: "https://i.ytimg.com/vi/cc3-3s115mM/mqdefault.jpg",
            channelTitle: "Leaf of Life",
            publishedAt: "2024-01-01T16:04:01Z",
            viewCount: 27792,
            likeCount: 2345,
            topicId: slug
          },
          {
            id: "4i00u8WsqwY",
            title: "Who Knew?! Desert Garden Year ONE 🌱 #garden #desertlife #diy",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/4i00u8WsqwY/mqdefault.jpg",
            channelTitle: "Linnea & Akela",
            publishedAt: "2024-09-19T22:50:02Z",
            viewCount: 37554,
            likeCount: 1211,
            topicId: slug
          },
          {
            id: "jM9j12VfqcQ",
            title: "How This Woman Turned Arizona&#39;s Desert into a Farmland Oasis",
            description: "Southern Arizona is known for its desert climate, with very hot summers and mild winters. This climate has meant the region has ...",
            thumbnailUrl: "https://i.ytimg.com/vi/jM9j12VfqcQ/mqdefault.jpg",
            channelTitle: "Leaf of Life",
            publishedAt: "2022-07-18T15:22:27Z",
            viewCount: 31722,
            likeCount: 507,
            topicId: slug
          },
          {
            id: "EVp0bMAwvXA",
            title: "How I Regenerated High Desert into Thriving Pasture in 4 Years: 8 Steps!",
            description: "In this video, I walk you through the 8 steps we used over 4 years to transform a dry, sagebrush-covered land area in southwest ...",
            thumbnailUrl: "https://i.ytimg.com/vi/EVp0bMAwvXA/mqdefault.jpg",
            channelTitle: "Four Corners Explorer",
            publishedAt: "2025-01-23T18:31:21Z",
            viewCount: 54849,
            likeCount: 1443,
            topicId: slug
          },
          {
            id: "O4XLrrPQ91I",
            title: "Gardening in the Arizona Desert Using Native Soil 🌱 No Fertilizer, Growing Organic Vegetables",
            description: "What I have learned about having a successful garden in the desert. Who knew the desert had such great top soil! How I protect ...",
            thumbnailUrl: "https://i.ytimg.com/vi/O4XLrrPQ91I/mqdefault.jpg",
            channelTitle: "Red & April Off-Grid",
            publishedAt: "2022-07-16T13:00:14Z",
            viewCount: 56470,
            likeCount: 1171,
            topicId: slug
          },
          {
            id: "cJZIdEsg5AU",
            title: "Regenerative Farm in the High Desert growing trees and cows",
            description: "Join my free Permaculture Homestead Community! Get instant access to free courses, connect with like-minded homesteaders, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/cJZIdEsg5AU/mqdefault.jpg",
            channelTitle: "Stefano Creatini",
            publishedAt: "2023-07-27T11:00:24Z",
            viewCount: 32957,
            likeCount: 2463,
            topicId: slug
          },
          {
            id: "X3B-FjU2nyg",
            title: "S9 E3: On Homesteading in the Desert &amp; Blooming Where You&#39;re Planted",
            description: "Join in as I chat with this husband and wife team, Chad & Tara Philipp, of She's Rooted Home, about how they managed to build a ...",
            thumbnailUrl: "https://i.ytimg.com/vi/X3B-FjU2nyg/mqdefault.jpg",
            channelTitle: "Jill Winger - Old Fashioned on Purpose",
            publishedAt: "2022-05-02T06:00:27Z",
            viewCount: 59079,
            likeCount: 1486,
            topicId: slug
          },
          {
            id: "-MYIDb9MD7Y",
            title: "Desert Gardening: Grow Vegetables in a Hot, Dry Climate",
            description: "Looking to start a vegetable garden in a hot, dry climate? This in-depth guide to desert gardening will show you how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/-MYIDb9MD7Y/mqdefault.jpg",
            channelTitle: "Growing In The Garden",
            publishedAt: "2024-09-27T14:01:36Z",
            viewCount: 14342,
            likeCount: 392,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "JoWYdTHkFPc",
            title: "Creating Soil in the Arizona Desert | #farmwithme",
            description: "Creating soil in the desert. Today we're showing you how we're building soil from scratch here in AZ. Support the channel for free ...",
            thumbnailUrl: "https://i.ytimg.com/vi/JoWYdTHkFPc/mqdefault.jpg",
            channelTitle: "Edge of Nowhere Farm",
            publishedAt: "2020-05-05T19:00:04Z",
            viewCount: 18516,
            likeCount: 1032,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "solar-energy": [
          {
            id: "EZWJVsn2D3A",
            title: "Solar Power for dummies, This system is easy!",
            description: "Renogy solar is possibly the best Solar Power set up for the beginner or novice! 5 Strings Solar Combiner Box Perfect for both ...",
            thumbnailUrl: "https://i.ytimg.com/vi/EZWJVsn2D3A/mqdefault.jpg",
            channelTitle: "OFF GRID with DOUG & STACY",
            publishedAt: "2022-12-20T20:44:39Z",
            viewCount: 24079,
            likeCount: 815,
            topicId: slug
          },
          {
            id: "rnibwaL74rs",
            title: "EASIEST Off Grid Solar Power System Battery Bank",
            description: "Thanks to BattleBorn Batteries for sponsoring this video! Get $25 off per battery and 25% off merch by using the code \"johnson\" at ...",
            thumbnailUrl: "https://i.ytimg.com/vi/rnibwaL74rs/mqdefault.jpg",
            channelTitle: "Martin Johnson - Off Grid Living",
            publishedAt: "2024-10-25T12:01:12Z",
            viewCount: 22880,
            likeCount: 1443,
            topicId: slug
          },
          {
            id: "APsH72Me0Sg",
            title: "Total cost of off grid solar setup #homesteading #containerhouse #hobbyfarm #offgridliving #solar",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/APsH72Me0Sg/mqdefault.jpg",
            channelTitle: "Can't Contain Us",
            publishedAt: "2024-08-31T16:14:30Z",
            viewCount: 18943,
            likeCount: 1793,
            topicId: slug
          },
          {
            id: "IAiR9dtH_z8",
            title: "NO PERMITS NEEDED - 12,000W SYSTEM RUNS EVERYTHING! Powering Entire Homestead - Bluetti AC500+B300S",
            description: "bluetti #ac500b300s #powercore ** Check out the AC500+B300S: https://bit.ly/3T2AMCQ ** **** Use my code OffGridAC500 for ...",
            thumbnailUrl: "https://i.ytimg.com/vi/IAiR9dtH_z8/mqdefault.jpg",
            channelTitle: "Off-Grid Backcountry Adventures",
            publishedAt: "2024-03-25T18:29:58Z",
            viewCount: 30566,
            likeCount: 1192,
            topicId: slug
          },
          {
            id: "NGETC_D6pBo",
            title: "Bringing Solar Power to Our Off-Grid Island Homestead",
            description: "The big moment finally arrived — after nearly a year of hauling water, running a generator for every little task, and figuring things ...",
            thumbnailUrl: "https://i.ytimg.com/vi/NGETC_D6pBo/mqdefault.jpg",
            channelTitle: "Skote Outdoors",
            publishedAt: "2025-07-13T11:30:17Z",
            viewCount: 47696,
            likeCount: 2342,
            topicId: slug
          },
          {
            id: "UbIo5yq8Tuo",
            title: "Solar is not the best offgrid option #offgrid #homestead #solarpower",
            description: "",
            thumbnailUrl: "https://i.ytimg.com/vi/UbIo5yq8Tuo/mqdefault.jpg",
            channelTitle: "Nathan Dickeson",
            publishedAt: "2024-09-16T22:56:13Z",
            viewCount: 23755,
            likeCount: 1661,
            topicId: slug
          },
          {
            id: "vng-CACPow0",
            title: "Our Complete Solar System Cost With Battery Backup! 10kw Of Power",
            description: "Our Complete Solar System Cost With Battery Backup! 10kw Of Power! OUR SOLAR EQUIPMENT......CLICK HERE: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/vng-CACPow0/mqdefault.jpg",
            channelTitle: "Country Living Experience: A Homesteading Journey",
            publishedAt: "2021-11-28T13:00:19Z",
            viewCount: 58784,
            likeCount: 1910,
            topicId: slug
          },
          {
            id: "gLoW0H1OBO4",
            title: "Can You Power Your Entire House With This Ultra Cheap Solar System??",
            description: "RENOGY #SOLAR #HOMESTEAD lets find out if we can run my entire house and homestead on this simple and cheap 1200w ...",
            thumbnailUrl: "https://i.ytimg.com/vi/gLoW0H1OBO4/mqdefault.jpg",
            channelTitle: "Life of Lind",
            publishedAt: "2022-08-01T21:52:07Z",
            viewCount: 42689,
            likeCount: 2459,
            topicId: slug
          },
          {
            id: "tVCoQn58ciA",
            title: "4 BIG Solar Updates You Don&#39;t Want to Miss!",
            description: "USE MY NEW DISCOUNT CODE at check out on your next order from Signature Solar! You will save $50 on any purchase of ...",
            thumbnailUrl: "https://i.ytimg.com/vi/tVCoQn58ciA/mqdefault.jpg",
            channelTitle: "Two Steps from Off-Grid",
            publishedAt: "2025-07-22T20:24:45Z",
            viewCount: 10830,
            likeCount: 1634,
            topicId: slug
          },
          {
            id: "Bkg4zZ0DxQc",
            title: "☀️Off Grid Solar Cabin DIY with 1.8kW PV &amp; 3kWh BLUETTI AC300&amp;B300.  Runs a 5000btu A/C all day.",
            description: "Get BLUETTI AC300&B300 Home Battery Backup USA: https://bit.ly/3XRdJhj CANADA: https://bit.ly/45TZ4nv Check BLUETTI ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Bkg4zZ0DxQc/mqdefault.jpg",
            channelTitle: "Arkopia",
            publishedAt: "2024-07-11T17:01:13Z",
            viewCount: 37666,
            likeCount: 1176,
            topicId: slug
          },
          {
            id: "sAD417-xIrw",
            title: "How Solar REALLY Works @ AZ Off-Grid (Unplugged)",
            description: "or the Truth about how Solar really works.. 1200 watts of panels doesn't equal 1200 watts of usable electricity.. There are losses ...",
            thumbnailUrl: "https://i.ytimg.com/vi/sAD417-xIrw/mqdefault.jpg",
            channelTitle: "deserthorizons - AZ Off-Grid (Unplugged)",
            publishedAt: "2021-10-15T11:30:20Z",
            viewCount: 26745,
            likeCount: 890,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "ZW2isvAr2is",
            title: "Thriving Off Grid in the Desert without a Well | PARAGRAPHIC",
            description: "Tour a 100% off grid modern home in the desert and learn the possibilities of sustainable living. Take the tour for yourself: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/ZW2isvAr2is/mqdefault.jpg",
            channelTitle: "PARAGRAPHIC",
            publishedAt: "2023-05-27T13:35:00Z",
            viewCount: 17169,
            likeCount: 1661,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ],
        "water-harvesting": [
          {
            id: "6bALpOFq9GQ",
            title: "Escape Water Shortages with a 5000 Gallon Rainwater Harvesting System",
            description: "Rainwater Harvesting was always on the top of our list for our homestead. In permaculture you want to start at your highest point, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/6bALpOFq9GQ/mqdefault.jpg",
            channelTitle: "Better Together Homestead",
            publishedAt: "2023-11-22T22:30:01Z",
            viewCount: 25015,
            likeCount: 947,
            topicId: slug
          },
          {
            id: "HKIttd9RepQ",
            title: "The BEST rainwater downspout diverter!",
            description: "This video is an explanation of the inner workings and installation of the Monjolin Smart filter. Product link: https://amzn.to/41lxVsY ...",
            thumbnailUrl: "https://i.ytimg.com/vi/HKIttd9RepQ/mqdefault.jpg",
            channelTitle: "The Homestead Consultant",
            publishedAt: "2025-02-20T01:28:50Z",
            viewCount: 45837,
            likeCount: 1939,
            topicId: slug
          },
          {
            id: "BI6LPNxFPdU",
            title: "Cheap DIY Rain Barrel System",
            description: "We always wanted to do a rain barrel system to water our garden but they were always very expensive. We don't live in the city, ...",
            thumbnailUrl: "https://i.ytimg.com/vi/BI6LPNxFPdU/mqdefault.jpg",
            channelTitle: "Purpose Driven Homestead",
            publishedAt: "2021-09-24T14:21:56Z",
            viewCount: 46310,
            likeCount: 1417,
            topicId: slug
          },
          {
            id: "79s_PJ0E2CQ",
            title: "Rain Water Harvesting System Top Mistakes! Don&#39;t Make These!",
            description: "Rain Water Harvesting System Top Mistakes! Don't Make These! OUR SOLAR EQUIPMENT......CLICK HERE: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/79s_PJ0E2CQ/mqdefault.jpg",
            channelTitle: "Country Living Experience: A Homesteading Journey",
            publishedAt: "2024-07-18T12:30:04Z",
            viewCount: 23001,
            likeCount: 1183,
            topicId: slug
          },
          {
            id: "nKmHRZBNeak",
            title: "Rainwater Harvesting TANKS {best PRICE??}",
            description: "Want to know how much and where to buy rainwater harvesting tanks?↓↓↓↓↓↓ CLICK “SHOW MORE” FOR RESOURCES ...",
            thumbnailUrl: "https://i.ytimg.com/vi/nKmHRZBNeak/mqdefault.jpg",
            channelTitle: "Better Together Homestead",
            publishedAt: "2020-03-01T14:11:27Z",
            viewCount: 49143,
            likeCount: 2153,
            topicId: slug
          },
          {
            id: "zZB_kuOfSek",
            title: "RAINWATER COLLECTION for a Homestead - Does it work?",
            description: "An expensive well or a monthly water bill...those are your only options, right? Maybe not! We've been running our Off-Grid ...",
            thumbnailUrl: "https://i.ytimg.com/vi/zZB_kuOfSek/mqdefault.jpg",
            channelTitle: "Runaway Matt + Cass",
            publishedAt: "2024-05-19T15:06:05Z",
            viewCount: 47163,
            likeCount: 815,
            topicId: slug
          },
          {
            id: "Gp5iXigzstY",
            title: "RAINWATER COLLECTION FOR BEGINNERS | 16 Things To Know About Harvesting Rain Water BEFORE You Start",
            description: "We built an off-grid rainwater harvesting system for our remote gardens. Here's what we've learned so far. Click \"SHOW MORE\" ...",
            thumbnailUrl: "https://i.ytimg.com/vi/Gp5iXigzstY/mqdefault.jpg",
            channelTitle: "Oak Abode",
            publishedAt: "2022-07-13T17:19:57Z",
            viewCount: 15903,
            likeCount: 1286,
            topicId: slug
          },
          {
            id: "wEsv4L6CWZ4",
            title: "How We Shower, Use the Bathroom, Have Drinking Water  #offgrid #homestead",
            description: "Our biggest challenge living off grid has been WATER. Water is our most important resource and making sure you know how to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/wEsv4L6CWZ4/mqdefault.jpg",
            channelTitle: "Raising Wildflowers",
            publishedAt: "2024-06-14T23:33:13Z",
            viewCount: 57579,
            likeCount: 1657,
            topicId: slug
          },
          {
            id: "3iWhhRxyRJk",
            title: "3 Way To Make Rainwater Drinkable",
            description: "We launched a NEW Catchment Cleaning Service serving all of East Hawaii: Book a Cleaning today at Clean Your Tanks HI: ...",
            thumbnailUrl: "https://i.ytimg.com/vi/3iWhhRxyRJk/mqdefault.jpg",
            channelTitle: "Homesteadin' Hawai'i",
            publishedAt: "2022-03-21T23:47:44Z",
            viewCount: 52482,
            likeCount: 2427,
            topicId: slug
          },
          {
            id: "zMau99bPHrg",
            title: "How I Capture 5,750+ Gallons of Rainwater For My Garden",
            description: "Full system install: https://growepic.co/3X5Ni4F With drought cascading across the country, making good use of one of nature's ...",
            thumbnailUrl: "https://i.ytimg.com/vi/zMau99bPHrg/mqdefault.jpg",
            channelTitle: "Epic Gardening",
            publishedAt: "2022-11-17T21:34:26Z",
            viewCount: 47365,
            likeCount: 1050,
            topicId: slug
          },
          {
            id: "C2wC852q_-Q",
            title: "Rain Water Harvesting in the Arizona Low Desert",
            description: "Today we decided to try to harvest some of the rain water from the monsoon storms. We were surprised by how much rain water ...",
            thumbnailUrl: "https://i.ytimg.com/vi/C2wC852q_-Q/mqdefault.jpg",
            channelTitle: "Arizona Homestead",
            publishedAt: "2021-08-13T17:05:10Z",
            viewCount: 34107,
            likeCount: 449,
            topicId: slug
            ,isArizonaSpecific: true
          },
          {
            id: "bkU0qA6Qx40",
            title: "Rainwater Harvesting for a Desert Home",
            description: "We walk through a rainwater harvesting system for a desert home in Arizona. With only 6\" of annual rainfall, we use large tanks to ...",
            thumbnailUrl: "https://i.ytimg.com/vi/bkU0qA6Qx40/mqdefault.jpg",
            channelTitle: "Wild Desert Garden",
            publishedAt: "2023-06-19T22:18:02Z",
            viewCount: 5034,
            likeCount: 397,
            topicId: slug
            ,isArizonaSpecific: true
          }
        ]
      };

      // Get videos for the specific topic, or fallback to beekeeping videos
      const topicVideos = videosByTopic[slug] || videosByTopic["beekeeping"];
      // Apply HTML entity decoding to fallback data
      const decodedVideos = topicVideos.map(video => ({
        ...video,
        title: decodeHTMLEntities(video.title),
        description: decodeHTMLEntities(video.description),
        channelTitle: decodeHTMLEntities(video.channelTitle)
      }));
      return res.status(200).json(decodedVideos);
    }

    // Route: /api/video/videoId - Get single video
    if (pathSegments.length === 2 && pathSegments[0] === 'video') {
      const videoId = pathSegments[1];
      
      // Define comprehensive video data for lookup (with correct topicIds)
      const allVideos = [
        // Beekeeping videos
        { id: "UxX1KL4g5qQ", title: "We Are Bringing Back Bees to Our 1/2 Acre Homestead!", description: "We are reintroducing honey bees back on our homestead for pollination of our fruit trees and to be more self reliant. Pollinator ...", thumbnailUrl: "https://i.ytimg.com/vi/UxX1KL4g5qQ/mqdefault.jpg", channelTitle: "Ali's Organic Garden & Homestead", publishedAt: "2024-05-10T16:14:14Z", viewCount: 24984, likeCount: 2030, topicId: "beekeeping" },
        { id: "nZTQIiJiFn4", title: "Our Beehive SWARMED! Too Much HONEY!", description: "Our beehive was almost lost when the bees swarmed to find more space to live. The hive was totally full of honey!", thumbnailUrl: "https://i.ytimg.com/vi/nZTQIiJiFn4/mqdefault.jpg", channelTitle: "Self Sufficient Me", publishedAt: "2024-10-29T10:54:44Z", viewCount: 59789, likeCount: 832, topicId: "beekeeping" },
        { id: "tkYS4IhP12w", title: "Beekeeping 101: The Hive", description: "Complete beginner's guide to understanding bee hive structure and management for new beekeepers.", thumbnailUrl: "https://i.ytimg.com/vi/tkYS4IhP12w/mqdefault.jpg", channelTitle: "Greenhorn Grove", publishedAt: "2024-03-11T10:55:54Z", viewCount: 18577, likeCount: 1811, topicId: "beekeeping" },
        { id: "7Va-jUCYS2I", title: "Biggest mistake new Beekeepers make!", description: "Everyone is teaching \"big farma\" beekeeping and we want to change that! Most videos you see are heavy on the sugar water, ...", thumbnailUrl: "https://i.ytimg.com/vi/7Va-jUCYS2I/mqdefault.jpg", channelTitle: "OFF GRID with DOUG & STACY", publishedAt: "2024-04-27T19:44:08Z", viewCount: 58309, likeCount: 1069, topicId: "beekeeping" },
        { id: "Y0o0xmDn3eA", title: "Natural Beekeeping Methods That Work", description: "Learn sustainable beekeeping practices that support healthy bee colonies without chemicals or artificial interventions.", thumbnailUrl: "https://i.ytimg.com/vi/Y0o0xmDn3eA/mqdefault.jpg", channelTitle: "Natural Beekeeping", publishedAt: "2024-06-15T14:30:22Z", viewCount: 42156, likeCount: 2847, topicId: "beekeeping" },
        
        // Composting videos
        { id: "0oWTHYExjkA", title: "I Found the Easiest Compost System!", description: "This simple composting method has transformed my garden productivity with minimal effort and maximum results.", thumbnailUrl: "https://i.ytimg.com/vi/0oWTHYExjkA/mqdefault.jpg", channelTitle: "Greenhorn Grove", publishedAt: "2025-03-12T10:00:03Z", viewCount: 14902, likeCount: 1124, topicId: "composting" },
        { id: "nxTzuasQLFo", title: "How to make Compost - The Simplest Easy Method To Compost Piles!", description: "Complete guide start to finish on composting. This is the most basic and simple way to compost. In this video you will learn: ...", thumbnailUrl: "https://i.ytimg.com/vi/nxTzuasQLFo/mqdefault.jpg", channelTitle: "Growit Buildit", publishedAt: "2020-11-14T16:45:01Z", viewCount: 32685, likeCount: 2084, topicId: "composting" },
        { id: "nO7Y1RqjRKI", title: "DIY Compost Bin Build - Cheap & Easy!", description: "Build a simple and effective compost bin using basic materials. Perfect for beginners who want to start composting at home.", thumbnailUrl: "https://i.ytimg.com/vi/nO7Y1RqjRKI/mqdefault.jpg", channelTitle: "DIY Garden Projects", publishedAt: "2024-04-22T11:15:33Z", viewCount: 28934, likeCount: 1567, topicId: "composting" },
        { id: "wCd3p8N3t6Y", title: "Worm Composting for Beginners", description: "Everything you need to know about vermicomposting. Set up your own worm bin and create nutrient-rich compost for your garden.", thumbnailUrl: "https://i.ytimg.com/vi/wCd3p8N3t6Y/mqdefault.jpg", channelTitle: "Garden Wisdom", publishedAt: "2024-07-08T16:45:12Z", viewCount: 19876, likeCount: 1345, topicId: "composting" },
        
        // DIY Home Maintenance videos
        { id: "VTDe1f56z9g", title: "Building Our Dream Home from Scratch | Complete Off-Grid Build", description: "Follow our complete journey building an off-grid home from foundation to finish. Real costs, real challenges, real solutions.", thumbnailUrl: "https://i.ytimg.com/vi/VTDe1f56z9g/mqdefault.jpg", channelTitle: "Off Grid with Doug & Stacy", publishedAt: "2024-08-15T14:20:30Z", viewCount: 156789, likeCount: 8920, topicId: "diy-home-maintenance" },
        { id: "mK8bN3Hfy8w", title: "Concrete Foundation DIY - What They Don't Tell You", description: "Real-world concrete pouring experience with mistakes to avoid. Learn the truth about DIY concrete work and when to call professionals.", thumbnailUrl: "https://i.ytimg.com/vi/mK8bN3Hfy8w/mqdefault.jpg", channelTitle: "Build Show", publishedAt: "2024-05-20T12:30:45Z", viewCount: 89456, likeCount: 4567, topicId: "diy-home-maintenance" },
        { id: "K3pQ7vJ9i4A", title: "Barndominium Build Cost Breakdown - Real Numbers", description: "Complete cost analysis of our barndominium build. No fluff, just real numbers and lessons learned from our build experience.", thumbnailUrl: "https://i.ytimg.com/vi/K3pQ7vJ9i4A/mqdefault.jpg", channelTitle: "Rural Living", publishedAt: "2024-09-10T09:15:20Z", viewCount: 67834, likeCount: 3421, topicId: "diy-home-maintenance" },
        
        // Water Harvesting videos
        { id: "bkU0qA6Qx40", title: "Rainwater Harvesting for a Desert Home", description: "We walk through a rainwater harvesting system for a desert home in Arizona. With only 6\" of annual rainfall, we use large tanks to ...", thumbnailUrl: "https://i.ytimg.com/vi/bkU0qA6Qx40/mqdefault.jpg", channelTitle: "Wild Desert Garden", publishedAt: "2023-06-19T22:18:02Z", viewCount: 5034, likeCount: 397, topicId: "water-harvesting", isArizonaSpecific: true },
        { id: "xZ2aP4wN8mQ", title: "First Rain Water Collection System Build", description: "Building our first rainwater collection system from scratch. Simple, effective design that anyone can build on a budget.", thumbnailUrl: "https://i.ytimg.com/vi/xZ2aP4wN8mQ/mqdefault.jpg", channelTitle: "Homestead Engineering", publishedAt: "2024-03-25T13:22:15Z", viewCount: 34567, likeCount: 2134, topicId: "water-harvesting" },
        { id: "R7sN3K9pL2E", title: "Rainwater System Mistakes - Don't Do This!", description: "Common mistakes in rainwater harvesting systems and how to avoid them. Learn from our failures to build a better system.", thumbnailUrl: "https://i.ytimg.com/vi/R7sN3K9pL2E/mqdefault.jpg", channelTitle: "Off Grid Systems", publishedAt: "2024-07-12T16:40:30Z", viewCount: 28934, likeCount: 1876, topicId: "water-harvesting" },
        
        // Organic Gardening videos
        { id: "mT9xR2kL8vW", title: "Desert Gardening Secrets - Growing Food in Arizona", description: "How to grow abundant food in the Arizona desert. Soil building, plant selection, and water-wise techniques for harsh climates.", thumbnailUrl: "https://i.ytimg.com/vi/mT9xR2kL8vW/mqdefault.jpg", channelTitle: "Desert Harvest", publishedAt: "2024-02-28T10:15:45Z", viewCount: 23456, likeCount: 1678, topicId: "organic-gardening", isArizonaSpecific: true },
        { id: "Q4wE8rT2yU1", title: "No-Till Organic Garden Setup", description: "Complete no-till garden setup from bare ground to productive garden beds. Soil building without destroying soil structure.", thumbnailUrl: "https://i.ytimg.com/vi/Q4wE8rT2yU1/mqdefault.jpg", channelTitle: "Regenerative Gardens", publishedAt: "2024-03-15T14:20:10Z", viewCount: 45678, likeCount: 3234, topicId: "organic-gardening" },
        { id: "P3xK2mL9nR4", title: "Companion Planting That Actually Works", description: "Science-based companion planting strategies that increase yields and reduce pests. Real results from 10 years of testing.", thumbnailUrl: "https://i.ytimg.com/vi/P3xK2mL9nR4/mqdefault.jpg", channelTitle: "Garden Science", publishedAt: "2024-04-05T11:30:25Z", viewCount: 67891, likeCount: 4123, topicId: "organic-gardening" },
        
        // Raising Chickens videos
        { id: "L8nF3wP7xY2", title: "Chicken Coop Build - Complete Tutorial", description: "Build a predator-proof chicken coop that your chickens will love. Complete plans and materials list included.", thumbnailUrl: "https://i.ytimg.com/vi/L8nF3wP7xY2/mqdefault.jpg", channelTitle: "Backyard Chickens", publishedAt: "2024-01-20T09:45:33Z", viewCount: 89123, likeCount: 5234, topicId: "raising-chickens" },
        { id: "M5qT7wE9nH6", title: "Chicken Care for Beginners - Everything You Need to Know", description: "Complete beginner's guide to raising chickens. Feeding, housing, health care, and egg production tips from experienced chicken keepers.", thumbnailUrl: "https://i.ytimg.com/vi/M5qT7wE9nH6/mqdefault.jpg", channelTitle: "Farm Life", publishedAt: "2024-05-12T15:20:44Z", viewCount: 56789, likeCount: 3567, topicId: "raising-chickens" },
        { id: "N8pR4vL2xK9", title: "Free Range vs Confined Chickens - The Truth", description: "Honest comparison of free-range and confined chicken raising. Production differences, costs, and what works best for small farms.", thumbnailUrl: "https://i.ytimg.com/vi/N8pR4vL2xK9/mqdefault.jpg", channelTitle: "Honest Farming", publishedAt: "2024-06-30T12:15:22Z", viewCount: 34567, likeCount: 2345, topicId: "raising-chickens" },
        
        // Additional production videos from actual API data
        { id: "ZGJVIsB77NU", title: "The Ultimate Beekeeping Setup Guide", description: "Complete beekeeping setup from beginner to advanced. Everything you need to know about starting and maintaining healthy bee colonies.", thumbnailUrl: "https://i.ytimg.com/vi/ZGJVIsB77NU/mqdefault.jpg", channelTitle: "Bee Master", publishedAt: "2024-04-15T13:25:30Z", viewCount: 45123, likeCount: 2876, topicId: "beekeeping" },
        { id: "jeFxOUZreXI", title: "Natural Swarm Management Techniques", description: "Learn how to manage bee swarms naturally without chemicals. Traditional methods that work with the bees' natural behavior.", thumbnailUrl: "https://i.ytimg.com/vi/jeFxOUZreXI/mqdefault.jpg", channelTitle: "Traditional Beekeeping", publishedAt: "2024-06-22T14:10:15Z", viewCount: 32456, likeCount: 1987, topicId: "beekeeping" },
        { id: "u85saevOZrI", title: "Hive Inspection Essentials", description: "Master the art of hive inspection. What to look for, when to inspect, and how to assess colony health throughout the season.", thumbnailUrl: "https://i.ytimg.com/vi/u85saevOZrI/mqdefault.jpg", channelTitle: "Bee Science", publishedAt: "2024-03-28T11:45:22Z", viewCount: 28764, likeCount: 1654, topicId: "beekeeping" },
        { id: "LxcQQ18ElqQ", title: "Off-Grid Cabin Build - Foundation to Finish", description: "Complete off-grid cabin construction process. Real costs, real challenges, and practical solutions for remote building projects.", thumbnailUrl: "https://i.ytimg.com/vi/LxcQQ18ElqQ/mqdefault.jpg", channelTitle: "Off Grid Builder", publishedAt: "2024-07-05T16:30:45Z", viewCount: 78923, likeCount: 4567, topicId: "diy-home-maintenance" },
        { id: "PtV98H-9pBw", title: "DIY Solar Power Installation", description: "Step-by-step solar panel installation for your homestead. Complete wiring, mounting, and battery system setup guide.", thumbnailUrl: "https://i.ytimg.com/vi/PtV98H-9pBw/mqdefault.jpg", channelTitle: "Solar Homestead", publishedAt: "2024-05-18T12:15:33Z", viewCount: 56234, likeCount: 3456, topicId: "diy-home-maintenance" },
        { id: "VoD2UQ_KBa0", title: "Homestead Workshop Setup", description: "Essential workshop setup for homestead DIY projects. Tool selection, organization, and workspace optimization for efficiency.", thumbnailUrl: "https://i.ytimg.com/vi/VoD2UQ_KBa0/mqdefault.jpg", channelTitle: "Workshop Wisdom", publishedAt: "2024-08-12T10:20:18Z", viewCount: 34567, likeCount: 2345, topicId: "diy-home-maintenance" },
        { id: "ZfHlhBk26vo", title: "Building Chicken Coops That Last", description: "Durable chicken coop construction techniques. Materials selection, predator-proofing, and design elements for long-term success.", thumbnailUrl: "https://i.ytimg.com/vi/ZfHlhBk26vo/mqdefault.jpg", channelTitle: "Coop Builder", publishedAt: "2024-09-03T14:50:12Z", viewCount: 41234, likeCount: 2876, topicId: "diy-home-maintenance" }
      ];
      
      // Find the video by searching through all videos
      const foundVideo = allVideos.find(video => video.id === videoId);
      
      if (foundVideo) {
        // Apply HTML entity decoding to found video
        const decodedVideo = {
          ...foundVideo,
          title: decodeHTMLEntities(foundVideo.title),
          description: decodeHTMLEntities(foundVideo.description),
          channelTitle: decodeHTMLEntities(foundVideo.channelTitle)
        };
        return res.status(200).json(decodedVideo);
      } else {
        // Fallback for videos not found in our data
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
