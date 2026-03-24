import React, { useState, useEffect } from 'react';

export default function SpotModal({ isOpen, onClose, onSave, editingSpot, activeTab }) {
  const [formData, setFormData] = useState({ date: activeTab, time: '12:00', title: '', description: '', imageUrl: 'https://via.placeholder.com/150/CCCCCC/000000?text=New' });

  useEffect(() => {
    if (editingSpot) {
      setFormData(editingSpot);
    } else {
      setFormData({ date: activeTab, time: '12:00', title: '', description: '', imageUrl: 'https://via.placeholder.com/150/CCCCCC/000000?text=New' });
    }
  }, [editingSpot, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">{editingSpot ? 'Edit Spot' : 'Add New Spot'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
              <select 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="4/3">Fri 4/3</option>
                <option value="4/4">Sat 4/4</option>
                <option value="4/5">Sun 4/5</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Time (24h)</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
              placeholder="e.g., Dixie Chicken" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
              placeholder="What are we doing here?" 
              rows="2" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded-lg font-medium shadow-sm hover:bg-red-700">Save Spot</button>
          </div>
        </form>
      </div>
    </div>
  );
}
