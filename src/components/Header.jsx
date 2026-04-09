import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthControls from './AuthControls';
import DateEditModal from './DateEditModal';
import { formatDisplayDateRange } from '../utils/itineraryDates';

export default function Header({ canEdit = false, itinerary = null, onDatesUpdate = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  
  const isOnItinerary = location.pathname.startsWith('/itinerary/');

  const handleDatesSave = (startDate, endDate) => {
    if (onDatesUpdate) {
      onDatesUpdate(startDate, endDate);
    }
  };

  return (
    <header className="p-6 md:p-8 relative overflow-hidden z-30">
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {isOnItinerary && (
              <button
                onClick={() => navigate('/')}
                className="p-2 mt-2 hover:opacity-80 transition-opacity"
                title="Back to itineraries"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 
                className="text-5xl md:text-7xl tracking-tighter font-black font-sans text-white uppercase"
              >
                {itinerary ? `${itinerary.name}` : 'Itinerary'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {itinerary && (
                  <>
                    {itinerary.start_date && itinerary.end_date ? (
                      <p className={`font-sans text-sm font-bold tracking-widest uppercase text-white opacity-90`}>
                        {formatDisplayDateRange(itinerary.start_date, itinerary.end_date)}
                      </p>
                    ) : (
                      <p className={`font-sans text-sm font-bold tracking-widest uppercase italic text-white opacity-70`}>
                        Dates not set
                      </p>
                    )}
                    {canEdit && isOnItinerary && (
                      <button
                        onClick={() => setIsDateModalOpen(true)}
                        className={`transition-colors p-1 text-white opacity-80 hover:opacity-100 hover:text-[color:var(--theme-secondary)]`}
                        title="Edit dates"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <AuthControls compact />
      </div>

      {canEdit && (
        <DateEditModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          onSave={handleDatesSave}
          startDate={itinerary?.start_date}
          endDate={itinerary?.end_date}
        />
      )}
    </header>
  );
}
