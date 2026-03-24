import React, { useMemo } from 'react';
import SpotItem from './SpotItem';

export default function SpotList({ spots, activeTab, onEdit, onDelete }) {
  // Filter by active tab and sort by time ascending
  const displayedSpots = useMemo(() => {
    return spots
      .filter(spot => spot.date === activeTab)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [spots, activeTab]);

  if (displayedSpots.length === 0) {
    return <p className="text-center text-gray-400 mt-10">No spots planned for this day yet.</p>;
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
