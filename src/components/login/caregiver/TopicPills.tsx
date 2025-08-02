'use client';

interface TopicPillsProps {
  topics: string[];
  selectedTopics: string[];
  onTopicToggle: (topic: string) => void;
}

export default function TopicPills({ topics, selectedTopics, onTopicToggle }: TopicPillsProps) {
  return (
    <div className="flex flex-wrap justify-start gap-3 max-w-4xl mx-auto">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onTopicToggle(topic)}
          className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm whitespace-nowrap ${
            selectedTopics.includes(topic)
              ? 'bg-a text-white border-a'
              : 'bg-white text-gray-700 border-gray-300 hover:border-a hover:text-a'
          }`}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}