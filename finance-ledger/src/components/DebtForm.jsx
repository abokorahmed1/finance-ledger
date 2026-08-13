import { useState } from 'react'
import { db } from '../db'

const empty = {
  creditor: '', totalOwed: '', minPayment: '', dueDate: '',
  notes: '', payments: [],
  createdAt: new Date().toISOString().slice(0, 10)
}

export default function DebtForm({ onClose, editing }) {
  const [f, setF] = useState(editing || empty)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const save = async () => {
    const row = {
      ...f,
      totalOwed: parseFloat(f.totalOwed) || 0,
      minPayment: parseFloat(f.minPayment) || 0,
      payments: f.payments || []
    }
    if (editing?.id) await db.debts.update(editing.id, row)
    else await db.debts.add(row)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-navy-800 rounded-2xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">{editing?.id ? 'Edit' : 'Add'} debt</h2>

        <div><label className="label">Creditor</label>
          <input className="input" value={f.creditor} onChange={e => set('creditor', e.target.value)}/></div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Total owed (£)</label>
            <input type="number" step="0.01" className="input" value={f.totalOwed}
                   onChange={e => set('totalOwed', e.target.value)}/></div>
          <div><label className="label">Min payment (£)</label>
            <input type="number" step="0.01" className="input" value={f.minPayment}
                   onChange={e => set('minPayment', e.target.value)}/></div>
        </div>

        <div><label className="label">Due date</label>
          <input type="date" className="input" value={f.dueDate} onChange={e => set('dueDate', e.target.value)}/></div>

        <div><label className="label">Notes</label>
          <input className="input" value={f.notes} onChange={e => set('notes', e.target.value)}/></div>

        <div className="flex gap-2 pt-2">
          <button className="btn-primary flex-1" onClick={save}>Save</button>
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
