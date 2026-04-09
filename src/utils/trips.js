import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const TRIPS_COLLECTION = 'itineraries';
const USER_TRIP_ACCESS_COLLECTION = 'user_trip_access';
const TRIP_SUBCOLLECTIONS = ['spots', 'expenses', 'roulette'];
const TRIP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMPTY_TRIP_ACCESS = {
  readerUids: [],
  writerUids: [],
  memberUids: []
};

const toNoonTimestamp = (value) => {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  return new Date(`${value}T12:00:00`).getTime();
};

const compareTrips = (left, right) => {
  const leftHasDate = Boolean(left.start_date);
  const rightHasDate = Boolean(right.start_date);

  if (leftHasDate && rightHasDate) {
    const startDateDelta = toNoonTimestamp(left.start_date) - toNoonTimestamp(right.start_date);

    if (startDateDelta !== 0) {
      return startDateDelta;
    }
  } else if (leftHasDate !== rightHasDate) {
    return leftHasDate ? -1 : 1;
  }

  return (left.name || left.id).localeCompare(right.name || right.id);
};

const normalizeTripText = (value) => value.trim();

const normalizeUidList = (uids = []) => {
  return [...new Set(uids.filter(Boolean))].sort();
};

const normalizeTripAccess = ({ readerUids = [], writerUids = [] } = {}) => {
  const normalizedWriterUids = normalizeUidList(writerUids);
  const normalizedReaderUids = normalizeUidList(readerUids).filter(
    (uid) => !normalizedWriterUids.includes(uid)
  );

  return {
    readerUids: normalizedReaderUids,
    writerUids: normalizedWriterUids,
    memberUids: normalizeUidList([...normalizedReaderUids, ...normalizedWriterUids])
  };
};

const normalizeTripIdList = (tripIds = []) => {
  return [...new Set(tripIds.filter(Boolean))].sort();
};

const normalizeTripPayload = (trip) => ({
  name: normalizeTripText(trip.name || ''),
  location: normalizeTripText(trip.location || ''),
  description: normalizeTripText(trip.description || ''),
  start_date: trip.start_date || null,
  end_date: trip.end_date || null
});

const normalizeTripRecord = (tripId, tripData = {}) => {
  const access = normalizeTripAccess({
    readerUids: tripData.readerUids || [],
    writerUids: tripData.writerUids || []
  });

  return {
    id: tripId,
    ...tripData,
    ...access
  };
};

export const normalizeTripSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const isValidTripSlug = (value) => TRIP_SLUG_PATTERN.test(value);

export const getTripRole = (trip, userId, isSuperAdmin = false) => {
  if (isSuperAdmin) {
    return 'write';
  }

  if (!trip || !userId) {
    return 'none';
  }

  if (trip.writerUids?.includes(userId)) {
    return 'write';
  }

  if (trip.readerUids?.includes(userId) || trip.memberUids?.includes(userId)) {
    return 'read';
  }

  return 'none';
};

export const subscribeToTrips = (onValue, onError) => {
  return onSnapshot(
    collection(db, TRIPS_COLLECTION),
    (snapshot) => {
      const trips = snapshot.docs
        .map((tripDoc) => normalizeTripRecord(tripDoc.id, tripDoc.data()))
        .sort(compareTrips);

      onValue(trips);
    },
    onError
  );
};

export const subscribeToTrip = (tripId, onValue, onError) => {
  return onSnapshot(
    doc(db, TRIPS_COLLECTION, tripId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onValue(null);
        return;
      }

      onValue(normalizeTripRecord(snapshot.id, snapshot.data()));
    },
    onError
  );
};

export const subscribeToTripsByIds = (tripIds, onValue, onError) => {
  const normalizedTripIds = normalizeTripIdList(tripIds);

  if (normalizedTripIds.length === 0) {
    onValue([]);
    return () => {};
  }

  const tripsById = new Map();

  const emitTrips = () => {
    onValue(Array.from(tripsById.values()).sort(compareTrips));
  };

  const unsubscribeFns = normalizedTripIds.map((tripId) => {
    return onSnapshot(
      doc(db, TRIPS_COLLECTION, tripId),
      (snapshot) => {
        if (!snapshot.exists()) {
          tripsById.delete(tripId);
          emitTrips();
          return;
        }

        tripsById.set(tripId, normalizeTripRecord(snapshot.id, snapshot.data()));
        emitTrips();
      },
      onError
    );
  });

  return () => {
    unsubscribeFns.forEach((unsubscribe) => unsubscribe());
  };
};

export const createTrip = async ({ slug, ...trip }) => {
  const tripId = normalizeTripSlug(slug);
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const existingTrip = await getDoc(tripRef);

  if (existingTrip.exists()) {
    throw new Error('A trip with that slug already exists.');
  }

  const timestamp = serverTimestamp();

  await setDoc(tripRef, {
    ...normalizeTripPayload(trip),
    ...EMPTY_TRIP_ACCESS,
    createdAt: timestamp,
    updatedAt: timestamp
  });
};

export const updateTrip = async (tripId, trip) => {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    ...normalizeTripPayload(trip),
    updatedAt: serverTimestamp()
  });
};

const syncUserTripAccessDoc = async (userId, tripId, access) => {
  const accessRef = doc(db, USER_TRIP_ACCESS_COLLECTION, userId);
  const accessSnapshot = await getDoc(accessRef);
  const existingAccess = accessSnapshot.exists() ? accessSnapshot.data() : {};
  const nextTripIds = (existingAccess.tripIds || []).filter((existingTripId) => existingTripId !== tripId);
  const nextWriteTripIds = (existingAccess.writeTripIds || []).filter(
    (existingTripId) => existingTripId !== tripId
  );

  if (access.writerUids.includes(userId)) {
    nextTripIds.push(tripId);
    nextWriteTripIds.push(tripId);
  } else if (access.readerUids.includes(userId)) {
    nextTripIds.push(tripId);
  }

  const normalizedTripIds = normalizeTripIdList(nextTripIds);
  const normalizedWriteTripIds = normalizeTripIdList(nextWriteTripIds);

  if (normalizedTripIds.length === 0 && normalizedWriteTripIds.length === 0) {
    if (accessSnapshot.exists()) {
      await deleteDoc(accessRef);
    }

    return;
  }

  await setDoc(
    accessRef,
    {
      tripIds: normalizedTripIds,
      writeTripIds: normalizedWriteTripIds,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const updateTripAccess = async (trip, access) => {
  const normalizedAccess = normalizeTripAccess(access);
  const previousAccess = normalizeTripAccess({
    readerUids: trip.readerUids || [],
    writerUids: trip.writerUids || []
  });
  const affectedUserIds = normalizeUidList([
    ...previousAccess.memberUids,
    ...normalizedAccess.memberUids
  ]);

  await updateDoc(doc(db, TRIPS_COLLECTION, trip.id), {
    ...normalizedAccess,
    updatedAt: serverTimestamp()
  });

  await Promise.all(
    affectedUserIds.map((userId) => syncUserTripAccessDoc(userId, trip.id, normalizedAccess))
  );
};

const deleteCollectionPage = async (collectionRef) => {
  while (true) {
    const snapshot = await getDocs(query(collectionRef, limit(500)));

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((childDoc) => batch.delete(childDoc.ref));
    await batch.commit();

    if (snapshot.size < 500) {
      return;
    }
  }
};

export const deleteTrip = async (tripId) => {
  for (const subcollection of TRIP_SUBCOLLECTIONS) {
    await deleteCollectionPage(collection(db, TRIPS_COLLECTION, tripId, subcollection));
  }

  await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
};
