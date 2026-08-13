import { useState } from 'react'
import Nav from './components/Nav'
import Dashboard from './screens/Dashboard'
import Ledger from './screens/Ledger'
import Inventory from './screens/Inventory'
import Debts from './screens/Debts'
import Import from './screens/Import'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [quarter, setQuarter] = useState('ALL')

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <Nav active={tab} onChange={setTab} />
      <div className="md:ml-56 p-4 pb-24 md:pb-6 max-w-4xl">
        {tab === 'dashboard' && <Dashboard quarter={quarter} setQuarter={setQuarter} />}
        {tab === 'ledger' && <Ledger quarter={quarter} setQuarter={setQuarter} />}
        {tab === 'inventory' && <Inventory />}
        {tab === 'debts' && <Debts />}
        {tab === 'import' && <Import />}
      </div>
    </div>
  )
}
