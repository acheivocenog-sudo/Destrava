'use client'

import { useState } from 'react'
import Modal from './Modal'
import { Item, Category } from '@/lib/types'
import { useApp } from '@/lib/context'

interface Props {
  item: Item
  onClose: () => void
}

const categories: { value: Category; label: string }[] = [
  { value: 'tarefa', label: 'Tarefa' },
  { value: 'rotina', label: 'Rotina' },
  { value: 'projeto', label: 'Projeto' },
  { value: 'estacionamento', label: 'Estacionamento' },
]

export default function EditItemModal({ item, onClose }: Props) {
  const { updateItem, deleteItem } = useApp()
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [priority, setPriority] = useState(item.priority)
  const [nextAction, setNextAction] = useState(item.nextAction ?? '')
  const [deadline, setDeadline] = useState(item.deadline ?? '')

  const handleSave = () => {
    updateItem(item.id, { name, category, priority, nextAction: nextAction || undefined, deadline: deadline || undefined })
    onClose()
  }

  const handleDelete = () => {
    deleteItem(item.id)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Editar item">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Nome</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  category === c.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Prioridade: <span className="text-indigo-600 font-bold">{priority}</span>
          </label>
          <input
            type="range" min={0} max={10} value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Baixa</span><span>Urgente</span>
          </div>
        </div>

        {(category === 'tarefa' || category === 'projeto') && (
          <>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Próxima ação</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="O que fazer agora?"
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Prazo</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium text-sm"
          >
            Excluir
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}
