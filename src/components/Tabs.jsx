import { useEffect, useMemo } from 'react';
import { getItineraryDateOptions, matchesDateKey } from '../utils/itineraryDates';

export default function Tabs({ activeTab, setActiveTab, itinerary = null }) {
  const dates = useMemo(() => {
    return getItineraryDateOptions(itinerary?.start_date, itinerary?.end_date);
  }, [itinerary?.start_date, itinerary?.end_date]);

  useEffect(() => {
    if (dates.length > 0 && !dates.some((date) => matchesDateKey(date.key, activeTab))) {
      setActiveTab(dates[0].key);
    }
  }, [dates, activeTab, setActiveTab]);

  if (dates.length === 0) {
    return (
      <div 
        className="flex justify-center p-3 mb-4"
      >
        <p 
          className="text-xs font-bold uppercase tracking-wider text-gray-500"
        >
          Set dates to view schedule
        </p>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-around p-3 mb-4 overflow-x-auto gap-2"
    >
      {dates.map((date) => (
        <button
          key={date.key}
          onClick={() => setActiveTab(date.key)}
          className={`px-6 py-2.5 rounded-none border border-white text-xs font-black uppercase tracking-widest transition-all duration-0 focus:outline-none whitespace-nowrap ${matchesDateKey(activeTab, date.key) ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-[#333333] hover:text-white'}`}
        >
          {date.label}
        </button>
      ))}
    </div>
  );
}
