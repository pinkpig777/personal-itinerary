import { useEffect, useState } from 'react';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#1E1E1E] rounded-xl w-full max-w-md p-6 border border-[#333333] m-auto mt-10">
        <h2 className="text-3xl font-black font-sans text-white tracking-tight mb-4">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">What was it for?</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
              placeholder="e.g., Dinner at Central Station" 
              required 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Who paid?</label>
              <input 
                type="text" 
                value={formData.payer} 
                onChange={e => setFormData({...formData, payer: e.target.value})}
                className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="e.g., Charlie" 
                list="members-list"
                required 
              />
              <datalist id="members-list">
                {allMembers.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="0.00" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Split among who?</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {displayMembers.map(person => (
                <label key={person} className="flex items-center gap-1 bg-[#121212] border border-[#333333] text-white px-3 py-1 rounded-full cursor-pointer hover:bg-gray-800 transition-colors text-sm">
                  <input 
                    type="checkbox" 
                    checked={formData.participants.includes(person)}
                    onChange={() => handleToggleParticipant(person)}
                    className="accent-white"
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
                className="flex-1 border border-[#333333] bg-[#121212] text-white rounded-md p-2 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="Add someone else..." 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewPerson())}
              />
              <button type="button" onClick={handleAddNewPerson} className="bg-white text-black px-3 py-1 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Add</button>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-[#333333] mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-400 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-white text-black rounded-md font-bold hover:bg-gray-200 active:scale-95 transition-all text-sm uppercase tracking-widest border border-white">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}
