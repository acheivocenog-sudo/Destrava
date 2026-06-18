'use client'

import { useState } from 'react'
import { Check, ChevronRight, Trash2, ArrowRight } from 'lucide-react'
import { Item } from '@/lib/types'
import PriorityBadge from './PriorityBadge'
import CategoryBadge from './CategoryBadge'

interface Props {
  item: Item
  onToggle?: () => void
  onDelete?: () => void
  onEdit?: () => void
  showCategory?: boolean
}

export default function ItemCard({ item, onToggle, onDelete, onEdit, showCategory = false }: Props) {
  const [showActions, setShowActions] = useState(false)
  const done = item.status === 'concluido'

  return (
    <div
      className={`bg-white rounded-2xl p-4 card-shadow border border-slate-100 ${done ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {onToggle && (
          <button
            onClick={onToggle}
            className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              done ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
            }`}
          >
            {done && <Check size={12} className="text-white" strokeWidth={3} />}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-slate-800 leading-snug ${done ? 'line-through text-slate-400' : ''}`}>
            {item.name}
          </p>
          {item.nextAction && !done && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <ArrowRight size={12} className="flex-shrink-0" />
              {item.nextAction}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {showCategory && <CategoryBadge category={item.category} />}
            <PriorityBadge value={item.priority} />
            {item.deadline && (
              <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">
                {formatDate(item.deadline)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowActions(v => !v)}
          className="p-1 text-slate-400 flex-shrink-0"
        >
          <ChevronRight size={18} className={`transition-transform ${showActions ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 text-sm text-indigo-600 font-medium py-2 rounded-xl bg-indigo-50"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-1 text-sm text-red-500 font-medium py-2 px-4 rounded-xl bg-red-50"
            >
              <Trash2 size={14} />
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
