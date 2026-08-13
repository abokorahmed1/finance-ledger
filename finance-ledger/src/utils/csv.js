import Papa from 'papaparse'

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (r) => resolve(r.data),
      error: (e) => reject(e)
    })
  })
}

// Map common UK bank CSV columns to our schema
export function mapBankRow(row, bank = 'auto') {
  // Monzo format
  if ('Amount' in row && 'Name' in row) {
    const amt = parseFloat(row.Amount) || 0
    return {
      date: row.Date?.slice(0, 10) || '',
      bank: 'Monzo',
      description: row.Name || row.Description || '',
      moneyIn: amt > 0 ? amt : 0,
      moneyOut: amt < 0 ? Math.abs(amt) : 0,
      category: row.Category || 'Uncategorised',
      type: amt > 0 ? 'Income' : 'Expense',
      phase: 'SelfEmployed',
      internal: false,
      notes: row.Notes || ''
    }
  }
  // Starling / generic: Date, Description, Amount or Credit/Debit
  const credit = parseFloat(row.Credit || row['Money In'] || row.Amount || 0)
  const debit = parseFloat(row.Debit || row['Money Out'] || 0)
  const amt2 = credit > 0 ? credit : 0
  const out2 = debit > 0 ? debit : (credit < 0 ? Math.abs(credit) : 0)
  return {
    date: row.Date?.slice(0, 10) || '',
    bank: bank !== 'auto' ? bank : 'Import',
    description: row.Description || row.Reference || '',
    moneyIn: amt2,
    moneyOut: out2,
    category: 'Uncategorised',
    type: amt2 > 0 ? 'Income' : 'Expense',
    phase: 'SelfEmployed',
    internal: false,
    notes: ''
  }
}
