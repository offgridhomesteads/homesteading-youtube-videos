import { pool } from './db.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Topics for homesteading video searches
const TOPICS = [
  { id: 'beekeeping', searchTerms: ['beekeeping homestead', 'backyard beekeeping', 'honey bee keeping'] },
  { id: 'composting', searchTerms: ['composting homestead', 'compost bin diy', 'organic composting'] },
  { id: 'diy-home-maintenance', searchTerms: ['homestead maintenance', 'diy home repair', 'off grid maintenance'] },
  { id: 'raising-chickens', searchTerms: ['backyard chickens', 'chicken coop homestead', 'raising chickens'] },
  { id: 'organic-gardening', searchTerms: ['organic gardening', 'homestead garden', 'vegetable gardening'] },
  { id: 'herbal-medicine', searchTerms: ['medicinal herbs', 'herbal medicine garden', 'growing herbs'] },
  { id: 'water-harvesting', searchTerms: ['rainwater harvesting', 'water collection homestead', 'rain catchment'] },
  { id: 'permaculture-design', searchTerms: ['permaculture design', 'sustainable farming', 'permaculture homestead'] },
  { id: 'solar-power', searchTerms: ['solar power homestead', 'off grid solar', 'diy solar system'] },
  { id: 'homestead-security', searchTerms: ['homestead security', 'rural property security', 'farm security'] },
  { id: 'food-preservation', searchTerms: ['food preservation', 'canning homestead', 'food storage'] },
  { id: 'livestock-management', searchTerms: ['livestock homestead', 'raising animals', 'farm animals'] },
  { id: 'alternative-energy', searchTerms: ['alternative energy', 'renewable energy homestead', 'wind power'] },
  { id: 'emergency-preparedness', searchTerms: ['emergency preparedness', 'homestead preparedness', 'survival skills'] },
  { id: 'off-grid-water-systems', searchTerms: ['off grid water', 'well water system', 'water pump homestead'] }
];

async function searchYouTubeVideos(searchTerm, maxResults = 10) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&q=${encodeURIComponent(searchTerm)}&maxResults=${maxResults}&order=relevance&videoDuration=medium&key=${YOUTUBE_API_KEY}`;
  
  console.log(`Searching YouTube for: ${searchTerm}`);
  
  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.items || [];
}

async function getVideoDetails(videoIds) {
  if (!videoIds.length) return [];
  
  const videoUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.items || [];
}

function calculateRelevanceScore(video, searchTerm) {
  const title = video.snippet.title.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  let score = 0;
  
  // Title relevance (higher weight)
  if (title.includes('homestead')) score += 15;
  if (title.includes('diy')) score += 10;
  if (title.includes('organic')) score += 8;
  if (title.includes('natural')) score += 8;
  if (title.includes('beginner')) score += 12;
  if (title.includes('complete guide')) score += 15;
  
  // Search term presence
  const searchWords = searchLower.split(' ');
  searchWords.forEach(word => {
    if (title.includes(word)) score += 5;
    if (description.includes(word)) score += 2;
  });
  
  // Video statistics boost
  const stats = video.statistics;
  if (stats.viewCount) {
    const views = parseInt(stats.viewCount);
    if (views > 100000) score += 10;
    if (views > 50000) score += 5;
  }
  
  if (stats.likeCount) {
    const likes = parseInt(stats.likeCount);
    if (likes > 1000) score += 8;
    if (likes > 500) score += 4;
  }
  
  return score;
}

async function updateTopicVideos(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }
  
  console.log(`Updating videos for topic: ${topicId}`);
  
  // Clear existing videos for this topic
  await pool.query('DELETE FROM youtube_videos WHERE topic_id = $1', [topicId]);
  
  let allVideos = [];
  
  // Search using multiple terms for better coverage
  for (const searchTerm of topic.searchTerms) {
    try {
      const searchResults = await searchYouTubeVideos(searchTerm, 15);
      
      if (searchResults.length > 0) {
        const videoIds = searchResults.map(item => item.id.videoId);
        const videoDetails = await getVideoDetails(videoIds);
        
        // Calculate relevance scores
        const scoredVideos = videoDetails.map(video => ({
          ...video,
          relevanceScore: calculateRelevanceScore(video, searchTerm)
        }));
        
        allVideos.push(...scoredVideos);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error searching for "${searchTerm}":`, error.message);
    }
  }
  
  // Remove duplicates and sort by relevance score
  const uniqueVideos = allVideos.filter((video, index, arr) => 
    arr.findIndex(v => v.id === video.id) === index
  );
  
  const topVideos = uniqueVideos
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
  
  // Insert into database
  for (let i = 0; i < topVideos.length; i++) {
    const video = topVideos[i];
    const snippet = video.snippet;
    const stats = video.statistics;
    
    await pool.query(`
      INSERT INTO youtube_videos (
        id, topic_id, title, description, thumbnail_url,
        channel_id, channel_title, published_at, like_count,
        view_count, relevance_score, ranking, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `, [
      video.id,
      topicId,
      snippet.title,
      snippet.description.substring(0, 500), // Limit description length
      snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
      snippet.channelId,
      snippet.channelTitle,
      snippet.publishedAt,
      parseInt(stats.likeCount || 0),
      parseInt(stats.viewCount || 0),
      video.relevanceScore,
      i + 1
    ]);
  }
  
  console.log(`✓ Updated ${topVideos.length} videos for ${topicId}`);
  return topVideos.length;
}

async function updateAllTopics() {
  const startTime = new Date();
  console.log(`🌅 Starting daily video update at ${startTime.toLocaleString('en-US', { timeZone: 'America/New_York' })} Eastern Time`);
  
  let totalUpdated = 0;
  let successCount = 0;
  let failureCount = 0;
  
  for (const topic of TOPICS) {
    try {
      console.log(`🔄 Updating ${topic.id}...`);
      const count = await updateTopicVideos(topic.id);
      totalUpdated += count;
      successCount++;
      
      // Rate limiting between topics to respect YouTube API limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`❌ Failed to update topic ${topic.id}:`, error.message);
      failureCount++;
    }
  }
  
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`✅ Daily update complete in ${duration}s at ${endTime.toLocaleString('en-US', { timeZone: 'America/New_York' })} Eastern Time`);
  console.log(`📊 Results: ${totalUpdated} videos updated, ${successCount} topics successful, ${failureCount} failed`);
  
  return totalUpdated;
}

export { updateTopicVideos, updateAllTopics, TOPICS };
