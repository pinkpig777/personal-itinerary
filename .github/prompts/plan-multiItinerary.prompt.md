# Plan: Multi-Itinerary Architecture with URL-based Routing

**TL;DR:** Transform the single-itinerary app into a multi-itinerary platform with a landing page that routes users to dedicated URLs (`/itinerary/cstat`, `/itinerary/la`). Each itinerary has isolated Firebase data and custom color themes. This requires adding React Router, restructuring Firestore collections by itinerary, creating a landing page, and implementing theme switching.

## Steps

### Phase 1: Dependencies & Routing Setup
1. Install React Router v6 for URL-based navigation
   - Replace current static routing with `<BrowserRouter>` and `<Routes>`
   - Plan: `/ → LandingPage`, `/itinerary/:id → ItineraryApp`
2. Create Itinerary registry (`src/config/itineraries.js`)
   - Define: `{ id, name, dates, theme }` for each trip (LA, Cstat)
   - Maps URL param to itinerary config

### Phase 2: Refactor Firestore Structure
3. Restructure collections to isolate data per itinerary (*depends on Step 1*)
   - OLD: `spots/`, `expenses/`, `roulette/` (global)
   - NEW: `itineraries/{itineraryId}/spots/`, `itineraries/{itineraryId}/expenses/`, `itineraries/{itineraryId}/roulette/`
   - Create migration script to move existing Cstat data to `itineraries/cstat/` or keep current structure for backward compat
4. Update Firebase queries to include itinerary filter
   - Modify Firestore listeners in ItineraryApp.jsx to query `collection(db, 'itineraries', itineraryId, 'spots')`

### Phase 3: UI Architecture & Theming
5. Create a theme system (`src/utils/themes.js`)
   - Export color objects: `themes.cstat = { primary, secondary, bg, ... }` and `themes.la = { ... }`
   - Define which colors override current Tailwind config per itinerary
6. Build Landing Page component (`src/pages/LandingPage.jsx`)
   - Card-based itinerary selector
   - Links to `/itinerary/:id` route
   - Display itinerary name, dates, preview
7. Create Itinerary Layout Wrapper (`src/pages/ItineraryPage.jsx`)
   - Receives `itineraryId` from URL params
   - Applies theme dynamically (inject CSS variables or Tailwind context)
   - Wraps ItineraryApp.jsx with itinerary context

### Phase 4: Component Adaptation
8. Pass `itineraryId` prop through component tree (*depends on Phase 3*)
   - Update ItineraryApp.jsx to accept itinerary ID as prop
   - Update all Firestore queries in child components to use itinerary scope
   - Components affected: SpotModal.jsx, ExpensesView.jsx, RouletteView.jsx
9. Add theme provider/context to apply styling per itinerary (*parallel with Step 8*)
   - Wrap components with `<ThemeProvider itineraryId={id}>` 
   - Use Tailwind CSS variables or inline styles to override colors

### Phase 5: Navigation & Integration
10. Update root App.jsx
    - Replace current render with React Router setup
    - Define routes: `<Route path="/" element={<LandingPage />} />` and `<Route path="/itinerary/:id" element={<ItineraryPage />} />`
11. Add back-navigation UI
    - "← Back to Itineraries" link in header or button

### Phase 6: Testing & Refinement
12. Test multi-itinerary data isolation
    - Verify spots/expenses in Cstat don't appear in LA view
    - Check URL persistence (refresh `/itinerary/cstat` maintains state)
13. Validate theme switching
    - Visually test Cstat (brown/leather) vs LA theme

## Relevant files
- `src/ItineraryApp.jsx` — Refactor Firestore queries to accept `itineraryId` parameter
- `src/App.jsx` — Replace with React Router setup
- `src/firebase.js` — No changes needed (queries updated in hooks)
- `src/components/SpotModal.jsx` — Add itinerary scope to Firestore writes
- `src/components/ExpensesView.jsx` — Update queries for isolated expenses
- `src/components/RouletteView.jsx` — Scope roulette data to itinerary

## New files to create
- `src/pages/LandingPage.jsx` — Itinerary selector landing
- `src/pages/ItineraryPage.jsx` — Route handler, theme provider wrapper
- `src/config/itineraries.js` — Itinerary registry with metadata
- `src/utils/themes.js` — Theme color definitions
- `src/context/ThemeContext.js` — React Context for theme injection (optional, if using context)

## Verification
1. **Routing:** Navigate to `/` → see landing page; click Cstat → `/itinerary/cstat` loads; back button returns to landing
2. **Data Isolation:** Add a spot in Cstat itinerary, then visit LA itinerary → spot doesn't appear
3. **Themes:** Visually verify Cstat theme is brown/leather, LA theme is different (define colors in alignment step)
4. **Persistence:** Refresh `/itinerary/cstat`; data persists and theme remains
5. **Backward Compat (if needed):** Existing Firestore data structure works with new approach

## Decisions
- ✅ Using React Router v6 (industry standard, supports nested routing for future expansion)
- ✅ Firestore collection hierarchy: `itineraries/{id}/spots/` (keeps data clean, enables future sharing if needed)
- ✅ Theme as configuration (not database-driven initially) — easier to ship, can move to DB later
- ⏳ **Not included:** User authentication (assume single user or all users share trips for now)
- ⏳ **Not included:** Sharing/collaboration across users (can add later)

## Design Decisions Finalized
1. ✅ **Firestore Migration:** Start fresh with new `itineraries/{id}/` hierarchy. Existing Cstat data will be migrated to `itineraries/cstat/` structure.
2. ✅ **LA Trip Data:** Starts empty (users will populate as they plan the LA trip).
3. ✅ **Theme Palette for LA:** Vibrant, coastal palette
   - Light Blue: `#b4d2e7` (sky & ocean)
   - Golden Hour: `#f4b860` (sunset/warm tones) — *[recommend; exact shade TBD]*
   - Sunset Pinks: `#f4a3a3` (accent) — *[recommend; exact shade TBD]*
   - **Cstat Theme (existing):** Brown/leather (cowboy) — `aggie-maroon`, `cowboy-leather`, `texas-sand`
