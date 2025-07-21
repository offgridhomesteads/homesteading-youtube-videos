// YouTube API service for Vercel production deployment
export class YouTubeService {
  constructor(apiKey = process.env.YOUTUBE_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async searchVideos(topic, limit = 12) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const searchQueries = [
      `${topic} homesteading Arizona`,
      `${topic} homesteading`
    ];

    const allVideos = [];
    const channelVideoCounts = new Map();

    for (const query of searchQueries) {
      try {
        const searchUrl = `${this.baseUrl}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=25&key=${this.apiKey}`;
        console.log(`Searching YouTube for: "${query}"`);
        
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
          console.error(`YouTube search failed: ${searchResponse.status} ${searchResponse.statusText}`);
          continue;
        }

        const searchData = await searchResponse.json();
        console.log(`Found ${searchData.items?.length || 0} videos for "${query}"`);

        if (!searchData.items) continue;

        // Get video statistics
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        const statsUrl = `${this.baseUrl}/videos?part=statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`;
        
        const statsResponse = await fetch(statsUrl);
        if (!statsResponse.ok) {
          console.error(`YouTube stats failed: ${statsResponse.status} ${statsResponse.statusText}`);
          continue;
        }

        const statsData = await statsResponse.json();
        const statsMap = new Map();
        statsData.items?.forEach(item => {
          statsMap.set(item.id, item);
        });

        // Process videos
        for (const item of searchData.items) {
          const videoId = item.id.videoId;
          const stats = statsMap.get(videoId);
          const channelTitle = item.snippet.channelTitle;

          // Limit to 2 videos per channel for variety
          const channelCount = channelVideoCounts.get(channelTitle) || 0;
          if (channelCount >= 2) continue;

          const isArizonaSpecific = this.isArizonaContent(item.snippet.title, item.snippet.description);
          const relevanceScore = this.calculateRelevanceScore(item.snippet.title, item.snippet.description, topic);
          const popularityScore = this.calculatePopularityScore(stats?.statistics);

          const video = {
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            channelId: item.snippet.channelId,
            channelTitle: channelTitle,
            publishedAt: item.snippet.publishedAt,
            likeCount: parseInt(stats?.statistics?.likeCount || '0'),
            viewCount: parseInt(stats?.statistics?.viewCount || '0'),
            duration: stats?.contentDetails?.duration || 'PT0S',
            isArizonaSpecific,
            relevanceScore,
            popularityScore,
            ranking: 0,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          allVideos.push(video);
          channelVideoCounts.set(channelTitle, channelCount + 1);
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error.message);
      }
    }

    // Sort by popularity score and limit results
    const sortedVideos = allVideos
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);

    // Add ranking
    sortedVideos.forEach((video, index) => {
      video.ranking = index + 1;
    });

    console.log(`Returning ${sortedVideos.length} videos for topic: ${topic}`);
    if (sortedVideos.length > 0) {
      console.log('Sample titles:', sortedVideos.slice(0, 2).map(v => v.title));
    }

    return sortedVideos;
  }

  isArizonaContent(title, description) {
    const content = `${title} ${description}`.toLowerCase();
    const arizonaKeywords = [
      'arizona', 'az', 'desert', 'sonoran', 'phoenix', 'tucson', 'scottsdale',
      'mesa', 'chandler', 'glendale', 'tempe', 'peoria', 'surprise', 'goodyear',
      'avondale', 'buckeye', 'el mirage', 'tolleson', 'litchfield park',
      'cochise county', 'pima county', 'maricopa county', 'yuma county',
      'mohave county', 'coconino county', 'navajo county', 'apache county',
      'graham county', 'greenlee county', 'la paz county', 'santa cruz county',
      'gila county', 'yavapai county', 'pinal county'
    ];
    
    return arizonaKeywords.some(keyword => content.includes(keyword));
  }

  calculateRelevanceScore(title, description, topic) {
    const content = `${title} ${description}`.toLowerCase();
    const topicWords = topic.toLowerCase().split(/[\s-]+/);
    
    let score = 0;
    topicWords.forEach(word => {
      if (content.includes(word)) {
        score += title.toLowerCase().includes(word) ? 20 : 10;
      }
    });
    
    // Bonus for homesteading-related terms
    const homesteadingTerms = ['homestead', 'self-sufficient', 'off-grid', 'sustainable', 'farming', 'ranch'];
    homesteadingTerms.forEach(term => {
      if (content.includes(term)) {
        score += 15;
      }
    });
    
    return Math.min(score, 100);
  }

  calculatePopularityScore(statistics) {
    if (!statistics) return 0;
    
    const views = parseInt(statistics.viewCount || '0');
    const likes = parseInt(statistics.likeCount || '0');
    
    // Normalize scores (adjust these weights as needed)
    const viewScore = Math.min(views / 1000, 50); // Max 50 points for views
    const likeScore = Math.min(likes / 10, 30); // Max 30 points for likes
    const engagementScore = views > 0 ? Math.min((likes / views) * 1000, 20) : 0; // Max 20 points for engagement rate
    
    return Math.round(viewScore + likeScore + engagementScore);
  }
}
