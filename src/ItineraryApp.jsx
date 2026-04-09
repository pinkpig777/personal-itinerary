import { useEffect, useState } from 'react';
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

export default function ItineraryApp({
  itineraryId = '',
  itinerary = null,
  onDatesUpdate = null,
  canEdit = false
}) {
  const [spots, setSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [appMode, setAppMode] = useState('schedule'); // schedule, tools, money-split
  const hasScheduleDates = Boolean(itinerary?.start_date && itinerary?.end_date);
  
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
    if (!canEdit) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'itineraries', itineraryId, 'spots', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const openModal = (spot = null) => {
    if (!canEdit) {
      return;
    }

    setEditingSpot(spot);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (!canEdit) {
      return;
    }

    try {
      if (editingSpot && editingSpot.id) {
        // Update existing spot
        const spotRef = doc(db, 'itineraries', itineraryId, 'spots', editingSpot.id);
        const dataToUpdate = { ...formData };
        delete dataToUpdate.id;
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
    <div className="min-h-screen bg-[#0A0A0A] font-sans pb-20 text-white transition-colors duration-300">
      <Header canEdit={canEdit} itinerary={itinerary} onDatesUpdate={onDatesUpdate} />
      
      <div 
        className="flex w-full justify-center sticky top-0 z-40 mb-6 px-4 bg-[#0A0A0A] border-b border-[#333333]"
      >
        <div className="flex w-64">
          <button 
            onClick={() => { setAppMode('schedule'); }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 bg-transparent ${appMode === 'schedule' ? 'border-white text-white' : 'border-transparent text-[#333333] hover:text-gray-400'}`}
          >
            Schedule
          </button>
          <button 
            onClick={() => setAppMode('tools')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-200 border-b-2 bg-transparent ${appMode !== 'schedule' ? 'border-white text-white' : 'border-transparent text-[#333333] hover:text-gray-400'}`}
          >
            Tools
          </button>
        </div>
      </div>

      {appMode === 'schedule' && (
        <>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} itinerary={itinerary} />
          <main className="p-4 space-y-4 max-w-lg mx-auto">
            <SpotList 
              canEdit={canEdit}
              spots={spots} 
              activeTab={activeTab} 
              onEdit={openModal} 
              onDelete={handleDelete}
              onAdd={canEdit && hasScheduleDates ? () => openModal() : null}
            />
          </main>
          {canEdit && hasScheduleDates && <FloatingActionButton onClick={() => openModal()} />}
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
          <ExpensesView canEdit={canEdit} itineraryId={itineraryId} />
        </main>
      )}

      {appMode === 'roulette' && (
        <main className="p-4 max-w-lg mx-auto">
          <button onClick={() => setAppMode('tools')} className="mb-4 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            ← Back to Tools
          </button>
          <RouletteView canEdit={canEdit} itineraryId={itineraryId} />
        </main>
      )}

      <SpotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingSpot={editingSpot} 
        activeTab={activeTab}
        itinerary={itinerary}
      />
    </div>
  );
}
