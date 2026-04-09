# 🤠 Trip Itinerary App

A responsive, feature-rich multi-trip itinerary and group expense tracker built with React, Vite, Tailwind CSS, and Firebase. Trips are private by default, access is scoped per trip, and schedule plus expense data sync in real time through Firestore.

---

## ✨ Features

- **📅 Interactive Schedule**
  - View daily itineraries split across distinct tabs for each trip.
  - Spots automatically sort chronologically. 
  - Add, edit, or delete trip spot details easily.
- **🔐 Trip-Scoped Access Control**
  - Google sign-in with a single super admin (`charly729.chiu@gmail.com`).
  - Per-trip `Read` and `Write` permissions managed from the landing page.
  - Users without a trip assignment cannot read that trip at all.
- **📍 Google Maps Integration**
  - Drop a Google Maps link when creating a spot, and a native "**📍 Map**" button connects users directly to navigation!
- **🧰 The Tools Hub & Money Split (Splitwise Clone)**
  - Seamlessly toggle between your global schedule and functional trip tools.
  - **Group Expenses**: Log who paid for what and who needs to split it.
  - **Expense Candidates**: Trip readers and writers automatically appear as payer and participant suggestions.
  - **Smart Settlements**: A built-in greedy algorithm calculates real-time Net Balances and minimizes financial transactions. It tells you exactly who owes who, and how much!
- **🎨 Premium Texan Aesthetic**
  - Engineered with a customized Tailwind color palette highlighting **Aggie Maroon**, **Cowboy Leather**, and **Texas Sand**.
  - Styled with sophisticated western headers (`Rye` font), sleek modern typography (`Inter`), and beautiful CSS micro-animations/hover-effects.

---

## 🛠️ Tech Stack

- **Frontend**: React (v18) + Vite
- **Styling**: Tailwind CSS + Custom PostCSS configuration
- **Auth + Database**: Firebase Auth + Firestore
- **Deployment**: Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with `npm` (Node Package Manager).

### 1. Installation
Clone this repository and install the dependencies:
```bash
npm install
```

### 2. Firebase Configuration
This app uses Firebase Firestore to persist data. You must set up a free Firebase project:
1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Firestore Database** and create a new database.
3. Once created, go to the **Rules** tab and allow test mode logic (or your own authenticated rules):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. Create a file at `src/firebase.js` and paste your Firebase Web App configuration:
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 3. Running Locally
Spin up the local development server:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser. Any changes you make in the database or the UI will hot-reload!

### 4. Deployment
To deploy your application globally via Firebase Hosting:
1. Make sure you are authenticated with the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Build the app and deploy!
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### 5. Admin Access
Trip access is now scoped per trip.

Roles:
- `charly729.chiu@gmail.com` is the only global super admin. This is configured in [src/config/admin.js](/Users/charliechiu/Documents/SideProject/itinerary/src/config/admin.js).
- Trip `writers` can edit that trip’s metadata, dates, spots, expenses, and roulette data.
- Trip `readers` can view that trip, including the expense page and candidate list, but cannot add, edit, or delete expense logs.
- Users with no assignment on a trip cannot read it at all.

How access works:
1. A person signs in with Google once. That creates or updates their private profile in `users_private/{uid}`.
2. The super admin opens the landing page, clicks `Manage Access` on a trip, and assigns that user `Read`, `Write`, or `No Access`.
3. The app stores those assignments on the trip document in `readerUids`, `writerUids`, and `memberUids`.
4. The app also derives a trip-readable member roster in `itineraries/{slug}/members/{uid}` for UI-only features like expense candidates.

Expense candidates:
- Both trip `readers` and `writers` are automatically added to the payer and participant suggestion lists in the expense flow.
- Existing free-text names from past expenses still stay available, so older expense history continues to work.
- The expense schema still stores plain strings for `payer` and `participants`; this change does not migrate old expense docs to UIDs.

Operational notes:
- The frontend no longer keeps a global reader/admin allowlist. Trip visibility comes from Firestore membership.
- Firestore rules in [firestore.rules](/Users/charliechiu/Documents/SideProject/itinerary/firestore.rules) enforce the same split:
  - `users_private/{uid}` is readable only by the owner and the super admin.
  - `itineraries/{slug}` and nested collections are readable only by trip members.
  - `itineraries/{slug}/members/{uid}` is readable by trip members and writable only by the super admin.
  - Trip creation, deletion, and access-management writes are super-admin only.
  - Regular trip writers cannot change ACL fields.
- After changing rules, deploy them with:
  ```bash
  npx -y firebase-tools@latest deploy --only firestore:rules
  ```

Migration scripts:
- Backfill the seeded trip metadata:
  ```bash
  npm run backfill:trips
  ```
- Normalize ACL fields on all existing trips:
  ```bash
  npm run backfill:trip-acl
  ```
- Backfill the derived trip member roster used by expense candidates:
  ```bash
  npm run backfill:trip-members
  ```

All backfill scripts use the currently logged-in Firebase CLI account. The shared admin client now refreshes the cached CLI access token automatically when possible. If refresh fails, re-run:
```bash
npx -y firebase-tools@latest login --reauth
```

---
*Created by Charlie Chiu.*
