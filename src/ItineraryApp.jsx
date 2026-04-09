import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { useTheme } from './context/ThemeContext';

import Header from './components/Header';
import Tabs from './components/Tabs';
import SpotList from './components/SpotList';
import SpotModal from './components/SpotModal';
import FloatingActionButton from './components/FloatingActionButton';
import ExpensesView from './components/ExpensesView';
import ToolsMenu from './components/ToolsMenu';
import RouletteView from './components/RouletteView';

export default function ItineraryApp({ itineraryId = 'cstat', itinerary = null, onDatesUpdate = null }) {
  const { theme } = useTheme();
  const [spots, setSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('4/3');
  const [appMode, setAppMode] = useState('schedule'); // schedule, tools, money-split
  
  // State for the Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);

  useEffect(() => {
    // Listen to real-time updates from Firestore
    // Query path: itineraries/{itineraryId}/spots
    const spotsRef = collection(db, 'itineraries', itineraryId, 'spots');
    const unsubscribe = onSnapshot(spotsRef, (snapshot) => {
      const spotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpots(spotsData);
    }, (error) => {
      console.error("Error fetching spots:", error);
      // Depending on the firebase config validity, this might error.
      // We will leave it silently failing in the UI or log it.
    });

    return () => unsubscribe();
  }, [itineraryId]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'itineraries', itineraryId, 'spots', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const openModal = (spot = null) => {
    setEditingSpot(spot);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingSpot && editingSpot.id) {
        // Update existing spot
        const spotRef = doc(db, 'itineraries', itineraryId, 'spots', editingSpot.id);
        const { id, ...dataToUpdate } = formData;
        await updateDoc(spotRef, dataToUpdate);
      } else {
        // Add new spot
        const spotsRef = collection(db, 'itineraries', itineraryId, 'spots');
        await addDoc(spotsRef, formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

  return (
    <div 
      style={{
        backgroundColor: theme.background,
        color: theme.text
      }}
      className="min-h-screen font-sans pb-20 selection:text-white transition-colors duration-300"
    >
      <Header itinerary={itinerary} onDatesUpdate={onDatesUpdate} />
      
      <div 
        className="flex justify-center sticky top-6 z-40 mb-6 px-4"
      >
        <div 
          className="flex w-64 p-1 gap-2 rounded-lg"
          style={{ backgroundColor: theme.background }}
        >
          <button 
            onClick={() => { setAppMode('schedule'); }}
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition-colors duration-200"
            style={{
              backgroundColor: appMode === 'schedule' ? theme.light : 'transparent',
              color: appMode === 'schedule' ? theme.primary : theme.accent,
              borderColor: appMode === 'schedule' ? theme.secondary : 'transparent'
            }}
          >
            📅 Schedule
          </button>
          <button 
            onClick={() => setAppMode('tools')}
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition-colors duration-200"
            style={{
              backgroundColor: appMode !== 'schedule' ? theme.light : 'transparent',
              color: appMode !== 'schedule' ? theme.primary : theme.accent,
              borderColor: appMode !== 'schedule' ? theme.secondary : 'transparent'
            }}
          >
            🧰 Tools
          </button>
        </div>
      </div>

      {appMode === 'schedule' && (
        <>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} itinerary={itinerary} />
          <main className="p-4 space-y-4 max-w-lg mx-auto">
            <SpotList 
              spots={spots} 
              activeTab={activeTab} 
              onEdit={openModal} 
              onDelete={handleDelete}
              onAdd={() => openModal()}
            />
          </main>
          <FloatingActionButton onClick={() => openModal()} />
        </>
      )}

      {appMode === 'tools' && (
        <main className="p-4 max-w-lg mx-auto">
          <ToolsMenu onSelectTool={(tool) => setAppMode(tool)} />
        </main>
      )}

      {appMode === 'money-split' && (
        <main className="p-4 max-w-lg mx-auto">
          <button onClick={() => setAppMode('tools')} className="mb-4 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            ← Back to Tools
          </button>
          <ExpensesView itineraryId={itineraryId} />
        </main>
      )}

      {appMode === 'roulette' && (
        <main className="p-4 max-w-lg mx-auto">
          <button onClick={() => setAppMode('tools')} className="mb-4 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            ← Back to Tools
          </button>
          <RouletteView itineraryId={itineraryId} />
        </main>
      )}

      <SpotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingSpot={editingSpot} 
        activeTab={activeTab}
        itineraryId={itineraryId}
      />
    </div>
  );
}
