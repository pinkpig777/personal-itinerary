import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getItinerary } from '../config/itineraries';
import { ThemeProvider } from '../context/ThemeContext';
import ItineraryApp from '../ItineraryApp';

const ItineraryPage = () => {
  const { id } = useParams();
  const baseItinerary = getItinerary(id);
  const [itinerary, setItinerary] = useState(baseItinerary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch itinerary metadata from Firestore (dates, etc.)
    const fetchItineraryDates = async () => {
      try {
        const docRef = doc(db, 'itineraries', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          setItinerary(prev => ({
            ...prev,
            start_date: firestoreData.start_date || prev.start_date,
            end_date: firestoreData.end_date || prev.end_date
          }));
        }
      } catch (error) {
        console.error("Error fetching itinerary dates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraryDates();
  }, [id]);

  const handleDatesUpdate = async (startDate, endDate) => {
    try {
      // Update Firestore
      const docRef = doc(db, 'itineraries', id);
      await setDoc(docRef, {
        start_date: startDate,
        end_date: endDate
      }, { merge: true });

      // Update local state
      setItinerary(prev => ({
        ...prev,
        start_date: startDate,
        end_date: endDate
      }));
    } catch (error) {
      console.error("Error updating itinerary dates:", error);
    }
  };

  if (!baseItinerary) {
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
    <ThemeProvider themeName={baseItinerary.theme}>
      <ItineraryApp 
        itineraryId={id} 
        itinerary={itinerary} 
        onDatesUpdate={handleDatesUpdate}
      />
    </ThemeProvider>
  );
};

export default ItineraryPage;
