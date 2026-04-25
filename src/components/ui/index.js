'use client'
import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

// ── Badge ─────────────────────────────────────────────────────
const badgeStyles = {
  pendente:    'bg-amber-50 text-amber-700 border border-amber-200',
  contactado:  'bg-blue-50 text-blue-700 border border-blue-200',
  convertido:  'bg-green-50 text-green-700 border border-green-200',
  rejeitado:   'bg-red-50 text-red-700 border border-red-200',
  agendada:    'bg-blue-50 text-blue-700 border border-blue-200',
  realizada:   'bg-green-50 text-green-700 border border-green-200',
  cancelada:   'bg-gray-100 text-gray-500 border border-gray-200',
  falta:       'bg-red-50 text-red-700 border border-red-200',
  pago:        'bg-green-50 text-green-700 border border-green-200',
  reembolsado: 'bg-purple-50 text-purple-700 border border-purple-200',
}

export function Badge({ estado }) {
  return (
    <span className={`badge ${badgeStyles[estado] ?? 'bg-gray-100 text-gray-600'}`}>
      {estado}
    </span>
  )
}

// ── Table ─────────────────────────────────────────────────────
export function Table({ columns, data, onRowClick, onDelete }) {
  const [selectedIds, setSelectedIds] = useState(new Set())

  const toggleRow = (id, e) => {
    e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = (e) => {
    e.stopPropagation()
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      const allIds = new Set(data.map((row, i) => row.id ?? i))
      setSelectedIds(allIds)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || selectedIds.size === 0) return
    await onDelete(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selecionado(s)</span>
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {onDelete && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 cursor-pointer rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => {
              const rowId = row.id ?? i
              const isSelected = selectedIds.has(rowId)
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    isSelected ? 'bg-blue-50' : onDelete ? 'hover:bg-gray-50' : 'hover:bg-gray-50'
                  } ${onRowClick ? 'cursor-pointer' : ''} transition-colors`}
                >
                  {onDelete && (
                    <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleRow(rowId, e)}
                        className="w-4 h-4 cursor-pointer rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
export function Empty({ message = 'Sem registos' }) {
  return (
    <div className="py-16 text-center text-sm text-gray-400">
      {message}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
export function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────
export function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────
export function Select({ value, onChange, options, placeholder = 'Selecionar…', className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`input ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
