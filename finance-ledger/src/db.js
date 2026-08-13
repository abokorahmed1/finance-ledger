import Dexie from 'dexie'

export const db = new Dexie('FinanceLedger')

db.version(1).stores({
  transactions: '++id, date, bank, category, type, phase',
  inventory:    '++id, name, platform, status, createdAt',
  sales:        '++id, inventoryId, date, platform',
  debts:        '++id, creditor, createdAt'
})

/* ── Schema reference ──
  transactions: {
    id, date, bank, description, moneyIn, moneyOut,
    category, type (Income|Expense|Transfer|DebtPaydown),
    phase (Employed|SelfEmployed), internal (bool), notes
  }
  inventory: {
    id, name, purchasePrice, listPrice, qty, platform,
    status (InStock|Listed|Sold), createdAt, notes
  }
  sales: {
    id, inventoryId, date, salePrice, platformFees,
    netProfit, platform, buyer, notes
  }
  debts: {
    id, creditor, totalOwed, minPayment, dueDate,
    createdAt, notes, payments: [{date, amount, notes}]
  }
*/
