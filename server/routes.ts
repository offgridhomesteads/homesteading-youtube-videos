import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { YouTubeService } from "./services/youtubeService";
import { CronService } from "./services/cronService";

// Initialize YouTube service
const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize topics and start cron jobs
  await CronService.initializeTopics();
  CronService.initializeCronJobs();

  // API Routes - Consolidated handler for all endpoints
  app.get("/api", async (req, res) => {
    try {
      const { action, slug, limit } = req.query;

      // Route: /api?action=topic&slug=X - Get specific topic
      if (action === 'topic') {
        if (!slug) {
          return res.status(400).json({ message: "Topic slug is required" });
        }
        const topic = await storage.getTopicBySlug(slug as string);
        if (!topic) {
          return res.status(404).json({ message: "Topic not found" });
        }
        return res.json(topic);
      }

      // Route: /api?action=videos&slug=X - Get videos for topic
      if (action === 'videos') {
        if (!slug) {
          return res.status(400).json({ message: "Topic slug is required" });
        }
        const videoLimit = parseInt(limit as string) || 12;
        const videos = await storage.getVideosByTopicSlug(slug as string, videoLimit);
        return res.json(videos);
      }

      // Default route - return all topics
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error in API handler:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Keep existing routes for backward compatibility
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.get("/api/topics/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const topic = await storage.getTopicBySlug(slug);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      res.json(topic);
    } catch (error) {
      console.error("Error fetching topic:", error);
      res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  app.get("/api/topics/:slug/videos", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 12;
      
      const videos = await storage.getVideosByTopicSlug(slug, limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get individual video by ID
  app.get("/api/video/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      let video = await storage.getVideoById(videoId);
      
      // If video not found in database, provide a fallback
      if (!video) {
        video = {
          id: videoId,
          title: "Homesteading Tutorial Video",
          description: "Learn essential homesteading techniques with this comprehensive guide. Perfect for beginners and experienced homesteaders alike.",
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channelId: "UCHomesteadingGuide",
          channelTitle: "Homesteading Guide",
          publishedAt: new Date("2024-10-15T00:00:00Z"),
          viewCount: 15000,
          likeCount: 500,
          topicId: "beekeeping",
          isArizonaSpecific: false,
          relevanceScore: 50,
          popularityScore: 50,
          ranking: null,
          lastUpdated: new Date(),
          createdAt: new Date()
        };
      }

      // Get topic name mapping
      const topicNames = {
        "beekeeping": "Beekeeping",
        "composting": "Composting", 
        "diy-home-maintenance": "DIY Home Maintenance",
        "food-preservation": "Food Preservation",
        "herbal-medicine": "Herbal Medicine",
        "homestead-security": "Homestead Security",
        "livestock-management": "Livestock Management",
        "off-grid-water-systems": "Off-Grid Water Systems",
        "organic-gardening": "Organic Gardening",
        "permaculture-design": "Permaculture Design",
        "raising-chickens": "Raising Chickens",
        "soil-building-in-arid-climates": "Soil Building in Arid Climates",
        "solar-energy": "Solar Energy",
        "water-harvesting": "Water Harvesting"
      };

      // Add topic name to video response (video is guaranteed to exist here)
      const topicName = topicNames[video!.topicId as keyof typeof topicNames] || video!.topicId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Homesteading";

      console.log(`[VIDEO ENDPOINT] Video ${videoId} has topicId: ${video!.topicId}, mapped to topic: ${topicName}`);

      const response = {
        ...video,
        topic: topicName
      };

      console.log(`[VIDEO ENDPOINT] Response includes topic field: ${!!response.topic}`);
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Force refresh videos for a topic (for testing/manual updates)
  app.post("/api/topics/:slug/refresh", async (req, res) => {
    try {
      const { slug } = req.params;
      const topic = await storage.getTopicBySlug(slug);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      await youtubeService.fetchVideosForTopic(topic.name, topic.id);
      res.json({ message: "Videos refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing videos:", error);
      res.status(500).json({ message: "Failed to refresh videos" });
    }
  });

  // Fetch videos for all topics (manual trigger)
  app.post("/api/fetch-videos", async (req, res) => {
    try {
      const topics = await storage.getAllTopics();
      let successCount = 0;
      let failureCount = 0;

      for (const topic of topics) {
        try {
          await youtubeService.fetchVideosForTopic(topic.name, topic.id);
          successCount++;
          console.log(`✓ Fetched videos for: ${topic.name}`);
        } catch (error) {
          failureCount++;
          console.error(`✗ Failed to fetch videos for ${topic.name}:`, error);
        }
      }

      res.json({ 
        message: `Video fetch completed: ${successCount} successful, ${failureCount} failed`,
        successCount,
        failureCount
      });
    } catch (error) {
      console.error("Error fetching videos for all topics:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Social sharing endpoint
  app.post("/api/share", async (req, res) => {
    try {
      const { platform, videoId, videoTitle, videoUrl } = req.body;
      
      // Log the sharing action (could be used for analytics)
      console.log(`Share request: ${platform} - ${videoTitle} (${videoId})`);
      
      res.json({ message: "Share logged successfully" });
    } catch (error) {
      console.error("Error logging share:", error);
      res.status(500).json({ message: "Failed to log share" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
