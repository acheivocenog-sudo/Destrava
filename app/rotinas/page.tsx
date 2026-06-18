'use client'

import { useState } from 'react'
import { Plus, Check, RefreshCw } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import EditItemModal from '@/components/EditItemModal'
import { useApp } from '@/lib/context'
import { Item, Frequency } from '@/lib/types'

const freqLabel: Record<Frequency, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
}

const freqOptions: { value: Frequency; label: string }[] = [
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
]

export default function RotinasPage() {
  const { state, addItems, updateItem, deleteItem } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<Frequency>('diaria')
  const [newTime, setNewTime] = useState('')

  const rotinas = state.items
    .filter(i => i.category === 'rotina' && i.status !== 'cancelado')
    .sort((a, b) => b.priority - a.priority)

  const handleAdd = () => {
    if (!newName.trim()) return
    addItems([{
      name: newName,
      category: 'rotina',
      priority: 6,
      frequency: newFreq,
      suggestedTime: newTime || undefined,
      completedToday: false,
    }])
    setNewName('')
    setNewTime('')
    setShowAdd(false)
  }

  const toggleToday = (item: Item) => {
    updateItem(item.id, { completedToday: !item.completedToday })
  }

  const completedCount = rotinas.filter(r => r.completedToday).length

  return (
    <AppShell
      title="Rotinas"
      rightAction={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      }
    >
      {rotinas.length > 0 && (
        <div className="bg-white rounded-2xl p-4 card-shadow border border-slate-100 mb-4 mt-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
            <RefreshCw size={18} className="text-cyan-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{completedCount}/{rotinas.length} hoje</p>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${rotinas.length ? (completedCount / rotinas.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {rotinas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">Nenhuma rotina cadastrada.</p>
          <button onClick={() => setShowAdd(true)} className="text-indigo-600 font-medium">
            + Criar rotina
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rotinas.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 card-shadow border border-slate-100 flex items-center gap-3 ${
                item.completedToday ? 'opacity-70' : ''
              }`}
            >
              <button
                onClick={() => toggleToday(item)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.completedToday ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300'
                }`}
              >
                {item.completedToday && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0" onClick={() => setEditItem(item)}>
                <p className={`font-medium text-slate-800 ${item.completedToday ? 'line-through text-slate-400' : ''}`}>
                  {item.name}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-medium">
                    {freqLabel[item.frequency ?? 'diaria']}
                  </span>
                  {item.suggestedTime && (
                    <span className="text-xs text-slate-400">{item.suggestedTime}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-300 hover:text-red-400 p-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova rotina">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Nome da rotina</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ex: Exercício físico"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Frequência</label>
            <div className="flex gap-2">
              {freqOptions.map(f => (
                <button
                  key={f.value}
                  onClick={() => setNewFreq(f.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    newFreq === f.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Horário sugerido (opcional)</label>
            <input
              type="time"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40"
          >
            Criar rotina
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}
