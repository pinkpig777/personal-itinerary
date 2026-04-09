import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { isSuperAdminEmail, normalizeEmail } from '../config/admin';

const USERS_PRIVATE_COLLECTION = 'users_private';

const compareKnownUsers = (left, right) => {
  const leftLabel = (left.displayName || left.emailLower || left.uid).toLowerCase();
  const rightLabel = (right.displayName || right.emailLower || right.uid).toLowerCase();

  return leftLabel.localeCompare(rightLabel);
};

export const syncAuthenticatedUserProfile = async (user) => {
  if (!user?.uid || !user.email) {
    return;
  }

  const userRef = doc(db, USERS_PRIVATE_COLLECTION, user.uid);
  const existingSnapshot = await getDoc(userRef);

  const basePayload = {
    emailLower: normalizeEmail(user.email),
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    lastSeenAt: serverTimestamp()
  };

  if (existingSnapshot.exists()) {
    await setDoc(userRef, basePayload, { merge: true });
    return;
  }

  await setDoc(
    userRef,
    {
      ...basePayload,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const subscribeToKnownUsers = (onValue, onError) => {
  return onSnapshot(
    collection(db, USERS_PRIVATE_COLLECTION),
    (snapshot) => {
      const knownUsers = snapshot.docs
        .map((userDoc) => ({
          uid: userDoc.id,
          ...userDoc.data()
        }))
        .filter((user) => !isSuperAdminEmail(user.emailLower))
        .sort(compareKnownUsers);

      onValue(knownUsers);
    },
    onError
  );
};
