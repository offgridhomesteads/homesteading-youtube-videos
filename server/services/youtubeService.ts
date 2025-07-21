export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVideos(topic: string, maxResults = 12): Promise<any[]> {
    try {
      // Primary search: topic + homesteading + Arizona
      const primaryQuery = `${topic} homesteading Arizona`;
      let videos = await this.performSearch(primaryQuery, Math.ceil(maxResults / 2));
      
      // Fallback search: general homesteading if we need more videos
      if (videos.length < maxResults) {
        const fallbackQuery = `${topic} homesteading`;
        const additionalVideos = await this.performSearch(fallbackQuery, maxResults - videos.length);
        videos = [...videos, ...additionalVideos];
      }

      // Get detailed video information
      const videoIds = videos.map(v => v.id.videoId).join(',');
      const detailedVideos = await this.getVideoDetails(videoIds);
      
      // Process and rank videos
      return this.processVideos(detailedVideos, topic);
    } catch (error) {
      console.error('YouTube API error:', error);
      return [];
    }
  }

  private async performSearch(query: string, maxResults: number): Promise<any[]> {
    const searchUrl = `${this.baseUrl}/search?` +
      `part=snippet&type=video&q=${encodeURIComponent(query)}&` +
      `maxResults=${maxResults}&key=${this.apiKey}&` +
      `order=relevance&videoDuration=medium&videoDefinition=high`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`YouTube search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  private async getVideoDetails(videoIds: string): Promise<any[]> {
    const detailsUrl = `${this.baseUrl}/videos?` +
      `part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`;

    const response = await fetch(detailsUrl);
    if (!response.ok) {
      throw new Error(`YouTube details failed: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  private processVideos(videos: any[], topic: string): any[] {
    return videos.map((video, index) => {
      const snippet = video.snippet;
      const stats = video.statistics;
      
      // Calculate relevance and popularity scores
      const isArizonaSpecific = this.isArizonaRelated(snippet.title, snippet.description);
      const relevanceScore = this.calculateRelevanceScore(snippet, topic, isArizonaSpecific);
      const popularityScore = this.calculatePopularityScore(stats, snippet.publishedAt);
      
      return {
        id: video.id,
        topicId: topic,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        channelId: snippet.channelId,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        likeCount: parseInt(stats.likeCount || '0'),
        viewCount: parseInt(stats.viewCount || '0'),
        duration: video.contentDetails.duration,
        isArizonaSpecific,
        relevanceScore,
        popularityScore,
        ranking: index + 1,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    });
  }

  private isArizonaRelated(title: string, description: string): boolean {
    const arizonaKeywords = [
      'arizona', 'az', 'desert', 'southwestern', 'sonoran', 'phoenix', 'tucson',
      'flagstaff', 'sedona', 'arid', 'dry climate', 'southwest'
    ];
    
    const text = (title + ' ' + description).toLowerCase();
    return arizonaKeywords.some(keyword => text.includes(keyword));
  }

  private calculateRelevanceScore(snippet: any, topic: string, isArizonaSpecific: boolean): number {
    let score = 50; // Base score
    
    const title = snippet.title.toLowerCase();
    const description = snippet.description.toLowerCase();
    const topicWords = topic.toLowerCase().split('-');
    
    // Topic relevance
    topicWords.forEach(word => {
      if (title.includes(word)) score += 15;
      if (description.includes(word)) score += 5;
    });
    
    // Arizona bonus
    if (isArizonaSpecific) score += 20;
    
    // Homesteading relevance
    if (title.includes('homestead') || description.includes('homestead')) score += 10;
    
    return Math.min(score, 100);
  }

  private calculatePopularityScore(stats: any, publishedAt: string): number {
    const likeCount = parseInt(stats.likeCount || '0');
    const viewCount = parseInt(stats.viewCount || '0');
    const daysOld = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    // Normalize view count (logarithmic scale)
    const viewScore = Math.log10(viewCount + 1) * 10;
    
    // Normalize like count
    const likeScore = Math.log10(likeCount + 1) * 5;
    
    // Recency bonus (newer videos get slight boost)
    const recencyScore = Math.max(0, 10 - (daysOld / 30));
    
    return Math.min(viewScore + likeScore + recencyScore, 100);
  }

  async fetchVideosForTopic(topicName: string, topicId: string): Promise<void> {
    try {
      const videos = await this.searchVideos(topicName, 12);
      
      if (videos.length > 0) {
        const { storage } = await import("../storage");
        
        // Store videos in database
        for (const video of videos) {
          const videoData = {
            ...video,
            topicId: topicId
          };
          await storage.upsertVideo(videoData);
        }
        
        // Clean up old videos (keep only latest 24)
        const videoIds = videos.map(v => v.id);
        await storage.deleteOldVideosForTopic(topicId, videoIds);
        
        console.log(`✓ Fetched ${videos.length} videos for topic: ${topicName}`);
      }
    } catch (error) {
      console.error(`Failed to fetch videos for ${topicName}:`, error);
      throw error;
    }
  }
}
