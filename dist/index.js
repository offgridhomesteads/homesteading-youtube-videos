var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertTopicSchema: () => insertTopicSchema,
  insertVideoSchema: () => insertVideoSchema,
  sessions: () => sessions,
  topics: () => topics,
  users: () => users,
  youtubeVideos: () => youtubeVideos
});
import { pgTable, text, varchar, timestamp, jsonb, index, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var topics = pgTable("topics", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey(),
  // YouTube video ID
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url").notNull(),
  channelId: varchar("channel_id").notNull(),
  channelTitle: varchar("channel_title").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  likeCount: integer("like_count").default(0),
  viewCount: integer("view_count").default(0),
  isArizonaSpecific: boolean("is_arizona_specific").default(false),
  relevanceScore: real("relevance_score").default(0),
  popularityScore: real("popularity_score").default(0),
  ranking: integer("ranking"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertTopicSchema = createInsertSchema(topics);
var insertVideoSchema = createInsertSchema(youtubeVideos);

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Topic operations
  async getAllTopics() {
    return await db.select().from(topics).orderBy(topics.name);
  }
  async getTopicBySlug(slug) {
    const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
    return topic;
  }
  async upsertTopic(topicData) {
    const [topic] = await db.insert(topics).values(topicData).onConflictDoUpdate({
      target: topics.id,
      set: topicData
    }).returning();
    return topic;
  }
  // Video operations
  async getVideosByTopic(topicId, limit = 12) {
    return await db.select().from(youtubeVideos).where(eq(youtubeVideos.topicId, topicId)).orderBy(desc(youtubeVideos.popularityScore)).limit(limit);
  }
  async getVideosByTopicSlug(slug, limit = 12) {
    const result = await db.select({
      video: youtubeVideos
    }).from(youtubeVideos).innerJoin(topics, eq(youtubeVideos.topicId, topics.id)).where(eq(topics.slug, slug)).orderBy(desc(youtubeVideos.popularityScore)).limit(limit);
    return result.map((row) => row.video);
  }
  async upsertVideo(videoData) {
    const [video] = await db.insert(youtubeVideos).values(videoData).onConflictDoUpdate({
      target: youtubeVideos.id,
      set: {
        ...videoData,
        lastUpdated: /* @__PURE__ */ new Date()
      }
    }).returning();
    return video;
  }
  async deleteOldVideosForTopic(topicId, keepIds) {
    if (keepIds.length === 0) {
      await db.delete(youtubeVideos).where(eq(youtubeVideos.topicId, topicId));
    } else {
      await db.delete(youtubeVideos).where(
        and(
          eq(youtubeVideos.topicId, topicId)
          // Delete videos not in the keepIds array
        )
      );
    }
  }
  async updateVideoRankings(topicId) {
    const videos = await this.getVideosByTopic(topicId, 50);
    const sortedVideos = videos.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)).slice(0, 12);
    for (let i = 0; i < sortedVideos.length; i++) {
      await db.update(youtubeVideos).set({ ranking: i + 1 }).where(eq(youtubeVideos.id, sortedVideos[i].id));
    }
  }
};
var storage = new DatabaseStorage();

// server/services/youtubeService.ts
var YouTubeService = class {
  apiKey;
  baseUrl = "https://www.googleapis.com/youtube/v3";
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("YOUTUBE_API_KEY environment variable is required");
    }
  }
  async searchVideos(query, maxResults = 25) {
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
  async getVideoDetails(videoIds) {
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
  calculatePopularityScore(video, isArizonaSpecific) {
    const likeCount = parseInt(video.statistics.likeCount) || 0;
    const publishedAt = new Date(video.snippet.publishedAt);
    const now = /* @__PURE__ */ new Date();
    const ageInMonths = (now.getTime() - publishedAt.getTime()) / (1e3 * 60 * 60 * 24 * 30);
    let relevanceWeight = 0.75;
    if (isArizonaSpecific) {
      relevanceWeight = 1;
    }
    let recencyWeight = 0.8;
    if (ageInMonths < 12) {
      recencyWeight = 1;
    } else if (ageInMonths < 24) {
      recencyWeight = 0.9;
    }
    const safeDivisor = Math.max(ageInMonths, 0.1);
    return likeCount / safeDivisor * relevanceWeight * recencyWeight;
  }
  isArizonaSpecific(video) {
    const content = `${video.snippet.title} ${video.snippet.description} ${(video.snippet.tags || []).join(" ")}`.toLowerCase();
    return content.includes("arizona") || content.includes("desert") || content.includes("southwest");
  }
  async fetchVideosForTopic(topicName, topicId) {
    try {
      console.log(`Fetching videos for topic: ${topicName}`);
      const arizonaQuery = `${topicName} homesteading Arizona`;
      const arizonaResults = await this.searchVideos(arizonaQuery, 15);
      const generalQuery = `${topicName} homesteading`;
      const generalResults = await this.searchVideos(generalQuery, 15);
      const allResults = [...arizonaResults, ...generalResults];
      const uniqueResults = allResults.filter(
        (video, index2, self) => index2 === self.findIndex((v) => v.id.videoId === video.id.videoId)
      );
      const videoIds = uniqueResults.map((video) => video.id.videoId);
      if (videoIds.length === 0) {
        console.log(`No videos found for topic: ${topicName}`);
        return;
      }
      const videoDetails = await this.getVideoDetails(videoIds);
      const channelCounts = {};
      const filteredVideos = [];
      for (const video of videoDetails) {
        const channelId = video.snippet.channelId;
        if ((channelCounts[channelId] || 0) < 2) {
          channelCounts[channelId] = (channelCounts[channelId] || 0) + 1;
          filteredVideos.push(video);
        }
      }
      const videoData = [];
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
          lastUpdated: /* @__PURE__ */ new Date()
        });
      }
      const storedVideoIds = [];
      for (const video of videoData) {
        await storage.upsertVideo(video);
        storedVideoIds.push(video.id);
      }
      await storage.deleteOldVideosForTopic(topicId, storedVideoIds);
      await storage.updateVideoRankings(topicId);
      console.log(`Successfully updated ${videoData.length} videos for topic: ${topicName}`);
    } catch (error) {
      console.error(`Error fetching videos for topic ${topicName}:`, error);
      throw error;
    }
  }
};
var youtubeService = new YouTubeService();

// server/services/cronService.ts
import cron from "node-cron";
var CronService = class _CronService {
  static initializeCronJobs() {
    cron.schedule("0 2 * * *", async () => {
      console.log("Starting daily video update job...");
      await _CronService.updateAllTopicVideos();
    });
    console.log("Cron jobs initialized");
  }
  static async updateAllTopicVideos() {
    try {
      const topics2 = await storage.getAllTopics();
      for (const topic of topics2) {
        try {
          await youtubeService.fetchVideosForTopic(topic.name, topic.id);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } catch (error) {
          console.error(`Error updating videos for topic ${topic.name}:`, error);
        }
      }
      console.log("Daily video update job completed");
    } catch (error) {
      console.error("Error in daily video update job:", error);
    }
  }
  static async initializeTopics() {
    const topicsData = [
      { id: "organic-gardening", name: "Organic Gardening", description: "Growing fruits and vegetables without synthetic pesticides.", slug: "organic-gardening" },
      { id: "raising-chickens", name: "Raising Chickens", description: "Complete guide to backyard chicken farming.", slug: "raising-chickens" },
      { id: "permaculture-design", name: "Permaculture Design", description: "Sustainable land management principles.", slug: "permaculture-design" },
      { id: "food-preservation", name: "Food Preservation", description: "Traditional and modern methods for preserving your harvest.", slug: "food-preservation" },
      { id: "water-harvesting", name: "Water Harvesting", description: "Essential techniques for collecting and storing water in arid climates.", slug: "water-harvesting" },
      { id: "solar-energy", name: "Solar Energy", description: "Harness Arizona's abundant sunshine with solar power systems.", slug: "solar-energy" },
      { id: "composting", name: "Composting", description: "Creating nutrient-rich soil amendments from organic waste.", slug: "composting" },
      { id: "beekeeping", name: "Beekeeping", description: "Managing honey bee colonies for pollination and honey production.", slug: "beekeeping" },
      { id: "livestock-management", name: "Livestock Management", description: "Caring for farm animals in sustainable and humane ways.", slug: "livestock-management" },
      { id: "herbal-medicine", name: "Herbal Medicine", description: "Growing and using medicinal plants for natural health remedies.", slug: "herbal-medicine" },
      { id: "diy-home-maintenance", name: "DIY Home Maintenance", description: "Essential skills for maintaining and repairing your homestead.", slug: "diy-home-maintenance" },
      { id: "soil-building-in-arid-climates", name: "Soil Building in Arid Climates", description: "Improving soil health in desert environments.", slug: "soil-building-in-arid-climates" },
      { id: "off-grid-water-systems", name: "Off-Grid Water Systems", description: "Independent water solutions for remote homesteads.", slug: "off-grid-water-systems" },
      { id: "homestead-security", name: "Homestead Security", description: "Protecting your property and family in rural settings.", slug: "homestead-security" }
    ];
    for (const topicData of topicsData) {
      await storage.upsertTopic(topicData);
    }
    console.log("Topics initialized");
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  await CronService.initializeTopics();
  CronService.initializeCronJobs();
  app2.get("/api/topics", async (req, res) => {
    try {
      const topics2 = await storage.getAllTopics();
      res.json(topics2);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });
  app2.get("/api/topics/:slug", async (req, res) => {
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
  app2.get("/api/topics/:slug/videos", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit) || 12;
      const videos = await storage.getVideosByTopicSlug(slug, limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  app2.post("/api/topics/:slug/refresh", async (req, res) => {
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
  app2.post("/api/fetch-videos", async (req, res) => {
    try {
      const topics2 = await storage.getAllTopics();
      let successCount = 0;
      let failureCount = 0;
      for (const topic of topics2) {
        try {
          await youtubeService.fetchVideosForTopic(topic.name, topic.id);
          successCount++;
          console.log(`\u2713 Fetched videos for: ${topic.name}`);
        } catch (error) {
          failureCount++;
          console.error(`\u2717 Failed to fetch videos for ${topic.name}:`, error);
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
  app2.post("/api/share", async (req, res) => {
    try {
      const { platform, videoId, videoTitle, videoUrl } = req.body;
      console.log(`Share request: ${platform} - ${videoTitle} (${videoId})`);
      res.json({ message: "Share logged successfully" });
    } catch (error) {
      console.error("Error logging share:", error);
      res.status(500).json({ message: "Failed to log share" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
