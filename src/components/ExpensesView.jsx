import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import ExpenseModal from './ExpenseModal';

export default function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const expData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expData);
    });
    return () => unsubscribe();
  }, []);

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
        await updateDoc(doc(db, 'expenses', editingExpense.id), formData);
      } else {
        await addDoc(collection(db, 'expenses'), formData);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Settlements Card */}
      <div className="bg-[#FFFDF9] rounded-xl shadow-[0_2px_8px_rgba(139,90,43,0.15)] border border-cowboy-leather/20 p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-aggie-maroon"></div>
        <h2 className="font-western text-2xl text-denim-blue border-b border-cowboy-leather/20 pb-2 mb-3 pl-2">Balances to Settle</h2>
        {settlements.length === 0 ? (
          <p className="text-cowboy-leather/70 text-sm italic pl-2">Everyone is settled up! Yippee ki-yay! 🤠</p>
        ) : (
          <ul className="space-y-3 pl-2">
            {settlements.map((s, i) => (
              <li key={i} className="text-sm text-cowboy-leather bg-texas-sand p-3 rounded-lg border border-cowboy-leather/10 flex items-center shadow-sm">
                <span className="font-bold text-aggie-maroon mr-1">{s.from}</span> 
                owes 
                <span className="font-bold text-denim-blue mx-1">{s.to}</span>
                <span className="ml-auto font-black text-lg text-aggie-maroon">${s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expenses List */}
      <div className="bg-[#FFFDF9] rounded-xl shadow-[0_2px_8px_rgba(139,90,43,0.15)] border border-cowboy-leather/20 p-5">
        <div className="flex justify-between items-center border-b border-cowboy-leather/20 pb-2 mb-3">
          <h2 className="font-western text-2xl text-denim-blue">Expenses Log</h2>
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className="bg-aggie-maroon text-texas-sand px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#3a0000] hover:-translate-y-0.5 transition-all"
          >
            + Add
          </button>
        </div>
        
        {expenses.length === 0 ? (
          <p className="text-center text-cowboy-leather/60 mt-6 mb-4 text-sm font-medium">No expenses logged yet. Add one above!</p>
        ) : (
          <div className="space-y-3 mt-4">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white rounded-lg shadow-sm border border-cowboy-leather/10 p-4 flex justify-between items-center group transition-all hover:shadow-md">
                <div>
                  <h3 className="font-bold text-denim-blue text-lg leading-tight">{exp.title}</h3>
                  <p className="text-xs text-cowboy-leather mt-1">
                    <span className="font-black uppercase tracking-wider">{exp.payer}</span> paid <span className="text-aggie-maroon font-black">${Number(exp.amount).toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-cowboy-leather/70 mt-1">
                    <span className="font-bold">Split with:</span> {exp.participants?.join(', ')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="text-cowboy-leather hover:text-aggie-maroon text-xs font-bold uppercase tracking-wider">Edit</button>
                  <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-800 text-xs font-bold uppercase tracking-wider">Delete</button>
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
