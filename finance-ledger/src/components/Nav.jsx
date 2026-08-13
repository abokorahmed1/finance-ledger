import { LayoutDashboard, BookOpen, Package, CreditCard, Upload, Wallet } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ledger', label: 'Ledger', icon: BookOpen },
  { id: 'inventory', label: 'Stock', icon: Package },
  { id: 'debts', label: 'Debts', icon: CreditCard },
  { id: 'import', label: 'Import', icon: Upload },
]

export default function Nav({ active, onChange }) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-navy-800/95
                       border-r border-navy-600/40 flex-col py-6 px-3 z-50">
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <Wallet size={22} className="text-cyan-400"/>
          <span className="text-base font-bold tracking-tight">Finance Ledger</span>
        </div>
        <div className="space-y-1">
          {tabs.map(t => {
            const Icon = t.icon
            const on = active === t.id
            return (
              <button key={t.id} onClick={() => onChange(t.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                                  transition-colors text-sm font-medium
                                  ${on ? 'bg-cyan-400/10 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
                <Icon size={18} strokeWidth={on ? 2.2 : 1.6}/>
                {t.label}
              </button>
            )
          })}
        </div>
        <p className="mt-auto px-3 text-[10px] text-gray-600">All data stored locally</p>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0
                       bg-navy-800/95 backdrop-blur border-t border-navy-600/40
                       flex justify-around py-2 px-1 z-50">
        {tabs.map(t => {
          const Icon = t.icon
          const on = active === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg
                                transition-colors text-[10px] font-semibold tracking-wide
                                ${on ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon size={20} strokeWidth={on ? 2.2 : 1.6}/>
              {t.label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
