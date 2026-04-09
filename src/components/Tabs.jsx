import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Tabs({ activeTab, setActiveTab, itinerary = null }) {
  const { theme } = useTheme();
  
  // Generate date range from itinerary dates
  const dates = useMemo(() => {
    if (!itinerary?.start_date || !itinerary?.end_date) {
      return [];
    }

    const startDate = new Date(itinerary.start_date + 'T12:00:00');
    const endDate = new Date(itinerary.end_date + 'T12:00:00');
    const dateArray = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateArray.push(`${month}/${day}`);
    }

    return dateArray;
  }, [itinerary?.start_date, itinerary?.end_date]);

  // Set first date as active if dates exist and activeTab isn't in the list
  React.useEffect(() => {
    if (dates.length > 0 && !dates.includes(activeTab)) {
      setActiveTab(dates[0]);
    }
  }, [dates, activeTab, setActiveTab]);

  const getTabLabel = (dateStr) => {
    // Parse MM/DD format
    const [month, day] = dateStr.split('/');
    const date = new Date(2026, parseInt(month) - 1, parseInt(day));
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${dayOfWeek} ${dateStr}`;
  };

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
      {dates.map(date => (
        <button
          key={date}
          onClick={() => setActiveTab(date)}
          style={{
            backgroundColor: activeTab === date ? theme.primary : 'transparent',
            color: activeTab === date ? theme.dark : theme.accent,
            boxShadow: 'none',
            transform: 'none'
          }}
          className={`px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none whitespace-nowrap ${activeTab !== date ? 'hover:bg-white/10' : ''}`}
        >
          {getTabLabel(date)}
        </button>
      ))}
    </div>
  );
}
