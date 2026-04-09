import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import SpotItem from './SpotItem';

export default function SpotList({ spots, activeTab, onEdit, onDelete, onAdd }) {
  const { theme } = useTheme();

  // Filter by active tab and sort by time ascending
  const displayedSpots = useMemo(() => {
    return spots
      .filter(spot => spot.date === activeTab)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [spots, activeTab]);

  if (displayedSpots.length === 0) {
    return (
      <div className="flex flex-col items-center mt-10 gap-4">
        <p className="text-center font-medium text-gray-500">
          No spots planned for this day yet.
        </p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="px-8 py-3 rounded-md font-bold uppercase tracking-widest border-2 transition-transform active:scale-95 flex items-center gap-2 hover:-translate-y-0.5 hover:translate-x-0.5"
            style={{
              backgroundColor: theme.primary,
              color: theme.dark,
              borderColor: theme.secondary,
              boxShadow: `-4px 4px 0px 0px #333333`
            }}
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
          key={spot.id} 
          spot={spot} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
