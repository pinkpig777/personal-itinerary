import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function RouletteView({ itineraryId = 'cstat' }) {
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('?');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const rouletteRef = collection(db, 'itineraries', itineraryId, 'roulette');
    const unsubscribe = onSnapshot(rouletteRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOptions(data);
    });
    return () => unsubscribe();
  }, [itineraryId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    try {
      await addDoc(collection(db, 'itineraries', itineraryId, 'roulette'), { name: newOption.trim() });
      setNewOption('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'itineraries', itineraryId, 'roulette', id));
    } catch (err) {
      console.error(err);
    }
  };

  const spinRoulette = () => {
    if (options.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    
    let duration = 30; // initial fast speed
    let totalElapsed = 0;
    
    const spin = () => {
      const randomIndex = Math.floor(Math.random() * options.length);
      setCurrentDisplay(options[randomIndex].name);
      
      totalElapsed += duration;
      duration *= 1.1; // 10% slower each tick
      
      if (totalElapsed < 3000) {
        setTimeout(spin, duration);
      } else {
        const finalWinner = options[Math.floor(Math.random() * options.length)].name;
        setCurrentDisplay(finalWinner);
        setWinner(finalWinner);
        setIsSpinning(false);
      }
    };
    
    spin();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-6 flex flex-col items-center text-center">
        <h2 className="font-sans font-black tracking-tight text-3xl text-white mb-2">Restaurant Roulette</h2>
        <p className="text-gray-400 text-sm mb-6">Can't decide where to eat? Let the wheel decide!</p>
        
        {/* The Display Window */}
        <div className={`w-full max-w-sm h-32 bg-[#121212] rounded-md flex items-center justify-center mb-6 transition-all duration-500 overflow-hidden relative border-2 ${winner ? 'border-white scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.1)]' : 'border-[#333333]'}`}>
          <span className={`font-black z-10 px-4 transition-all duration-200 ${winner ? 'text-white text-4xl animate-bounce' : 'text-gray-300 text-2xl font-sans'} ${isSpinning ? 'scale-110 text-white' : ''}`}>
            {currentDisplay}
          </span>
        </div>

        <button 
          onClick={spinRoulette}
          disabled={options.length < 2 || isSpinning}
          className={`w-full max-w-sm py-4 rounded-md font-black text-xl uppercase tracking-[0.2em] transition-all duration-300 border-2 ${options.length < 2 ? 'bg-transparent text-gray-500 border-[#333333] cursor-not-allowed' : isSpinning ? 'bg-gray-800 text-white border-gray-800 scale-95 opacity-80' : 'bg-white text-black border-white hover:bg-gray-200 hover:-translate-y-1'}`}
        >
          {isSpinning ? 'Spinning...' : 'SPIN IT!'}
        </button>
        {options.length < 2 && !isSpinning && (
          <p className="text-[10px] text-red-500 uppercase font-bold mt-2 tracking-wider">Add at least 2 options to spin!</p>
        )}
      </div>

      {/* Options List */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-5">
        <h3 className="font-bold text-white border-b border-[#333333] pb-2 mb-3 uppercase tracking-wider text-sm">Competitors ({options.length})</h3>
        
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add a restaurant..."
            className="flex-1 border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
            disabled={isSpinning}
          />
          <button type="submit" disabled={isSpinning || !newOption.trim()} className="bg-white text-black border border-white px-4 py-2 rounded-md font-bold uppercase tracking-wider text-xs hover:bg-gray-200 transition-colors disabled:opacity-50">
            Add
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {options.length === 0 ? (
            <p className="text-gray-500 text-sm font-medium text-center py-6">No locations added yet.</p>
          ) : (
            options.map(opt => (
              <div key={opt.id} className="flex justify-between items-center bg-[#121212] border border-[#333333] p-2.5 rounded-md transition-all">
                <span className="font-bold text-sm text-white">{opt.name}</span>
                <button onClick={() => handleDelete(opt.id)} disabled={isSpinning} className="text-red-500 hover:text-red-400 p-1 opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
