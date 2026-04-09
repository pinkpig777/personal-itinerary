import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AccessGate from '../components/AccessGate';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ItineraryApp from '../ItineraryApp';
import { getTripRole, subscribeToTrip, updateTrip } from '../utils/trips';

const ItineraryPage = () => {
  const { id } = useParams();
  const { isSuperAdmin, isAuthLoading, user } = useAuth();
  const userId = user?.uid || '';
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsAccessDenied(false);

    if (isAuthLoading) {
      return;
    }

    if (!userId) {
      setItinerary(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToTrip(
      id,
      (trip) => {
        setItinerary(trip);
        setIsAccessDenied(false);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching itinerary:', error);
        setItinerary(null);
        setIsAccessDenied(error?.code === 'permission-denied');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, isAuthLoading, userId]);

  if (!isAuthLoading && !user) {
    return <AccessGate title="Private Trip Access" />;
  }

  if (!isAuthLoading && isAccessDenied) {
    return (
      <AccessGate
        isUnauthorized
        title="Private Trip Access"
        message="This Google account has not been assigned to this trip."
      />
    );
  }

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
      console.error('Error updating itinerary dates:', error);
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

  const canEdit = getTripRole(itinerary, userId, isSuperAdmin) === 'write';

  return (
    <ThemeProvider>
      <ItineraryApp 
        itineraryId={id} 
        itinerary={itinerary} 
        onDatesUpdate={handleDatesUpdate}
        canEdit={canEdit}
      />
    </ThemeProvider>
  );
};

export default ItineraryPage;
