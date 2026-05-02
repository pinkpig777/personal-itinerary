import { useEffect, useMemo, useState } from 'react';
import { formatIsoDate, getItineraryDateOptions, matchesDateKey } from '../utils/itineraryDates';

const createEmptyFormData = (date = '') => ({
  date,
  time: '12:00',
  title: '',
  description: '',
  googleMapsLink: ''
});

export default function SpotModal({ isOpen, onClose, onSave, editingSpot, activeTab, itinerary }) {
  const dateOptions = useMemo(() => {
    return getItineraryDateOptions(itinerary?.start_date, itinerary?.end_date);
  }, [itinerary?.end_date, itinerary?.start_date]);
  const defaultDate = useMemo(() => {
    const activeOption = dateOptions.find((option) => matchesDateKey(option.key, activeTab));

    return activeOption?.key || dateOptions[0]?.key || formatIsoDate(activeTab);
  }, [activeTab, dateOptions]);
  const [formData, setFormData] = useState(() => createEmptyFormData(defaultDate));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingSpot) {
      const matchedDate = dateOptions.find((option) => matchesDateKey(option.key, editingSpot.date));

      setFormData({
        ...createEmptyFormData(defaultDate),
        ...editingSpot,
        date: matchedDate?.key || formatIsoDate(editingSpot.date) || defaultDate
      });
    } else {
      setFormData(createEmptyFormData(defaultDate));
    }
  }, [dateOptions, defaultDate, editingSpot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date) {
      return;
    }

    onSave({
      ...formData,
      date: formatIsoDate(formData.date)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E1E1E] rounded-xl w-full max-w-md p-6 border border-[#333333]">
        <h2 className="text-3xl font-black font-sans text-white mb-4 tracking-tight">{editingSpot ? 'Edit Spot' : 'New Spot'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Date</label>
              {dateOptions.length > 0 ? (
                <select 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
                >
                  {dateOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={formData.date || 'Set trip dates first'}
                    readOnly
                    className="w-full border border-[#333333] bg-[#121212] text-gray-400 rounded-md p-2 text-sm focus:outline-none"
                  />
                  {!formData.date && (
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      Set the itinerary dates in the header before creating new spots.
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Time (24h)</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
              placeholder="e.g., Central Station" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
              placeholder="What are we doing here?" 
              rows="2" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Google Maps Link (Optional)</label>
            <input 
              type="url" 
              value={formData.googleMapsLink || ''} 
              onChange={e => setFormData({...formData, googleMapsLink: e.target.value})}
              className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
              placeholder="https://maps.app.goo.gl/..." 
            />
          </div>
          <div className="pt-6 flex justify-end gap-4 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-400 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={!formData.date} className="px-6 py-2 bg-white text-[#121212] rounded-md font-bold hover:bg-gray-200 active:scale-95 transition-all text-sm uppercase tracking-widest border border-white disabled:cursor-not-allowed disabled:border-[#333333] disabled:bg-[#121212] disabled:text-gray-500">Save Spot</button>
          </div>
        </form>
      </div>
    </div>
  );
}
