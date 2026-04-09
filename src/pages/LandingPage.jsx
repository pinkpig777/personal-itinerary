import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccessManagementModal from '../components/AccessManagementModal';
import AccessGate from '../components/AccessGate';
import AuthControls from '../components/AuthControls';
import TripModal from '../components/TripModal';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate } from '../utils/itineraryDates';
import {
  createTrip,
  deleteTrip,
  getTripRole,
  subscribeToTrips,
  subscribeToTripsByIds,
  updateTrip,
  updateTripAccess
} from '../utils/trips';
import { subscribeToKnownUsers } from '../utils/userRegistry';
import { subscribeToUserTripAccess } from '../utils/userTripAccess';

const LandingPage = () => {
  const { isSuperAdmin, isAuthLoading, user } = useAuth();
  const userId = user?.uid || '';
  const [itineraries, setItineraries] = useState([]);
  const [knownUsers, setKnownUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [accessTrip, setAccessTrip] = useState(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!userId) {
      setItineraries([]);
      setLoadError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    if (isSuperAdmin) {
      const unsubscribe = subscribeToTrips(
        (trips) => {
          setItineraries(trips);
          setLoadError('');
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to trips:', error);
          setLoadError('Unable to load trips right now.');
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }

    let unsubscribeTripSnapshots = () => {};

    const unsubscribeAccess = subscribeToUserTripAccess(
      userId,
      (access) => {
        unsubscribeTripSnapshots();

        if (!access.tripIds.length) {
          setItineraries([]);
          setLoadError('');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        unsubscribeTripSnapshots = subscribeToTripsByIds(
          access.tripIds,
          (trips) => {
            setItineraries(trips);
            setLoadError('');
            setIsLoading(false);
          },
          (error) => {
            console.error('Error subscribing to allowed trips:', error);
            setLoadError('Unable to load assigned trips right now.');
            setIsLoading(false);
          }
        );
      },
      (error) => {
        console.error('Error subscribing to user trip access:', error);
        setItineraries([]);
        setLoadError('Unable to load trip access right now.');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeTripSnapshots();
      unsubscribeAccess();
    };
  }, [isAuthLoading, isSuperAdmin, userId]);

  useEffect(() => {
    if (isAuthLoading || !isSuperAdmin) {
      setKnownUsers([]);
      return;
    }

    const unsubscribe = subscribeToKnownUsers(
      (users) => {
        setKnownUsers(users);
      },
      (error) => {
        console.error('Error subscribing to known users:', error);
        setKnownUsers([]);
      }
    );

    return () => unsubscribe();
  }, [isAuthLoading, isSuperAdmin]);

  if (!isAuthLoading && !user) {
    return <AccessGate />;
  }

  const openCreateTripModal = () => {
    setEditingTrip(null);
    setIsTripModalOpen(true);
  };

  const openEditTripModal = (trip) => {
    setEditingTrip(trip);
    setIsTripModalOpen(true);
  };

  const openAccessModal = (trip) => {
    setAccessTrip(trip);
  };

  const handleTripSave = async (trip) => {
    if (editingTrip) {
      await updateTrip(editingTrip.id, trip);
      return;
    }

    await createTrip(trip);
  };

  const handleTripDelete = async (trip) => {
    const confirmed = window.confirm(
      `Delete "${trip.name}" and all of its schedule, expenses, and roulette data?`
    );

    if (!confirmed) {
      return;
    }

    await deleteTrip(trip.id);
  };

  const handleAccessSave = async ({ readerUids, writerUids }) => {
    await updateTripAccess(accessTrip, { readerUids, writerUids });
  };

  const emptyStateLabel = user && !isSuperAdmin ? 'No trips assigned to this account yet' : 'No trips yet';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0A] font-sans"
    >
      <div className="w-full max-w-4xl flex justify-end relative z-10 mb-6">
        <AuthControls />
      </div>

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

      <div className="flex w-full max-w-4xl items-center justify-between mb-4 relative z-10 gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
          Trips {isLoading ? '' : `(${itineraries.length})`}
        </p>
        {isSuperAdmin && (
          <button
            onClick={openCreateTripModal}
            className="border border-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
          >
            Create Trip
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {isLoading ? (
          <div className="col-span-full border border-[#333333] p-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
            Loading trips
          </div>
        ) : itineraries.length === 0 ? (
          <div className="col-span-full border border-[#333333] p-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
            {loadError || emptyStateLabel}
          </div>
        ) : (
          itineraries.map((itinerary) => {
            const tripRole = getTripRole(itinerary, userId, isSuperAdmin);

            return (
              <div key={itinerary.id} className="relative">
                <Link
                  to={`/itinerary/${itinerary.id}`}
                  className="group block"
                >
                  <div
                    className="p-8 transition-all duration-0 cursor-pointer h-full border border-white bg-transparent hover:bg-white hover:text-[#0A0A0A] relative"
                  >
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tight text-white group-hover:text-[#0A0A0A]">
                      {itinerary.name || itinerary.id}
                    </h2>

                    {!isSuperAdmin && (
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 group-hover:text-[#333333]">
                        {tripRole === 'write' ? 'Can Edit' : 'Read Only'}
                      </p>
                    )}

                    <p className="text-sm mb-3 flex items-center gap-2 text-gray-400 group-hover:text-[#333333]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {itinerary.location || 'Location not set'}
                    </p>

                    <p className="text-sm mb-4 text-gray-400 group-hover:text-[#0A0A0A]">
                      {itinerary.description || 'Description not set'}
                    </p>

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

                    <div className="absolute bottom-8 right-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white group-hover:text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {isSuperAdmin && (
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openAccessModal(itinerary);
                      }}
                      className="border border-[#333333] bg-[#0A0A0A] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                    >
                      Manage Access
                    </button>
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openEditTripModal(itinerary);
                      }}
                      className="border border-[#333333] bg-[#0A0A0A] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        await handleTripDelete(itinerary);
                      }}
                      className="border border-red-500/60 bg-[#0A0A0A] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 transition-colors hover:bg-red-500 hover:text-black"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 text-center text-[#333333] text-sm font-bold uppercase tracking-widest relative z-10">
        <p>Click any itinerary to start planning</p>
      </div>

      <TripModal
        editingTrip={editingTrip}
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSave={handleTripSave}
      />
      <AccessManagementModal
        isOpen={Boolean(accessTrip)}
        trip={accessTrip}
        knownUsers={knownUsers}
        onClose={() => setAccessTrip(null)}
        onSave={handleAccessSave}
      />
    </div>
  );
};

export default LandingPage;
