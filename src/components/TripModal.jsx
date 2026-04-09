import { useEffect, useMemo, useState } from 'react';
import { isValidTripSlug, normalizeTripSlug } from '../utils/trips';

const createEmptyTripForm = () => ({
  slug: '',
  name: '',
  location: '',
  description: '',
  start_date: '',
  end_date: ''
});

export default function TripModal({ editingTrip, isOpen, onClose, onSave }) {
  const isEditing = Boolean(editingTrip);
  const [formData, setFormData] = useState(createEmptyTripForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const modalTitle = useMemo(() => {
    return isEditing ? 'Edit Trip' : 'Create Trip';
  }, [isEditing]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError('');
    setIsSaving(false);

    if (!editingTrip) {
      setFormData(createEmptyTripForm());
      return;
    }

    setFormData({
      slug: editingTrip.id,
      name: editingTrip.name || '',
      location: editingTrip.location || '',
      description: editingTrip.description || '',
      start_date: editingTrip.start_date || '',
      end_date: editingTrip.end_date || ''
    });
  }, [editingTrip, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: field === 'slug' ? normalizeTripSlug(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.slug || !isValidTripSlug(formData.slug)) {
      setError('Use a lowercase slug with letters, numbers, and hyphens only.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Trip name is required.');
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required.');
      return;
    }

    if (Boolean(formData.start_date) !== Boolean(formData.end_date)) {
      setError('Set both start and end dates, or leave both blank.');
      return;
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      setError('Start date must be before end date.');
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        slug: formData.slug,
        name: formData.name,
        location: formData.location,
        description: formData.description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      });
      onClose();
    } catch (saveError) {
      console.error('Error saving trip:', saveError);
      setError(saveError.message || 'Unable to save trip right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl border border-[#333333] bg-[#1E1E1E] p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">{modalTitle}</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              {isEditing ? 'Update the trip metadata stored in Firestore.' : 'Create a new trip document and route.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(event) => handleChange('slug', event.target.value)}
              readOnly={isEditing}
              className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none read-only:cursor-not-allowed read-only:text-gray-500"
              placeholder="la-trip"
              required
            />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
              This becomes the immutable `/itinerary/:id` route.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none"
                placeholder="LA Trip"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(event) => handleChange('location', event.target.value)}
                className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none"
                placeholder="Los Angeles, California"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none"
              placeholder="Coastal vibes and sunny days"
              rows="3"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(event) => handleChange('start_date', event.target.value)}
                className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(event) => handleChange('end_date', event.target.value)}
                className="w-full border border-[#333333] bg-[#121212] p-3 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="border border-red-500/50 bg-red-900/20 p-3 text-sm font-semibold text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="border border-white bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-[#333333] disabled:bg-[#121212] disabled:text-gray-500"
            >
              {isSaving ? 'Saving' : isEditing ? 'Save Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
