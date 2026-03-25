import React, { useState, useEffect } from 'react';

export default function ExpenseModal({ isOpen, onClose, onSave, editingExpense, allMembers }) {
  const [formData, setFormData] = useState({ title: '', payer: '', amount: '', participants: [] });
  const [newPerson, setNewPerson] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setFormData(editingExpense);
    } else {
      setFormData({ title: '', payer: '', amount: '', participants: [] });
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.payer) return alert('Please enter a payer.');
    if (formData.participants.length === 0) return alert('Please select at least one participant.');
    if (!formData.amount || isNaN(formData.amount)) return alert('Please enter a valid amount.');
    
    onSave({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const handleToggleParticipant = (person) => {
    const isSelected = formData.participants.includes(person);
    if (isSelected) {
      setFormData(prev => ({ ...prev, participants: prev.participants.filter(p => p !== person) }));
    } else {
      setFormData(prev => ({ ...prev, participants: [...prev.participants, person] }));
    }
  };

  const handleAddNewPerson = () => {
    if (newPerson && !formData.participants.includes(newPerson)) {
      setFormData(prev => ({ ...prev, participants: [...prev.participants, newPerson] }));
      setNewPerson('');
    }
  };

  // Combine historical members with any new ones typed in this session
  const displayMembers = Array.from(new Set([...allMembers, ...formData.participants, formData.payer])).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-2xl w-full max-w-md p-6 shadow-[0_10px_40px_rgba(80,0,0,0.3)] border border-cowboy-leather/20 m-auto mt-10">
        <h2 className="text-3xl font-western text-denim-blue mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">What was it for?</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon"
              placeholder="e.g., Dinner at Dixie Chicken" 
              required 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Who paid?</label>
              <input 
                type="text" 
                value={formData.payer} 
                onChange={e => setFormData({...formData, payer: e.target.value})}
                className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon"
                placeholder="e.g., Charlie" 
                list="members-list"
                required 
              />
              <datalist id="members-list">
                {allMembers.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-1">Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon"
                placeholder="0.00" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cowboy-leather mb-2">Split among who?</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {displayMembers.map(person => (
                <label key={person} className="flex items-center gap-1 bg-texas-sand border border-cowboy-leather/20 px-3 py-1 rounded-full cursor-pointer hover:bg-cowboy-leather/10 transition-colors text-sm">
                  <input 
                    type="checkbox" 
                    checked={formData.participants.includes(person)}
                    onChange={() => handleToggleParticipant(person)}
                    className="accent-aggie-maroon"
                  />
                  {person}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newPerson} 
                onChange={e => setNewPerson(e.target.value)}
                className="flex-1 border border-cowboy-leather/30 bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-aggie-maroon"
                placeholder="Add someone else..." 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewPerson())}
              />
              <button type="button" onClick={handleAddNewPerson} className="bg-cowboy-leather text-texas-sand px-3 py-1 rounded-lg text-sm font-bold uppercase hover:bg-cowboy-leather/80 transition-colors">Add</button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-cowboy-leather/10 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-cowboy-leather font-bold uppercase tracking-wider text-sm hover:text-aggie-maroon transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-aggie-maroon text-texas-sand rounded-lg font-bold shadow-[0_4px_10px_rgba(80,0,0,0.3)] hover:bg-[#3a0000] hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}
