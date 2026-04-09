import { useMemo } from 'react';
import SpotItem from './SpotItem';
import { matchesDateKey } from '../utils/itineraryDates';

export default function SpotList({ canEdit = false, spots, activeTab, onEdit, onDelete, onAdd }) {
  // Filter by active tab and sort by time ascending
  const displayedSpots = useMemo(() => {
    return spots
      .filter((spot) => matchesDateKey(spot.date, activeTab))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [spots, activeTab]);

  if (displayedSpots.length === 0) {
    return (
      <div className="flex flex-col items-center mt-10 gap-4">
        <p className="text-center font-medium text-gray-500">
          No spots planned for this day yet.
        </p>
        {canEdit && onAdd && (
          <button
            onClick={onAdd}
            className="px-8 py-3 rounded-none font-bold uppercase tracking-widest border border-white text-white bg-transparent transition-colors duration-0 flex items-center gap-2 hover:bg-white hover:text-[#0A0A0A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add a Spot
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedSpots.map(spot => (
        <SpotItem 
          canEdit={canEdit}
          key={spot.id} 
          spot={spot} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
