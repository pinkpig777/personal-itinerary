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
    <div className="bg-[#FFFDF9] rounded-xl shadow-[0_2px_8px_rgba(139,90,43,0.15)] border border-cowboy-leather/20 p-5 flex gap-4 items-start relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_20px_rgba(139,90,43,0.2)] hover:-translate-y-1 group">
      <div className="absolute top-0 left-0 w-1 h-full bg-cowboy-leather/30 group-hover:bg-aggie-maroon transition-colors duration-300"></div>
      <div className="flex-1 pl-2">
        <p className="text-aggie-maroon text-xs font-black uppercase tracking-widest mb-1">{formatTime(spot.time)}</p>
        <h3 className="font-western text-2xl text-denim-blue leading-tight mb-2 drop-shadow-sm">{spot.title}</h3>
        {spot.description && <p className="text-cowboy-leather font-medium text-sm leading-relaxed mb-3">{spot.description}</p>}
        
        {/* Action Buttons */}
        <div className="flex gap-5 mt-4 pt-3 border-t border-cowboy-leather/15 opacity-80 group-hover:opacity-100 transition-opacity">
          {spot.googleMapsLink && (
            <a href={spot.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-denim-blue hover:text-aggie-maroon text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
              📍 Map
            </a>
          )}
          <button onClick={() => onEdit(spot)} className="text-cowboy-leather hover:text-aggie-maroon text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit
          </button>
          <button onClick={() => onDelete(spot.id)} className="text-red-600 hover:text-red-900 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
