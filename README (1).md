# Homesteading YouTube Videos

A curated platform for homesteading video content from YouTube across 14 essential topics.

## Features

- 14 homesteading topic categories with custom SVG images
- YouTube API integration with intelligent ranking algorithm
- Responsive design with Tailwind CSS
- Social media sharing (X, Instagram, Facebook)
- Daily automated video updates via cron jobs
- PostgreSQL database for video metadata storage

## Topics Covered

- Organic Gardening
- Raising Chickens
- Beekeeping
- Solar Energy
- Water Harvesting
- Off-Grid Water Systems
- Soil Building in Arid Climates
- Food Preservation
- Herbal Medicine
- Composting
- Permaculture Design
- Livestock Management
- DIY Home Maintenance
- Homestead Security

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **External APIs**: YouTube Data API v3
- **Deployment**: Vercel

## Environment Variables

```
YOUTUBE_API_KEY=your_youtube_api_key
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

## Local Development

```bash
npm install
npm run dev
```

## Deployment

This application is configured for deployment on Vercel with automatic builds and serverless functions.