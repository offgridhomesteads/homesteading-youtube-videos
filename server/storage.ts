import {
  users,
  topics,
  youtubeVideos,
  type User,
  type UpsertUser,
  type Topic,
  type InsertTopic,
  type YoutubeVideo,
  type InsertYoutubeVideo,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, not, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Topic operations
  getAllTopics(): Promise<Topic[]>;
  getTopicBySlug(slug: string): Promise<Topic | undefined>;
  upsertTopic(topic: InsertTopic): Promise<Topic>;
  
  // Video operations
  getVideosByTopic(topicId: string, limit?: number): Promise<YoutubeVideo[]>;
  getVideoById(videoId: string): Promise<YoutubeVideo | undefined>;
  upsertVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  getVideosByTopicSlug(slug: string, limit?: number): Promise<YoutubeVideo[]>;
  deleteOldVideosForTopic(topicId: string, keepIds: string[]): Promise<void>;
  updateVideoRankings(topicId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Topic operations
  async getAllTopics(): Promise<Topic[]> {
    return await db.select().from(topics).orderBy(topics.name);
  }

  async getTopicBySlug(slug: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.slug, slug));
    return topic;
  }

  async upsertTopic(topicData: InsertTopic): Promise<Topic> {
    const [topic] = await db
      .insert(topics)
      .values(topicData)
      .onConflictDoUpdate({
        target: topics.id,
        set: topicData,
      })
      .returning();
    return topic;
  }

  // Video operations
  async getVideosByTopic(topicId: string, limit = 12): Promise<YoutubeVideo[]> {
    return await db
      .select()
      .from(youtubeVideos)
      .where(eq(youtubeVideos.topicId, topicId))
      .orderBy(desc(youtubeVideos.popularityScore))
      .limit(limit);
  }

  async getVideoById(videoId: string): Promise<YoutubeVideo | undefined> {
    const [video] = await db.select().from(youtubeVideos).where(eq(youtubeVideos.id, videoId));
    return video;
  }

  async getVideosByTopicSlug(slug: string, limit = 12): Promise<YoutubeVideo[]> {
    const result = await db
      .select({
        video: youtubeVideos,
      })
      .from(youtubeVideos)
      .innerJoin(topics, eq(youtubeVideos.topicId, topics.id))
      .where(eq(topics.slug, slug))
      .orderBy(desc(youtubeVideos.popularityScore))
      .limit(limit);
    
    return result.map(row => row.video);
  }

  async upsertVideo(videoData: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const [video] = await db
      .insert(youtubeVideos)
      .values(videoData)
      .onConflictDoUpdate({
        target: youtubeVideos.id,
        set: {
          ...videoData,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return video;
  }

  async deleteOldVideosForTopic(topicId: string, keepIds: string[]): Promise<void> {
    if (keepIds.length === 0) {
      await db.delete(youtubeVideos).where(eq(youtubeVideos.topicId, topicId));
    } else {
      await db
        .delete(youtubeVideos)
        .where(
          and(
            eq(youtubeVideos.topicId, topicId),
            not(inArray(youtubeVideos.id, keepIds))
          )
        );
    }
  }

  async updateVideoRankings(topicId: string): Promise<void> {
    const videos = await this.getVideosByTopic(topicId, 50);
    
    // Sort by popularity score and assign rankings
    const sortedVideos = videos
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, 12);

    for (let i = 0; i < sortedVideos.length; i++) {
      await db
        .update(youtubeVideos)
        .set({ ranking: i + 1 })
        .where(eq(youtubeVideos.id, sortedVideos[i].id));
    }
  }
}

export const storage = new DatabaseStorage();
