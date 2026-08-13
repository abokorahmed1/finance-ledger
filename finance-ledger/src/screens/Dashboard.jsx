import { useLiveQuery } from 'dexie-react-hooks'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Scale, Wallet } from 'lucide-react'
import { db } from '../db'
import Island from '../components/Island'
import QuarterFilter from '../components/QuarterFilter'
import { gbp } from '../utils/format'
import { getTaxYear, getTaxYearLabel, filterByQuarter } from '../utils/tax'

export default function Dashboard({ quarter, setQuarter }) {
  const txns = useLiveQuery(() => db.transactions.toArray()) || []
  const inventory = useLiveQuery(() => db.inventory.toArray()) || []
  const debts = useLiveQuery(() => db.debts.toArray()) || []

  const taxYear = getTaxYear()
  const filtered = filterByQuarter(
    txns.filter(t => !t.internal), taxYear, quarter
  )

  const totalIn = filtered.reduce((s, t) => s + (t.moneyIn || 0), 0)
  const totalOut = filtered.reduce((s, t) => s + (t.moneyOut || 0), 0)
  const net = totalIn - totalOut

  const stockValue = inventory.reduce((s, i) =>
    i.status !== 'Sold' ? s + (i.listPrice || 0) * (i.qty || 1) : s, 0)
  const totalDebt = debts.reduce((s, d) => {
    const paid = (d.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
    return s + ((d.totalOwed || 0) - paid)
  }, 0)

  // Monthly breakdown for chart
  const monthLabels = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
  const monthly = monthLabels.map((m, i) => {
    const monthNum = ((i + 3) % 12) + 1
    const yr = i < 9 ? taxYear : taxYear + 1
    const mTxns = filtered.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() + 1 === monthNum && d.getFullYear() === yr
    })
    return {
      name: m,
      income: mTxns.reduce((s, t) => s + (t.moneyIn || 0), 0),
      expense: mTxns.reduce((s, t) => s + (t.moneyOut || 0), 0)
    }
  }).filter(m => m.income > 0 || m.expense > 0)

  // Category breakdown
  const byCat = {}
  filtered.filter(t => t.moneyOut > 0).forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + t.moneyOut
  })
  const topCats = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tax year {getTaxYearLabel(taxYear)}</h1>
          <p className="text-xs text-gray-500 mt-0.5">All data stored locally on this device</p>
        </div>
        <QuarterFilter active={quarter} onChange={setQuarter} />
      </div>

      {/* KPI Islands */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Island label="Total earned" value={gbp(totalIn)} color="ledger-green"
                icon={<TrendingUp size={16}/>} sub={`${filtered.filter(t=>t.moneyIn>0).length} inflows`}/>
        <Island label="Total spent" value={gbp(totalOut)} color="ledger-red"
                icon={<TrendingDown size={16}/>} sub={`${filtered.filter(t=>t.moneyOut>0).length} outflows`}/>
        <Island label="Net position" value={gbp(net)} color={net >= 0 ? 'cyan-400' : 'ledger-red'}
                icon={<Wallet size={16}/>}/>
        <Island label="Stock + debt" value={gbp(stockValue)} color="ledger-amber"
                icon={<Scale size={16}/>} sub={totalDebt > 0 ? `${gbp(totalDebt)} owed` : 'No debts'}/>
      </div>

      {/* Chart + categories row */}
      <div className="grid md:grid-cols-2 gap-4">

      {/* Monthly chart */}
      {monthly.length > 0 && (
        <div className="island">
          <p className="label mb-3">Monthly income vs spending</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
                     tickFormatter={v => `£${(v/1000).toFixed(v >= 1000 ? 1 : 0)}k`}/>
              <Tooltip contentStyle={{ background: '#0f1f38', border: '1px solid #1e3a5f', borderRadius: 12, fontSize: 13 }}
                       formatter={v => gbp(v)}/>
              <Bar dataKey="income" radius={[4,4,0,0]} fill="#22c55e"/>
              <Bar dataKey="expense" radius={[4,4,0,0]} fill="#ef4444"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top categories */}
      {topCats.length > 0 && (
        <div className="island">
          <p className="label mb-3">Top spending categories</p>
          <div className="space-y-2">
            {topCats.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-gray-400">{gbp(amt)}</span>
                  </div>
                  <div className="h-1.5 bg-navy-900 rounded-full overflow-hidden">
                    <div className="h-full bg-ledger-red/60 rounded-full"
                         style={{ width: `${(amt / topCats[0][1]) * 100}%` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>{/* close chart+categories grid */}

      {filtered.length === 0 && (
        <div className="island text-center py-10">
          <p className="text-gray-400">No transactions yet</p>
          <p className="text-xs text-gray-500 mt-1">Add manually via the Ledger tab or import a CSV</p>
        </div>
      )}
    </div>
  )
}
