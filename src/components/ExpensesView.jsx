import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseModal from './ExpenseModal';

export default function ExpensesView({ itineraryId = 'cstat' }) {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const expensesRef = collection(db, 'itineraries', itineraryId, 'expenses');
    const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
      const expData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expData);
    });
    return () => unsubscribe();
  }, [itineraryId]);

  const allMembers = useMemo(() => {
    const members = new Set();
    expenses.forEach(exp => {
      members.add(exp.payer);
      if (exp.participants) exp.participants.forEach(p => members.add(p));
    });
    return Array.from(members).sort();
  }, [expenses]);

  const settlements = useMemo(() => {
    const balances = {}; 
    expenses.forEach(exp => {
      if (!balances[exp.payer]) balances[exp.payer] = 0;
      balances[exp.payer] += Number(exp.amount);
      
      if (exp.participants && exp.participants.length > 0) {
        const splitAmount = Number(exp.amount) / exp.participants.length;
        exp.participants.forEach(p => {
          if (!balances[p]) balances[p] = 0;
          balances[p] -= splitAmount;
        });
      }
    });

    const debtors = [];
    const creditors = [];
    Object.keys(balances).forEach(person => {
      const b = balances[person];
      if (b < -0.01) debtors.push({ person, amount: -b });
      else if (b > 0.01) creditors.push({ person, amount: b });
    });

    debtors.sort((a,b) => b.amount - a.amount);
    creditors.sort((a,b) => b.amount - a.amount);

    const results = [];
    let dIndex = 0;
    let cIndex = 0;

    while(dIndex < debtors.length && cIndex < creditors.length) {
      const d = debtors[dIndex];
      const c = creditors[cIndex];
      const amt = Math.min(d.amount, c.amount);
      results.push({ from: d.person, to: c.person, amount: amt });
      d.amount -= amt;
      c.amount -= amt;
      if (d.amount < 0.01) dIndex++;
      if (c.amount < 0.01) cIndex++;
    }
    return results;
  }, [expenses]);

  const handleSave = async (formData) => {
    try {
      if (editingExpense && editingExpense.id) {
        await updateDoc(doc(db, 'itineraries', itineraryId, 'expenses', editingExpense.id), formData);
      } else {
        await addDoc(collection(db, 'itineraries', itineraryId, 'expenses'), formData);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'itineraries', itineraryId, 'expenses', id));
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Settlements Card */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-5 relative overflow-hidden">
        <h2 className="text-2xl font-black font-sans text-white border-b border-[#333333] pb-2 mb-3 tracking-tight">Balances to Settle</h2>
        {settlements.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Everyone is settled up!</p>
        ) : (
          <ul className="space-y-3">
            {settlements.map((s, i) => (
              <li key={i} className="text-sm text-gray-300 bg-[#121212] p-3 rounded-md border border-[#333333] flex items-center shadow-none">
                <span className="font-bold text-white mr-1">{s.from}</span> 
                owes 
                <span className="font-bold text-white mx-1">{s.to}</span>
                <span className="ml-auto font-black text-lg text-white">${s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-5">
        <div className="flex justify-between items-center border-b border-[#333333] pb-2 mb-3">
          <h2 className="font-black font-sans text-white text-2xl tracking-tight">Expenses Log</h2>
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className="bg-white text-black px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-200 hover:-translate-y-0.5 transition-all"
          >
            + Add
          </button>
        </div>
        
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 mt-6 mb-4 text-sm font-medium">No expenses logged yet. Add one above!</p>
        ) : (
          <div className="space-y-3 mt-4">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-[#121212] rounded-md border border-[#333333] p-4 flex justify-between items-center group transition-all">
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{exp.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="font-black uppercase tracking-wider text-white">{exp.payer}</span> paid <span className="text-white font-black">${Number(exp.amount).toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-bold">Split with:</span> {exp.participants?.join(', ')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest">Edit</button>
                  <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingExpense={editingExpense}
        allMembers={allMembers}
      />
    </div>
  );
}
