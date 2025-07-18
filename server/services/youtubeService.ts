import { storage } from "../storage";
import type { InsertYoutubeVideo } from "@shared/schema";

interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    tags?: string[];
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
}

export class YouTubeService {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("YOUTUBE_API_KEY environment variable is required");
    }
  }

  async searchVideos(query: string, maxResults = 25): Promise<YouTubeSearchResult[]> {
    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.append("part", "snippet");
      url.searchParams.append("q", query);
      url.searchParams.append("type", "video");
      url.searchParams.append("maxResults", maxResults.toString());
      url.searchParams.append("order", "relevance");
      url.searchParams.append("key", this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error searching YouTube videos:", error);
      throw error;
    }
  }

  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    try {
      const url = new URL(`${this.baseUrl}/videos`);
      url.searchParams.append("part", "snippet,statistics");
      url.searchParams.append("id", videoIds.join(","));
      url.searchParams.append("key", this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error getting YouTube video details:", error);
      throw error;
    }
  }

  calculatePopularityScore(video: YouTubeVideoDetails, isArizonaSpecific: boolean): number {
    const likeCount = parseInt(video.statistics.likeCount) || 0;
    const publishedAt = new Date(video.snippet.publishedAt);
    const now = new Date();
    const ageInMonths = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

    // Relevance weight
    let relevanceWeight = 0.75; // Default for general homesteading
    if (isArizonaSpecific) {
      relevanceWeight = 1.0;
    }

    // Recency weight
    let recencyWeight = 0.8; // Default for >2 years
    if (ageInMonths < 12) {
      recencyWeight = 1.0;
    } else if (ageInMonths < 24) {
      recencyWeight = 0.9;
    }

    // Avoid division by zero
    const safeDivisor = Math.max(ageInMonths, 0.1);
    
    return (likeCount / safeDivisor) * relevanceWeight * recencyWeight;
  }

  isArizonaSpecific(video: YouTubeVideoDetails): boolean {
    const content = `${video.snippet.title} ${video.snippet.description} ${(video.snippet.tags || []).join(" ")}`.toLowerCase();
    return content.includes("arizona") || content.includes("desert") || content.includes("southwest");
  }

  async fetchVideosForTopic(topicName: string, topicId: string): Promise<void> {
    try {
      console.log(`Fetching videos for topic: ${topicName}`);

      // Search for Arizona-specific videos first
      const arizonaQuery = `${topicName} homesteading Arizona`;
      const arizonaResults = await this.searchVideos(arizonaQuery, 15);

      // Search for general homesteading videos
      const generalQuery = `${topicName} homesteading`;
      const generalResults = await this.searchVideos(generalQuery, 15);

      // Combine and deduplicate results
      const allResults = [...arizonaResults, ...generalResults];
      const uniqueResults = allResults.filter((video, index, self) => 
        index === self.findIndex(v => v.id.videoId === video.id.videoId)
      );

      // Get video IDs for detailed information
      const videoIds = uniqueResults.map(video => video.id.videoId);
      
      if (videoIds.length === 0) {
        console.log(`No videos found for topic: ${topicName}`);
        return;
      }

      // Fetch detailed video information
      const videoDetails = await this.getVideoDetails(videoIds);

      // Filter by channel (max 2 videos per channel)
      const channelCounts: { [key: string]: number } = {};
      const filteredVideos: YouTubeVideoDetails[] = [];

      for (const video of videoDetails) {
        const channelId = video.snippet.channelId;
        if ((channelCounts[channelId] || 0) < 2) {
          channelCounts[channelId] = (channelCounts[channelId] || 0) + 1;
          filteredVideos.push(video);
        }
      }

      // Process and store videos
      const videoData: InsertYoutubeVideo[] = [];
      
      for (const video of filteredVideos.slice(0, 12)) {
        const isArizona = this.isArizonaSpecific(video);
        const popularityScore = this.calculatePopularityScore(video, isArizona);

        videoData.push({
          id: video.id,
          topicId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnailUrl: video.snippet.thumbnails.medium.url,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          publishedAt: new Date(video.snippet.publishedAt),
          likeCount: parseInt(video.statistics.likeCount) || 0,
          viewCount: parseInt(video.statistics.viewCount) || 0,
          isArizonaSpecific: isArizona,
          popularityScore,
          lastUpdated: new Date(),
        });
      }

      // Store videos in database
      const storedVideoIds: string[] = [];
      for (const video of videoData) {
        await storage.upsertVideo(video);
        storedVideoIds.push(video.id);
      }

      // Clean up old videos
      await storage.deleteOldVideosForTopic(topicId, storedVideoIds);

      // Update rankings
      await storage.updateVideoRankings(topicId);

      console.log(`Successfully updated ${videoData.length} videos for topic: ${topicName}`);
    } catch (error) {
      console.error(`Error fetching videos for topic ${topicName}:`, error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();
