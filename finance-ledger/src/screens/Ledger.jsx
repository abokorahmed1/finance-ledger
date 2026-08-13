import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { db } from '../db'
import TransactionForm from '../components/TransactionForm'
import QuarterFilter from '../components/QuarterFilter'
import { gbp, shortDate } from '../utils/format'
import { getTaxYear, filterByQuarter } from '../utils/tax'

export default function Ledger({ quarter, setQuarter }) {
  const [form, setForm] = useState(null) // null=closed, {}=new, {id,...}=edit
  const txns = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || []
  const filtered = filterByQuarter(txns, getTaxYear(), quarter)

  const del = async (id) => {
    if (confirm('Delete this transaction?')) await db.transactions.delete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Ledger</h1>
        <div className="flex gap-2 items-center">
          <QuarterFilter active={quarter} onChange={setQuarter} />
          <button className="btn-primary flex items-center gap-1" onClick={() => setForm({})}>
            <Plus size={16}/> Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="island flex items-center gap-3 !p-3.5">
            <div className={`w-1 h-10 rounded-full flex-shrink-0
              ${t.internal ? 'bg-gray-600' : t.moneyIn > 0 ? 'bg-ledger-green' : 'bg-ledger-red'}`}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.description || 'Untitled'}</p>
              <p className="text-[11px] text-gray-500">
                {shortDate(t.date)} · {t.bank} · {t.category}
                {t.internal && ' · Internal'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {t.moneyIn > 0 && <p className="text-sm font-semibold text-ledger-green">+{gbp(t.moneyIn)}</p>}
              {t.moneyOut > 0 && <p className="text-sm font-semibold text-ledger-red">-{gbp(t.moneyOut)}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setForm(t)} className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-500">
                <Pencil size={14}/></button>
              <button onClick={() => del(t.id)} className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-500">
                <Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="island text-center py-10">
          <p className="text-gray-400">No transactions for this period</p>
        </div>
      )}

      {form !== null && <TransactionForm editing={form.id ? form : undefined} onClose={() => setForm(null)}/>}
    </div>
  )
}
