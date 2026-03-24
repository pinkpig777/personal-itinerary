import React from 'react';
import ItineraryApp from './ItineraryApp'; // Make sure the path matches where you saved the file

function App() {
  return (
    // The wrapper div can be used for global styling if needed, 
    // but the ItineraryApp component handles its own layout.
    <div className="App">
      <ItineraryApp />
    </div>
  );
}

export default App;
