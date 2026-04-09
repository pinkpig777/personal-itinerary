import React, { useState } from 'react';

export default function DateEditModal({ isOpen, onClose, onSave, startDate, endDate }) {
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (!localStart || !localEnd) {
      setError('Both start and end dates are required');
      return;
    }

    const start = new Date(localStart);
    const end = new Date(localEnd);

    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    onSave(localStart, localEnd);
    onClose();
  };

  const handleOpenChange = (e) => {
    const dateValue = e.target.value;
    console.log('Date:', dateValue);
    setLocalStart(dateValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black font-sans tracking-tight text-white mb-4">Edit Trip Dates</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="w-full bg-[#121212] border border-[#333333] text-white rounded-md p-3 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
              End Date
            </label>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="w-full bg-[#121212] border border-[#333333] text-white rounded-md p-3 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold border border-red-500/50 bg-red-900/20 p-3 rounded-md">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-400 font-bold uppercase tracking-widest border border-transparent hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-md font-bold uppercase tracking-widest border border-white bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
