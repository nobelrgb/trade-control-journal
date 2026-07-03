import { Trade } from './types'

const HEADERS = [
  'id', 'date', 'time', 'symbol', 'type', 'pnl', 'risk',
  'plannedRR', 'actualRR', 'status', 'entryReason',
  'followedRules', 'touchedAfterEntry', 'notes', 'createdAt',
]

export function exportToCSV(trades: Trade[]): void {
  const rows = [
    HEADERS.join(','),
    ...trades.map(t =>
      HEADERS.map(h => {
        const val = (t as unknown as Record<string, unknown>)[h]
        const str = val === null || val === undefined ? '' : String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ]

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `trade-journal-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function importFromCSV(file: File): Promise<Trade[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'))
          return
        }

        const headers = parseCSVRow(lines[0])
        const trades: Trade[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVRow(lines[i])
          if (values.length < headers.length) continue

          const obj: Record<string, unknown> = {}
          headers.forEach((h, idx) => {
            obj[h] = values[idx]
          })

          trades.push({
            id: String(obj.id || crypto.randomUUID()),
            date: String(obj.date || ''),
            time: String(obj.time || ''),
            symbol: String(obj.symbol || ''),
            type: (obj.type === 'Short' ? 'Short' : 'Long') as 'Long' | 'Short',
            pnl: parseFloat(String(obj.pnl)) || 0,
            risk: parseFloat(String(obj.risk)) || 0,
            plannedRR: parseFloat(String(obj.plannedRR)) || 0,
            actualRR: parseFloat(String(obj.actualRR)) || 0,
            status: (['Win', 'Loss', 'Break Even'].includes(String(obj.status))
              ? obj.status
              : 'Loss') as Trade['status'],
            entryReason: String(obj.entryReason || ''),
            followedRules: String(obj.followedRules) === 'true',
            touchedAfterEntry: String(obj.touchedAfterEntry) === 'true',
            notes: String(obj.notes || ''),
            createdAt: String(obj.createdAt || new Date().toISOString()),
          })
        }

        resolve(trades)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function parseCSVRow(row: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
