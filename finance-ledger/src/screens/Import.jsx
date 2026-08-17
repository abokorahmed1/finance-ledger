import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, Check, AlertTriangle } from 'lucide-react'
import { db } from '../db'
import { parseCSV, mapBankRow, mapInventoryRow } from '../utils/csv'
import { gbp } from '../utils/format'

export default function Import() {
  const [preview, setPreview] = useState(null)
  const [mode, setMode] = useState('transactions') // transactions | inventory
  const [bank, setBank] = useState('auto')
  const [status, setStatus] = useState(null) // null | 'importing' | 'done' | 'error'
  const [count, setCount] = useState(0)

  const handleFile = useCallback(async (file) => {
    try {
      const rows = await parseCSV(file)
      const mapped = mode === 'inventory'
        ? rows.map(mapInventoryRow).filter(r => r.name)
        : rows.map(r => mapBankRow(r, bank))
      setPreview({ fileName: file.name, rows: mapped, raw: rows })
      setStatus(null)
    } catch (e) {
      setStatus('error')
    }
  }, [bank, mode])

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const onSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const doImport = async () => {
    if (!preview) return
    setStatus('importing')
    try {
      if (mode === 'inventory') await db.inventory.bulkAdd(preview.rows)
      else await db.transactions.bulkAdd(preview.rows)
      setCount(preview.rows.length)
      setStatus('done')
      setPreview(null)
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Import</h1>

      {/* What are we importing? */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('transactions'); setPreview(null) }}
                className={`tab ${mode === 'transactions' ? 'tab-on' : 'tab-off'}`}>
          Transactions
        </button>
        <button onClick={() => { setMode('inventory'); setPreview(null) }}
                className={`tab ${mode === 'inventory' ? 'tab-on' : 'tab-off'}`}>
          Inventory
        </button>
      </div>

      {/* Bank selector */}
      <div className={`island ${mode === 'inventory' ? 'hidden' : ''}`}>
        <label className="label">Bank format</label>
        <select className="input max-w-xs" value={bank} onChange={e => setBank(e.target.value)}>
          <option value="auto">Auto-detect</option>
          <option value="Monzo">Monzo</option>
          <option value="Starling">Starling</option>
          <option value="Nationwide">Nationwide</option>
          <option value="Revolut">Revolut</option>
          <option value="HSBC">HSBC</option>
        </select>
      </div>

      {/* Drop zone */}
      <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
           className="island border-2 border-dashed border-navy-600 hover:border-cyan-400/50
                      transition-colors text-center py-12 cursor-pointer"
           onClick={() => document.getElementById('csv-input').click()}>
        <Upload size={32} className="mx-auto text-gray-500 mb-3"/>
        <p className="text-sm text-gray-300">Drop a CSV{mode === 'inventory' ? '' : '/OFX'} file here or click to browse</p>
        <p className="text-xs text-gray-500 mt-1">
          {mode === 'inventory'
            ? 'Columns: name, purchasePrice, listPrice, qty, platform, status, category, notes'
            : 'Supports Monzo, Starling, Nationwide, Revolut exports'}
        </p>
        <input id="csv-input" type="file" accept=".csv,.ofx,.qif" className="hidden" onChange={onSelect}/>
      </div>

      {/* Preview */}
      {preview && (
        <div className="island space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-cyan-400"/>
              <p className="text-sm font-medium">{preview.fileName}</p>
            </div>
            <p className="text-xs text-gray-400">{preview.rows.length} rows</p>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {preview.rows.slice(0, 20).map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-navy-700">
                {mode === 'inventory' ? (
                  <>
                    <span className="text-gray-300 flex-1 truncate pr-2">{r.name}</span>
                    <span className="text-gray-500 w-24 text-right">{r.category}</span>
                    <span className="text-gray-400 w-20 text-right">{gbp(r.listPrice)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 w-16">{r.date}</span>
                    <span className="text-gray-300 flex-1 truncate px-2">{r.description}</span>
                    {r.moneyIn > 0 && <span className="text-ledger-green w-20 text-right">+{gbp(r.moneyIn)}</span>}
                    {r.moneyOut > 0 && <span className="text-ledger-red w-20 text-right">-{gbp(r.moneyOut)}</span>}
                  </>
                )}
              </div>
            ))}
            {preview.rows.length > 20 && (
              <p className="text-xs text-gray-500 text-center pt-1">...and {preview.rows.length - 20} more</p>
            )}
          </div>

          <button className="btn-primary w-full" onClick={doImport}>
            Import {preview.rows.length} {mode === 'inventory' ? 'stock items' : 'transactions'}
          </button>
        </div>
      )}

      {/* Status */}
      {status === 'done' && (
        <div className="island flex items-center gap-2 text-ledger-green">
          <Check size={16}/> Imported {count} {mode === 'inventory' ? 'stock items' : 'transactions'}
        </div>
      )}
      {status === 'error' && (
        <div className="island flex items-center gap-2 text-ledger-red">
          <AlertTriangle size={16}/> Import failed — check the file format
        </div>
      )}

      {/* Future hooks */}
      <div className="island opacity-60">
        <p className="label">Coming soon</p>
        <p className="text-sm text-gray-400">Open Banking sync (TrueLayer / Plaid), eBay sales webhook, Vinted export parser</p>
      </div>
    </div>
  )
}
