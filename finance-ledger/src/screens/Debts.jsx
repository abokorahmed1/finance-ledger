import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronDown, ChevronUp, Banknote } from 'lucide-react'
import { db } from '../db'
import DebtForm from '../components/DebtForm'
import { gbp, shortDate } from '../utils/format'

export default function Debts() {
  const [form, setForm] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [payAmt, setPayAmt] = useState('')
  const debts = useLiveQuery(() => db.debts.toArray()) || []

  const totalOwed = debts.reduce((s, d) => {
    const paid = (d.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    return s + Math.max(0, (d.totalOwed || 0) - paid)
  }, 0)

  const logPayment = async (debt) => {
    const amt = parseFloat(payAmt)
    if (!amt || amt <= 0) return
    const payments = [...(debt.payments || []), {
      date: new Date().toISOString().slice(0, 10),
      amount: amt,
      notes: ''
    }]
    await db.debts.update(debt.id, { payments })
    setPayAmt('')
  }

  const del = async (id) => {
    if (confirm('Delete this debt?')) await db.debts.delete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Debts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Total outstanding: <span className="text-ledger-red font-semibold">{gbp(totalOwed)}</span></p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setForm({})}>
          <Plus size={16}/> Add
        </button>
      </div>

      <div className="space-y-2">
        {debts.map(d => {
          const paid = (d.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
          const remaining = Math.max(0, (d.totalOwed || 0) - paid)
          const pct = d.totalOwed > 0 ? (paid / d.totalOwed) * 100 : 0
          const isOpen = expanded === d.id

          return (
            <div key={d.id} className="island !p-0 overflow-hidden">
              <div className="p-3.5 flex items-center gap-3 cursor-pointer"
                   onClick={() => setExpanded(isOpen ? null : d.id)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.creditor}</p>
                  <p className="text-[11px] text-gray-500">
                    {d.dueDate ? `Due ${shortDate(d.dueDate)}` : 'No due date'}
                    {d.minPayment > 0 && ` · Min ${gbp(d.minPayment)}`}
                  </p>
                  <div className="h-1.5 bg-navy-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-ledger-green rounded-full transition-all"
                         style={{ width: `${Math.min(100, pct)}%` }}/>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ledger-red">{gbp(remaining)}</p>
                  <p className="text-[10px] text-gray-500">{gbp(paid)} paid</p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
              </div>

              {isOpen && (
                <div className="border-t border-navy-600/40 p-3.5 space-y-3">
                  {/* Log payment */}
                  <div className="flex gap-2">
                    <input type="number" step="0.01" placeholder="Amount" className="input flex-1"
                           value={payAmt} onChange={e => setPayAmt(e.target.value)}/>
                    <button className="btn-primary flex items-center gap-1" onClick={() => logPayment(d)}>
                      <Banknote size={14}/> Pay
                    </button>
                  </div>
                  {/* Payment history */}
                  {(d.payments || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="label">Payment history</p>
                      {d.payments.map((p, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-400">
                          <span>{shortDate(p.date)}</span>
                          <span className="text-ledger-green">{gbp(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => del(d.id)}
                          className="text-xs text-gray-500 hover:text-ledger-red flex items-center gap-1">
                    <Trash2 size={12}/> Delete debt
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {debts.length === 0 && (
        <div className="island text-center py-10">
          <p className="text-gray-400">No debts tracked</p>
        </div>
      )}

      {form !== null && <DebtForm editing={form.id ? form : undefined} onClose={() => setForm(null)}/>}
    </div>
  )
}
