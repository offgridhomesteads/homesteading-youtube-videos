import type { YoutubeVideo } from "@/lib/types";
import { Link } from "wouter";
import SocialShareButtons from "./SocialShareButtons";
// Updated to use Link component for internal routing

interface VideoCardProps {
  video: YoutubeVideo;
  showRanking?: boolean;
  topicName?: string;
}

export default function VideoCard({ video, showRanking = true, topicName }: VideoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateDescription = (description: string, maxLength = 150) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).trim() + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0 relative">
          {showRanking && video.ranking && (
            <div className="ranking-badge absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
              {video.ranking}
            </div>
          )}
          <Link
            href={`/video/${video.id}`}
            className="block hover:opacity-90 transition-opacity"
          >
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="video-thumbnail rounded-lg object-cover w-full md:w-80 h-48 md:h-45 cursor-pointer"
              loading="lazy"
            />
          </Link>
          {video.isArizonaSpecific && (
            <div className="absolute bottom-2 right-2 bg-border-green text-white px-2 py-1 rounded text-xs font-medium">
              Specialized Content
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-lora font-semibold text-dark-blue mb-2 leading-tight">
            {video.title}
          </h3>
          <p className="text-text-gray text-sm mb-2 leading-relaxed">
            {truncateDescription(video.description || "")}
          </p>
          <div className="text-xs text-text-gray mb-4">
            <span className="font-medium">{video.channelTitle}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(video.publishedAt)}</span>
            <span className="mx-2">•</span>
            <span>{video.likeCount?.toLocaleString() || 0} likes</span>
          </div>
          <SocialShareButtons video={video} />
        </div>
      </div>
    </div>
  );
}
