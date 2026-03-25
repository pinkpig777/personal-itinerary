import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

import Header from './components/Header';
import Tabs from './components/Tabs';
import SpotList from './components/SpotList';
import SpotModal from './components/SpotModal';
import FloatingActionButton from './components/FloatingActionButton';
import ExpensesView from './components/ExpensesView';
import ToolsMenu from './components/ToolsMenu';
import RouletteView from './components/RouletteView';

export default function ItineraryApp() {
  const [spots, setSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('4/3');
  const [appMode, setAppMode] = useState('schedule'); // schedule, tools, money-split
  
  // State for the Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);

  useEffect(() => {
    // Listen to real-time updates from Firestore
    const unsubscribe = onSnapshot(collection(db, 'spots'), (snapshot) => {
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
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'spots', id));
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
        const spotRef = doc(db, 'spots', editingSpot.id);
        const { id, ...dataToUpdate } = formData;
        await updateDoc(spotRef, dataToUpdate);
      } else {
        // Add new spot
        await addDoc(collection(db, 'spots'), formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-texas-sand text-denim-blue font-sans pb-20 selection:bg-aggie-maroon selection:text-white">
      <Header />
      
      {/* App Shell Toggle */}
      <div className="flex justify-center p-4 bg-texas-sand/95 border-b border-cowboy-leather/20 shadow-sm sticky top-0 z-20">
        <div className="flex bg-white rounded-full p-1 shadow-inner border border-cowboy-leather/20 w-64 relative">
          <div className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-aggie-maroon rounded-full transition-transform duration-300 ease-in-out shadow-[0_2px_8px_rgba(80,0,0,0.3)] ${appMode !== 'schedule' ? 'translate-x-[calc(100%+0px)]' : ''}`}></div>
          <button 
            onClick={() => { setAppMode('schedule'); setActiveTab('4/3'); }}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors duration-300 ${appMode === 'schedule' ? 'text-texas-sand' : 'text-cowboy-leather hover:text-aggie-maroon'}`}
          >
            📅 Schedule
          </button>
          <button 
            onClick={() => setAppMode('tools')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider relative z-10 transition-colors duration-300 ${appMode !== 'schedule' ? 'text-texas-sand' : 'text-cowboy-leather hover:text-aggie-maroon'}`}
          >
            🧰 Tools
          </button>
        </div>
      </div>

      {appMode === 'schedule' && (
        <>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="p-4 space-y-4 max-w-lg mx-auto">
            <SpotList 
              spots={spots} 
              activeTab={activeTab} 
              onEdit={openModal} 
              onDelete={handleDelete} 
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
          <button onClick={() => setAppMode('tools')} className="mb-4 text-cowboy-leather hover:text-aggie-maroon text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            ← Back to Tools
          </button>
          <ExpensesView />
        </main>
      )}

      {appMode === 'roulette' && (
        <main className="p-4 max-w-lg mx-auto">
          <button onClick={() => setAppMode('tools')} className="mb-4 text-cowboy-leather hover:text-aggie-maroon text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            ← Back to Tools
          </button>
          <RouletteView />
        </main>
      )}

      <SpotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingSpot={editingSpot} 
        activeTab={activeTab} 
      />
    </div>
  );
}
