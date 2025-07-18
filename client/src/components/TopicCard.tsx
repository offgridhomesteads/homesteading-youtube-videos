import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { Topic } from "@/lib/types";

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  // Import the topic-specific image based on the slug
  const getTopicImage = (slug: string) => {
    try {
      // Use dynamic import for the topic images
      const imagePath = `/src/assets/${slug}.svg`;
      return imagePath;
    } catch (error) {
      console.error(`Could not load image for topic: ${slug}`);
      return null;
    }
  };

  const topicImageSrc = getTopicImage(topic.slug);

  return (
    <div className="topic-card bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          <Link href={`/topics/${topic.slug}`}>
            <img
              src={topicImageSrc || undefined}
              alt={`${topic.name} homesteading`}
              className="video-thumbnail rounded-lg object-cover w-full md:w-80 h-48 md:h-45 cursor-pointer transition-opacity hover:opacity-80"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="flex-1">
          <Link href={`/topics/${topic.slug}`}>
            <h3 className="text-xl font-lora font-semibold text-dark-blue mb-2 cursor-pointer hover:text-accent-red transition-colors">
              {topic.name}
            </h3>
          </Link>
          <p className="text-text-gray mb-4 leading-relaxed">
            {topic.description}
          </p>
          <Link
            href={`/topics/${topic.slug}`}
            className="inline-flex items-center text-accent-red font-medium hover:underline transition-colors"
          >
            Explore Videos <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
