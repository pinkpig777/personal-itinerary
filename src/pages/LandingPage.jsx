import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllItineraries } from '../config/itineraries';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { formatDisplayDate } from '../utils/itineraryDates';

const LandingPage = () => {
  const [itineraries, setItineraries] = useState(getAllItineraries());

  useEffect(() => {
    const unsubscribes = getAllItineraries().map((itinerary) => {
      const itineraryRef = doc(db, 'itineraries', itinerary.id);

      return onSnapshot(itineraryRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};

        setItineraries((current) =>
          current.map((item) =>
            item.id === itinerary.id
              ? {
                  ...item,
                  start_date: data.start_date || item.start_date,
                  end_date: data.end_date || item.end_date
                }
              : item
          )
        );
      });
    });

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0A] font-sans"
    >

      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-6 py-2 border border-[#333333] text-gray-400 text-[11px] font-bold uppercase tracking-[0.35em] mb-5">
          City Routes
        </div>
        <h1
          className="text-5xl md:text-6xl font-black text-white mb-3 uppercase tracking-tighter"
        >
          Itinerary
        </h1>
        <p className="text-[#333333] text-base md:text-lg tracking-[0.25em] uppercase font-semibold">
          Pick a line, then head out
        </p>
      </div>

      {/* Itineraries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {itineraries.map((itinerary) => {
          return (
            <Link
              key={itinerary.id}
              to={`/itinerary/${itinerary.id}`}
              className="group"
            >
              <div
                className="p-8 transition-all duration-0 cursor-pointer h-full border border-white bg-transparent hover:bg-white hover:text-[#0A0A0A] relative"
              >
                {/* Itinerary Title */}
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight text-white group-hover:text-[#0A0A0A]">
                  {itinerary.name}
                </h2>

                {/* Location */}
                <p className="text-sm mb-3 flex items-center gap-2 text-gray-400 group-hover:text-[#333333]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {itinerary.location}
                </p>

                {/* Description */}
                <p className="text-sm mb-4 text-gray-400 group-hover:text-[#0A0A0A]">
                  {itinerary.description}
                </p>

                {/* Dates (if available) */}
                <div className="mt-5 text-xs font-black uppercase tracking-widest text-[#333333] group-hover:text-[#0A0A0A]">
                  {itinerary.start_date && itinerary.end_date ? (
                    <>
                      <span>{formatDisplayDate(itinerary.start_date)}</span>
                      <span className="mx-2">&middot;</span>
                      <span>{formatDisplayDate(itinerary.end_date)}</span>
                    </>
                  ) : (
                    <span>Date not set</span>
                  )}
                </div>

                {/* Action Arrow */}
                <div className="absolute bottom-8 right-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white group-hover:text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-[#333333] text-sm font-bold uppercase tracking-widest relative z-10">
        <p>Click any itinerary to start planning</p>
      </div>
    </div>
  );
};

export default LandingPage;
