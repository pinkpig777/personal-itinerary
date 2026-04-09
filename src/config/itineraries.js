/**
 * Itinerary Configuration Registry
 * Defines metadata for each itinerary, including dates, theme, and display info
 */

export const itineraries = {
  cstat: {
    id: 'cstat',
    name: 'Cstat Trip',
    location: 'College Station, Texas',
    start_date: '2024-04-03',
    end_date: '2024-04-05',
    theme: 'cowboy',
    description: 'A classic Texas adventure'
  },
  la: {
    id: 'la',
    name: 'LA Trip',
    location: 'Los Angeles, California',
    start_date: null, // To be filled by user
    end_date: null,
    theme: 'coastal',
    description: 'Coastal vibes and sunny days'
  }
};

/**
 * Get itinerary by ID
 * @param {string} id - Itinerary ID (e.g., 'cstat', 'la')
 * @returns {object|null} Itinerary config or null if not found
 */
export const getItinerary = (id) => {
  return itineraries[id] || null;
};

/**
 * Get all available itineraries
 * @returns {array} Array of itinerary objects
 */
export const getAllItineraries = () => {
  return Object.values(itineraries);
};
