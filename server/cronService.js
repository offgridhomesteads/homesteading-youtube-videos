import cron from 'node-cron';
import { updateAllTopics } from './youtubeService.js';

let isUpdating = false;

async function runDailyUpdate() {
  if (isUpdating) {
    console.log('Video update already in progress, skipping...');
    return;
  }
  
  isUpdating = true;
  
  try {
    console.log('🔄 Starting scheduled daily video update...');
    const startTime = new Date();
    
    const totalUpdated = await updateAllTopics();
    
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`✅ Daily update completed in ${duration}s. Updated ${totalUpdated} videos.`);
    
    // Log to database for monitoring
    // Could add a update_log table here if needed
    
  } catch (error) {
    console.error('❌ Daily video update failed:', error.message);
  } finally {
    isUpdating = false;
  }
}

function initializeCronJobs() {
  // Run daily at 6 AM Eastern Time
  cron.schedule('0 6 * * *', runDailyUpdate, {
    timezone: 'America/New_York' // Eastern timezone
  });
  
  console.log('📅 Cron job scheduled: Daily video updates at 6:00 AM Eastern Time');
  
  // Manual trigger endpoint for testing
  return {
    runManualUpdate: runDailyUpdate,
    isUpdating: () => isUpdating
  };
}

export { initializeCronJobs, runDailyUpdate };
