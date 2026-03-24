import React from 'react';

// Format 24h time string (e.g., "15:00") to 12h string (e.g., "3:00 PM")
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function SpotItem({ spot, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start relative overflow-hidden">
      <img src={spot.imageUrl} alt={spot.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 text-xs font-bold mb-1">{formatTime(spot.time)}</p>
        <h3 className="font-bold text-lg leading-tight mb-1">{spot.title}</h3>
        <p className="text-gray-500 text-sm">{spot.description}</p>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-3">
          <button onClick={() => onEdit(spot)} className="text-blue-600 text-xs font-medium">Edit</button>
          <button onClick={() => onDelete(spot.id)} className="text-red-500 text-xs font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
}
