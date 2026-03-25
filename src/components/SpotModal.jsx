import React, { useState, useEffect } from 'react';

export default function SpotModal({ isOpen, onClose, onSave, editingSpot, activeTab }) {
  const [formData, setFormData] = useState({ date: activeTab, time: '12:00', title: '', description: '', googleMapsLink: '' });

  useEffect(() => {
    if (editingSpot) {
      setFormData(editingSpot);
    } else {
      setFormData({ date: activeTab, time: '12:00', title: '', description: '', googleMapsLink: '' });
    }
  }, [editingSpot, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#FFFDF9] rounded-2xl w-full max-w-md p-6 shadow-[0_10px_40px_rgba(80,0,0,0.3)] border border-cowboy-leather/20">
        <h2 className="text-3xl font-western text-denim-blue mb-4">{editingSpot ? 'Edit Spot' : 'Saddle Up! New Spot'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Date</label>
              <select 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon transition-shadow"
              >
                <option value="4/3">Fri 4/3</option>
                <option value="4/4">Sat 4/4</option>
                <option value="4/5">Sun 4/5</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Time (24h)</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon transition-shadow"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon transition-shadow"
              placeholder="e.g., Dixie Chicken" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon transition-shadow"
              placeholder="What are we doing here?" 
              rows="2" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Google Maps Link (Optional)</label>
            <input 
              type="url" 
              value={formData.googleMapsLink || ''} 
              onChange={e => setFormData({...formData, googleMapsLink: e.target.value})}
              className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon transition-shadow"
              placeholder="https://maps.app.goo.gl/..." 
            />
          </div>
          <div className="pt-4 flex justify-end gap-4 border-t border-cowboy-leather/10 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-cowboy-leather font-bold uppercase tracking-wider text-sm hover:text-aggie-maroon transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-aggie-maroon text-texas-sand rounded-lg font-bold shadow-[0_4px_10px_rgba(80,0,0,0.3)] hover:bg-[#3a0000] hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider">Save Spot</button>
          </div>
        </form>
      </div>
    </div>
  );
}
