import cron from "node-cron";
import { storage } from "../storage";
import { youtubeService } from "./youtubeService";

export class CronService {
  static initializeCronJobs() {
    // Run daily at 2 AM to update video data
    cron.schedule("0 2 * * *", async () => {
      console.log("Starting daily video update job...");
      await CronService.updateAllTopicVideos();
    });

    console.log("Cron jobs initialized");
  }

  static async updateAllTopicVideos() {
    try {
      const topics = await storage.getAllTopics();
      
      for (const topic of topics) {
        try {
          await youtubeService.fetchVideosForTopic(topic.name, topic.id);
          // Add delay between requests to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
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
      { id: "homestead-security", name: "Homestead Security", description: "Protecting your property and family in rural settings.", slug: "homestead-security" },
    ];

    for (const topicData of topicsData) {
      await storage.upsertTopic(topicData);
    }

    console.log("Topics initialized");
  }
}
