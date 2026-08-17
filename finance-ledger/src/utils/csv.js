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

const platforms = ['eBay', 'Vinted', 'Facebook', 'In-Person', 'Other']
const statuses = ['InStock', 'Listed', 'Sold']

// Map an inventory CSV row to our schema. One row = one unit unless qty says otherwise.
export function mapInventoryRow(row) {
  const pick = (...keys) => {
    for (const k of keys) if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k]
    return ''
  }
  const platform = String(pick('platform', 'Platform') || 'eBay')
  const status = String(pick('status', 'Status') || 'InStock')
  return {
    name: String(pick('name', 'Name', 'Item', 'item') || '').trim(),
    purchasePrice: parseFloat(pick('purchasePrice', 'Cost', 'cost')) || 0,
    listPrice: parseFloat(pick('listPrice', 'List', 'list', 'Price', 'price')) || 0,
    qty: parseInt(pick('qty', 'Qty', 'Quantity')) || 1,
    platform: platforms.includes(platform) ? platform : 'Other',
    status: statuses.includes(status) ? status : 'InStock',
    category: String(pick('category', 'Category') || '').trim(),
    notes: String(pick('notes', 'Notes') || '').trim(),
    createdAt: String(pick('createdAt', 'Date', 'date') || new Date().toISOString().slice(0, 10)).slice(0, 10)
  }
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
