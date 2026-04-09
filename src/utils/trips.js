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
const TRIP_SUBCOLLECTIONS = ['spots', 'expenses', 'roulette'];
const TRIP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

const normalizeTripPayload = (trip) => ({
  name: normalizeTripText(trip.name || ''),
  location: normalizeTripText(trip.location || ''),
  description: normalizeTripText(trip.description || ''),
  start_date: trip.start_date || null,
  end_date: trip.end_date || null
});

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

export const subscribeToTrips = (onValue, onError) => {
  return onSnapshot(
    collection(db, TRIPS_COLLECTION),
    (snapshot) => {
      const trips = snapshot.docs
        .map((tripDoc) => ({
          id: tripDoc.id,
          ...tripDoc.data()
        }))
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

      onValue({
        id: snapshot.id,
        ...snapshot.data()
      });
    },
    onError
  );
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
