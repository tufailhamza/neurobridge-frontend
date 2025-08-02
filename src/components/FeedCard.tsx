'use client';

import { FeedCard as FeedCardType } from '@/types/FeedCard';
import { useRouter } from 'next/navigation';

interface FeedCardProps {
  card: FeedCardType;
}

export default function FeedCard({ card }: FeedCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/caregiver/content/${card.id}`);
  };

  return (
    <div 
      className="bg-gray-50 rounded-xl p-4 border border-gray-200 pb-8 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Huge Image */}
      <div className="w-full h-128 rounded-lg mb-4 overflow-hidden">
        <img 
          src={card.imageUrl} 
          alt={card.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><span class="text-gray-500 text-lg">Content Image</span></div>';
          }}
        />
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-b mb-4">
        {card.title}
      </h3>
      
      {/* Doctor Info Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-a rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.doctor.profileIcon} />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{card.doctor.name}</p>
            <p className="text-sm text-gray-600">{card.doctor.designation}</p>
          </div>
        </div>
        <div className="flex flex-row space-x-2 text-right">
          <p className="text-sm font-medium text-black">{card.date}</p> 
          <p>  </p>
          <p className="text-sm font-medium text-black">{card.readTime}</p>
        </div>
      </div>
      
      {/* Tags and Price Row */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {card.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 border-b border-2 text-b text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <button className="px-4 py-2 bg-a text-white rounded-lg font-medium hover:bg-a-hover transition-colors">
          ${card.price}
        </button>
      </div>
    </div>
  );
} 