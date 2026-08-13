import { useState } from 'react'
import { db } from '../db'

const categories = [
  'Rideshare Income', 'Resale/Inventory', 'Platform Payout', 'Cash Income',
  'Groceries', 'Eating Out', 'Transport', 'Car (Business)', 'Rent',
  'Subscriptions', 'Shopping', 'Family Support', 'Savings', 'Intl Remittance',
  'Storage', 'Phone', 'Gym', 'Energy', 'Charity', 'Uncategorised'
]
const types = ['Income', 'Expense', 'Transfer', 'DebtPaydown']
const banks = ['Nationwide', 'Revolut', 'Cash', 'NS&I', 'Kroo']

const empty = {
  date: new Date().toISOString().slice(0, 10),
  bank: 'Nationwide', description: '', moneyIn: '', moneyOut: '',
  category: 'Uncategorised', type: 'Expense', phase: 'SelfEmployed',
  internal: false, notes: ''
}

export default function TransactionForm({ onClose, editing }) {
  const [f, setF] = useState(editing || empty)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const save = async () => {
    const row = {
      ...f,
      moneyIn: parseFloat(f.moneyIn) || 0,
      moneyOut: parseFloat(f.moneyOut) || 0
    }
    if (editing?.id) await db.transactions.update(editing.id, row)
    else await db.transactions.add(row)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-navy-800 rounded-2xl w-full max-w-md p-5 space-y-3 max-h-[85vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">{editing?.id ? 'Edit' : 'Add'} transaction</h2>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Date</label>
            <input type="date" className="input" value={f.date} onChange={e => set('date', e.target.value)}/></div>
          <div><label className="label">Bank</label>
            <select className="input" value={f.bank} onChange={e => set('bank', e.target.value)}>
              {banks.map(b => <option key={b}>{b}</option>)}</select></div>
        </div>

        <div><label className="label">Description</label>
          <input className="input" value={f.description} onChange={e => set('description', e.target.value)} placeholder="Uber BV, Tesco, etc."/></div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Money in (£)</label>
            <input type="number" step="0.01" className="input" value={f.moneyIn} onChange={e => set('moneyIn', e.target.value)}/></div>
          <div><label className="label">Money out (£)</label>
            <input type="number" step="0.01" className="input" value={f.moneyOut} onChange={e => set('moneyOut', e.target.value)}/></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Type</label>
            <select className="input" value={f.type} onChange={e => set('type', e.target.value)}>
              {types.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Category</label>
            <select className="input" value={f.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}</select></div>
        </div>

        <div><label className="label">Notes</label>
          <input className="input" value={f.notes} onChange={e => set('notes', e.target.value)}/></div>

        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={f.internal} onChange={e => set('internal', e.target.checked)}
                 className="accent-cyan-400"/>
          Internal transfer (exclude from totals)
        </label>

        <div className="flex gap-2 pt-2">
          <button className="btn-primary flex-1" onClick={save}>Save</button>
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
