# replit.md

## Overview

This is a full-stack React application called "Homesteading YouTube Videos" (HomesteadingYouTubeVideos.com) that serves as a curated platform for homesteading video content. The application displays 14 homesteading topics with YouTube videos for each topic, prioritizing Arizona-related content in the backend algorithm while maintaining YouTube policy compliance by not explicitly mentioning Arizona in the public interface. The system automatically fetches and ranks videos from YouTube using their API, with a cron job system for daily updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom color scheme (Navajo County inspired)
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Background Jobs**: Node-cron for scheduled video updates

### Data Flow
1. **Initial Load**: Frontend requests topics from `/api/topics`
2. **Topic Pages**: Frontend requests videos for specific topics from `/api/topics/:slug/videos`
3. **Video Updates**: Daily cron job fetches fresh video data from YouTube API
4. **Video Ranking**: Custom algorithm ranks videos based on popularity, recency, and Arizona relevance

## Key Components

### Database Schema
- **Topics Table**: Stores 14 predefined homesteading categories with slugs
- **YouTube Videos Table**: Caches video metadata, statistics, and computed scores
- **Users/Sessions Tables**: Authentication infrastructure (for potential future use)

### YouTube Integration
- **Search Strategy**: Primary search for "{topic} homesteading Arizona", fallback to general homesteading
- **Ranking Algorithm**: Combines like count, video age, relevance weight, and recency weight
- **Content Preference**: Videos with regional relevance get higher scores (labeled as "Specialized Content")
- **Channel Diversity**: Limits to 2 videos per channel to ensure variety
- **Policy Compliance**: Backend maintains Arizona focus while frontend displays generic homesteading content

### UI Components
- **TopicCard**: Displays topic information with thumbnail and navigation
- **VideoCard**: Shows video details with ranking badges and social sharing
- **Navigation**: Responsive header with mobile menu support
- **SocialShareButtons**: Integrated sharing for X, Instagram, and Facebook

### Services
- **YouTubeService**: Handles API requests, video fetching, and ranking calculations
- **CronService**: Manages scheduled tasks and topic initialization
- **Storage Interface**: Abstraction layer for database operations

## External Dependencies

### Required APIs
- **YouTube Data API v3**: For fetching video content and statistics
  - Requires `YOUTUBE_API_KEY` environment variable
  - Uses search.list and videos.list endpoints

### Database
- **PostgreSQL**: Primary data storage
  - Requires `DATABASE_URL` environment variable
  - Uses Neon serverless driver for connection pooling

### Third-Party Libraries
- **UI Components**: Extensive Radix UI component library
- **Styling**: Tailwind CSS with custom theme variables
- **HTTP Client**: Native fetch API with React Query
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod schemas with Drizzle integration

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses tsx for hot reloading with Vite middleware
- **Production**: Serves static files and API from single Express server
- **Database**: Drizzle handles schema management and migrations

### Key Features
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **SEO Optimization**: Server-side rendering preparation and semantic HTML
- **Performance**: Lazy loading images and efficient query caching
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Color Scheme
The application uses a Navajo County-inspired color palette:
- Primary: Dark blue (#003682) for headers and navigation
- Background: Navajo white for warm, earthy feel
- Accent: Red (#A6192E) for rankings and call-to-action elements
- Text: Dark gray for readability
- Success: Green for Arizona-specific content badges