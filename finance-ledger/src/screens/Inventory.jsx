import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Trash2, Package, ShoppingCart } from 'lucide-react'
import { db } from '../db'
import InventoryForm from '../components/InventoryForm'
import { gbp } from '../utils/format'

const statusColors = {
  InStock: 'bg-ledger-blue/20 text-ledger-blue',
  Listed: 'bg-ledger-amber/20 text-ledger-amber',
  Sold: 'bg-ledger-green/20 text-ledger-green'
}

export default function Inventory() {
  const [form, setForm] = useState(null)
  const [view, setView] = useState('stock') // stock | sold
  const items = useLiveQuery(() => db.inventory.toArray()) || []

  const inStock = items.filter(i => i.status !== 'Sold')
  const sold = items.filter(i => i.status === 'Sold')
  const totalStock = inStock.reduce((s, i) => s + (i.qty || 1), 0)
  const totalValue = inStock.reduce((s, i) => s + (i.listPrice || 0) * (i.qty || 1), 0)
  const totalCost = inStock.reduce((s, i) => s + (i.purchasePrice || 0) * (i.qty || 1), 0)

  const del = async (id) => {
    if (confirm('Delete this item?')) await db.inventory.delete(id)
  }

  const displayed = view === 'stock' ? inStock : sold

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Inventory</h1>
        <button className="btn-primary flex items-center gap-1" onClick={() => setForm({})}>
          <Plus size={16}/> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="island text-center">
          <p className="label">Units</p>
          <p className="text-xl font-bold text-cyan-400">{totalStock}</p>
        </div>
        <div className="island text-center">
          <p className="label">List value</p>
          <p className="text-xl font-bold text-ledger-green">{gbp(totalValue)}</p>
        </div>
        <div className="island text-center">
          <p className="label">Cost basis</p>
          <p className="text-xl font-bold text-ledger-amber">{gbp(totalCost)}</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('stock')}
                className={`tab flex items-center gap-1.5 ${view === 'stock' ? 'tab-on' : 'tab-off'}`}>
          <Package size={14}/> In stock ({inStock.length})
        </button>
        <button onClick={() => setView('sold')}
                className={`tab flex items-center gap-1.5 ${view === 'sold' ? 'tab-on' : 'tab-off'}`}>
          <ShoppingCart size={14}/> Sold ({sold.length})
        </button>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {displayed.map(i => (
          <div key={i.id} className="island flex items-center gap-3 !p-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{i.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[i.status]}`}>
                  {i.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {i.platform} · Qty {i.qty || 1} · Cost {gbp(i.purchasePrice)}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-300">{gbp(i.listPrice)}</p>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setForm(i)} className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-500">
                <Pencil size={14}/></button>
              <button onClick={() => del(i.id)} className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-500">
                <Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="island text-center py-10">
          <p className="text-gray-400">{view === 'stock' ? 'No stock items' : 'No sold items'}</p>
        </div>
      )}

      {form !== null && <InventoryForm editing={form.id ? form : undefined} onClose={() => setForm(null)}/>}
    </div>
  )
}
