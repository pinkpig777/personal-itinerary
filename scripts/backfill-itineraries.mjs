import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCv4MqDGbj38GkmcXVsM0xeHoZJTB5GI4w',
  authDomain: 'itinerary-d5936.firebaseapp.com',
  projectId: 'itinerary-d5936',
  storageBucket: 'itinerary-d5936.firebasestorage.app',
  messagingSenderId: '997594181925',
  appId: '1:997594181925:web:0607e38b5bc87432a8aacc'
};

const seededTrips = [
  {
    id: 'cstat',
    name: 'Cstat Trip',
    location: 'College Station, Texas',
    description: 'A classic Texas adventure',
    start_date: '2024-04-03',
    end_date: '2024-04-05'
  },
  {
    id: 'la',
    name: 'LA Trip',
    location: 'Los Angeles, California',
    description: 'Coastal vibes and sunny days',
    start_date: null,
    end_date: null
  }
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

for (const trip of seededTrips) {
  const tripRef = doc(db, 'itineraries', trip.id);
  const existingSnapshot = await getDoc(tripRef);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};

  await setDoc(
    tripRef,
    {
      name: existingData.name ?? trip.name,
      location: existingData.location ?? trip.location,
      description: existingData.description ?? trip.description,
      start_date: existingData.start_date ?? trip.start_date ?? null,
      end_date: existingData.end_date ?? trip.end_date ?? null,
      createdAt: existingData.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  console.log(`Backfilled trip ${trip.id}`);
}
