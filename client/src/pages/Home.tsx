import { useQuery } from "@tanstack/react-query";
import { Loader2, Sprout } from "lucide-react";
import TopicCard from "@/components/TopicCard";
import type { Topic } from "@/lib/types";

export default function Home() {
  const { data: topics, isLoading, error } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-dark-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-lora font-bold text-dark-blue mb-4">
            Unable to load topics
          </h2>
          <p className="text-text-gray">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Title and SEO Content */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-lora font-bold text-dark-blue mb-6">
            Homesteading YouTube Videos
          </h1>
          <p className="text-lg leading-relaxed text-text-gray">
            Discover the best homesteading videos from YouTube across 14 essential topics. Our handpicked selection features expert tutorials on organic gardening, raising chickens, water harvesting, solar energy, and more. High-quality content updated daily to help you master self-sufficient living.
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {topics?.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
          
          {(!topics || topics.length === 0) && (
            <div className="md:col-span-2 text-center py-12">
              <Sprout className="w-16 h-16 text-border-green mx-auto mb-4" />
              <h3 className="text-xl font-lora font-semibold text-dark-blue mb-2">
                No topics available yet
              </h3>
              <p className="text-text-gray">
                We're working on adding homesteading topics. Please check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
