import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const USER_TRIP_ACCESS_COLLECTION = 'user_trip_access';

const normalizeTripIdList = (tripIds = []) => {
  return [...new Set(tripIds.filter(Boolean))].sort();
};

export const subscribeToUserTripAccess = (userId, onValue, onError) => {
  if (!userId) {
    onValue({
      tripIds: [],
      writeTripIds: []
    });
    return () => {};
  }

  return onSnapshot(
    doc(db, USER_TRIP_ACCESS_COLLECTION, userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onValue({
          tripIds: [],
          writeTripIds: []
        });
        return;
      }

      const access = snapshot.data();
      onValue({
        tripIds: normalizeTripIdList(access.tripIds || []),
        writeTripIds: normalizeTripIdList(access.writeTripIds || [])
      });
    },
    onError
  );
};
