import { pgTable, text, varchar, timestamp, jsonb, index, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Topics table for homesteading categories
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// YouTube videos cache table
export const youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey(), // YouTube video ID
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertTopicSchema = createInsertSchema(topics);
export const insertVideoSchema = createInsertSchema(youtubeVideos);

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type InsertYoutubeVideo = z.infer<typeof insertVideoSchema>;
