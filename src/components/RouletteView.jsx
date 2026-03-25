import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function RouletteView() {
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('?');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'roulette'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOptions(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    try {
      await addDoc(collection(db, 'roulette'), { name: newOption.trim() });
      setNewOption('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'roulette', id));
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
      <div className="bg-[#FFFDF9] rounded-xl shadow-[0_2px_8px_rgba(139,90,43,0.15)] border border-cowboy-leather/20 p-6 flex flex-col items-center text-center">
        <h2 className="font-western text-3xl text-denim-blue mb-2">Restaurant Roulette</h2>
        <p className="text-cowboy-leather/80 text-sm mb-6">Can't decide where to eat? Let the wheel decide!</p>
        
        {/* The Display Window */}
        <div className={`w-full max-w-sm h-32 bg-texas-sand rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-inner overflow-hidden relative border-4 ${winner ? 'border-aggie-maroon scale-105 shadow-[0_10px_30px_rgba(80,0,0,0.3)]' : 'border-cowboy-leather/30'}`}>
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cowboy-leather to-transparent"></div>
          <span className={`font-black z-10 px-4 transition-all duration-200 ${winner ? 'text-aggie-maroon text-4xl font-western animate-bounce drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]' : 'text-denim-blue text-2xl font-sans'} ${isSpinning ? 'scale-110 text-aggie-maroon' : ''}`}>
            {currentDisplay}
          </span>
        </div>

        <button 
          onClick={spinRoulette}
          disabled={options.length < 2 || isSpinning}
          className={`w-full max-w-sm py-4 rounded-xl font-black text-xl uppercase tracking-[0.2em] shadow-lg transition-all duration-300 ${options.length < 2 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isSpinning ? 'bg-cowboy-leather text-texas-sand scale-95 opacity-80' : 'bg-aggie-maroon text-texas-sand hover:bg-[#3a0000] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(80,0,0,0.4)]'}`}
        >
          {isSpinning ? 'Spinning...' : 'SPIN IT!'}
        </button>
        {options.length < 2 && !isSpinning && (
          <p className="text-[10px] text-red-500 uppercase font-bold mt-2 tracking-wider">Add at least 2 options to spin!</p>
        )}
      </div>

      {/* Options List */}
      <div className="bg-[#FFFDF9] rounded-xl shadow-[0_2px_8px_rgba(139,90,43,0.15)] border border-cowboy-leather/20 p-5">
        <h3 className="font-bold text-denim-blue border-b border-cowboy-leather/20 pb-2 mb-3 uppercase tracking-wider text-sm">Competitors ({options.length})</h3>
        
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add a restaurant..."
            className="flex-1 border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon shadow-inner transition-shadow"
            disabled={isSpinning}
          />
          <button type="submit" disabled={isSpinning || !newOption.trim()} className="bg-cowboy-leather text-texas-sand px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-cowboy-leather/80 transition-colors disabled:opacity-50">
            Add
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {options.length === 0 ? (
            <p className="text-cowboy-leather/60 text-sm font-medium text-center py-6">No locations added yet.</p>
          ) : (
            options.map(opt => (
              <div key={opt.id} className="flex justify-between items-center bg-white border border-cowboy-leather/10 p-2.5 rounded-lg shadow-sm transition-all hover:shadow-md">
                <span className="font-bold text-sm text-denim-blue">{opt.name}</span>
                <button onClick={() => handleDelete(opt.id)} disabled={isSpinning} className="text-red-500 hover:text-red-800 p-1 opacity-60 hover:opacity-100 disabled:opacity-20 transition-opacity">
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
