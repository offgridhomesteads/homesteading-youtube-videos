import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeService } from "./services/youtubeService";
import { CronService } from "./services/cronService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize topics and start cron jobs
  await CronService.initializeTopics();
  CronService.initializeCronJobs();

  // API Routes
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
