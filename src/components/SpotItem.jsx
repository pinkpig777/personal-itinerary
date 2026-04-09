import React from 'react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <div
      className="rounded-3xl p-6 flex gap-4 items-start relative overflow-hidden transition-all duration-300 group border"
      style={{
        backgroundColor: theme.light,
        borderColor: theme.secondary,
        boxShadow: 'none'
      }}
    >
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">
          {formatTime(spot.time)}
        </p>
        <h3 className={`text-2xl leading-tight mb-2 tracking-tight font-black font-sans text-white`}>
          {spot.title}
        </h3>
        {spot.description && <p className="font-medium text-sm leading-relaxed mb-4 text-gray-400">{spot.description}</p>}
        
        {/* Action Buttons */}
        <div className="flex gap-5 mt-4 pt-4 opacity-80 group-hover:opacity-100 transition-opacity border-t border-[#333333]">
          {spot.googleMapsLink && (
            <a href={spot.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 text-white hover:text-gray-300">
              📍 Map
            </a>
          )}
          <button onClick={() => onEdit(spot)} className="text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit
          </button>
          <button onClick={() => onDelete(spot.id)} className="text-red-600 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
