import { useState } from 'react'
import { db } from '../db'

const platforms = ['eBay', 'Vinted', 'Facebook', 'In-Person', 'Other']
const statuses = ['InStock', 'Listed', 'Sold']

const empty = {
  name: '', purchasePrice: '', listPrice: '', qty: 1,
  platform: 'eBay', status: 'InStock', category: '', notes: '',
  createdAt: new Date().toISOString().slice(0, 10)
}

export default function InventoryForm({ onClose, editing }) {
  const [f, setF] = useState(editing || empty)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const save = async () => {
    const row = {
      ...f,
      purchasePrice: parseFloat(f.purchasePrice) || 0,
      listPrice: parseFloat(f.listPrice) || 0,
      qty: parseInt(f.qty) || 1
    }
    if (editing?.id) await db.inventory.update(editing.id, row)
    else await db.inventory.add(row)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-navy-800 rounded-2xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">{editing?.id ? 'Edit' : 'Add'} stock item</h2>

        <div><label className="label">Item name</label>
          <input className="input" value={f.name} onChange={e => set('name', e.target.value)}
                 placeholder="Ray-Ban Meta Gen 2"/></div>

        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Cost (£)</label>
            <input type="number" step="0.01" className="input" value={f.purchasePrice}
                   onChange={e => set('purchasePrice', e.target.value)}/></div>
          <div><label className="label">List (£)</label>
            <input type="number" step="0.01" className="input" value={f.listPrice}
                   onChange={e => set('listPrice', e.target.value)}/></div>
          <div><label className="label">Qty</label>
            <input type="number" className="input" value={f.qty}
                   onChange={e => set('qty', e.target.value)}/></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Platform</label>
            <select className="input" value={f.platform} onChange={e => set('platform', e.target.value)}>
              {platforms.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label">Status</label>
            <select className="input" value={f.status} onChange={e => set('status', e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}</select></div>
        </div>

        <div><label className="label">Category</label>
          <input className="input" value={f.category || ''} onChange={e => set('category', e.target.value)}
                 placeholder="Meta Glasses"/></div>

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
