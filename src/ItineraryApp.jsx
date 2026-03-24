import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

import Header from './components/Header';
import Tabs from './components/Tabs';
import SpotList from './components/SpotList';
import SpotModal from './components/SpotModal';
import FloatingActionButton from './components/FloatingActionButton';

export default function ItineraryApp() {
  const [spots, setSpots] = useState([]);
  const [activeTab, setActiveTab] = useState('4/3');
  
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      <Header />
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
