'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppShell from '@/components/AppShell'
import ItemCard from '@/components/ItemCard'
import Modal from '@/components/Modal'
import EditItemModal from '@/components/EditItemModal'
import { useApp } from '@/lib/context'
import { Item } from '@/lib/types'

type Filter = 'ativo' | 'concluido'

export default function TarefasPage() {
  const { state, addItems, toggleComplete, deleteItem } = useApp()
  const [filter, setFilter] = useState<Filter>('ativo')
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  const tarefas = state.items
    .filter(i => i.category === 'tarefa' && i.status === filter)
    .sort((a, b) => b.priority - a.priority)

  const handleAdd = () => {
    if (!newName.trim()) return
    addItems([{ name: newName, category: 'tarefa', priority: 5, nextAction: `Separar 15 min para resolver` }])
    setNewName('')
    setShowAdd(false)
  }

  return (
    <AppShell
      title="Tarefas"
      rightAction={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      }
    >
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 mt-1">
        {(['ativo', 'concluido'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {f === 'ativo' ? 'Pendentes' : 'Concluídas'}
          </button>
        ))}
      </div>

      {tarefas.length === 0 ? (
        <EmptyState type={filter} onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="space-y-3">
          {tarefas.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onToggle={() => toggleComplete(item.id)}
              onEdit={() => setEditItem(item)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova tarefa">
        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Qual é a tarefa?"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}

function EmptyState({ type, onAdd }: { type: Filter; onAdd: () => void }) {
  if (type === 'concluido') {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Nenhuma tarefa concluída ainda.</p>
      </div>
    )
  }
  return (
    <div className="text-center py-16">
      <p className="text-slate-500 mb-4">Sem tarefas pendentes.</p>
      <button onClick={onAdd} className="text-indigo-600 font-medium">
        + Adicionar tarefa
      </button>
    </div>
  )
}
