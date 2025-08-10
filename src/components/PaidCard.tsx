'use client';

import { PaidCard as PaidCardType } from '@/types/PaidCard';
import { useRouter } from 'next/navigation';

interface PaidCardProps {
  card: PaidCardType;
}

export default function PaidCard({ card }: PaidCardProps) {
  const router = useRouter(); 

  const handleCardClick = () => {
    // Determine the route based on user role (you can get this from localStorage or context)
    const userRole = localStorage.getItem('user_role');
    if (userRole === 'clinician') {
      router.push(`/clinician/content/${card.id}`);
    } else {
      router.push(`/caregiver/content/${card.id}`);
    }
  };

  return (
    <div 
      className="bg-gray-50 rounded-xl p-4 border border-gray-200 pb-8 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
             {/* Huge Image */}
       <div className="w-full h-128 rounded-lg mb-4 overflow-hidden">
         <img 
           src={card.image_url} 
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
      
             {/* Author Info Row */}
       <div className="flex justify-between items-center mb-4">
         <div className="flex items-center space-x-3">
           <div className="w-10 h-10 bg-a rounded-full flex items-center justify-center">
             <span className="text-white font-semibold text-lg">
               {card.user_name ? card.user_name.charAt(0).toUpperCase() : 'U'}
             </span>
           </div>
           <div>
             <p className="font-semibold text-gray-900">{card.user_name}</p>
             <p className="text-sm text-gray-600">Author</p>
           </div>
         </div>
         <div className="flex flex-row space-x-2 text-right">
           <p className="text-sm font-medium text-black">{card.date}</p> 
           <p>  </p>
           <p className="text-sm font-medium text-black">{card.read_time}</p>
         </div>
       </div>
      
             {/* Tags and Price Row */}
       <div className="flex justify-between items-center mb-3">
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
       </div>

    </div>
  );
} 