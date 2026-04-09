import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ItineraryApp from '../ItineraryApp';
import { subscribeToTrip, updateTrip } from '../utils/trips';

const ItineraryPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTrip(
      id,
      (trip) => {
        setItinerary(trip);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching itinerary:', error);
        setItinerary(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleDatesUpdate = async (startDate, endDate) => {
    try {
      await updateTrip(id, {
        name: itinerary?.name || '',
        location: itinerary?.location || '',
        description: itinerary?.description || '',
        start_date: startDate,
        end_date: endDate
      });
    } catch (error) {
      console.error("Error updating itinerary dates:", error);
    }
  };

  if (!isLoading && !itinerary) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <p className="text-white font-black tracking-widest uppercase text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ItineraryApp 
        itineraryId={id} 
        itinerary={itinerary} 
        onDatesUpdate={handleDatesUpdate}
        canEdit={isAdmin}
      />
    </ThemeProvider>
  );
};

export default ItineraryPage;
