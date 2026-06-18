'use client'

import { useState } from 'react'
import { ParkingSquare, Plus, ArrowRight, Trash2 } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { useApp } from '@/lib/context'
import { Item } from '@/lib/types'

export default function EstacionamentoPage() {
  const { state, addItems, updateItem, deleteItem } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newReason, setNewReason] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)

  const itens = state.items
    .filter(i => i.category === 'estacionamento' && i.status === 'ativo')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAdd = () => {
    if (!newName.trim()) return
    addItems([{
      name: newName,
      category: 'estacionamento',
      priority: 2,
      reason: newReason || 'Não é prioridade agora',
    }])
    setNewName('')
    setNewReason('')
    setShowAdd(false)
  }

  const promoteToProject = (item: Item) => {
    updateItem(item.id, { category: 'projeto', priority: 6, steps: [], progress: 0, nextAction: 'Definir primeiras etapas' })
    setSelected(null)
  }

  const promoteToTask = (item: Item) => {
    updateItem(item.id, { category: 'tarefa', priority: 5, nextAction: 'Separar 15 min para resolver' })
    setSelected(null)
  }

  return (
    <AppShell
      title="Estacionamento"
      rightAction={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      }
    >
      <p className="text-sm text-slate-500 mb-4 mt-1">
        Ideias e desejos que não são prioridade agora. Sem cobranças.
      </p>

      {itens.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ParkingSquare size={28} className="text-violet-500" />
          </div>
          <p className="text-slate-500 mb-4">Nada estacionado por aqui.</p>
          <button onClick={() => setShowAdd(true)} className="text-indigo-600 font-medium">
            + Estacionar uma ideia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {itens.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="w-full bg-white rounded-2xl p-4 card-shadow border border-slate-100 text-left flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <ParkingSquare size={16} className="text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800">{item.name}</p>
                {item.reason && (
                  <p className="text-sm text-slate-400 mt-0.5">{item.reason}</p>
                )}
                {item.reviewDate && (
                  <p className="text-xs text-violet-500 mt-1">Revisar em {formatDate(item.reviewDate)}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-slate-300 mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.name}>
          <div className="space-y-3">
            {selected.reason && (
              <div className="bg-violet-50 rounded-xl p-3">
                <p className="text-xs text-violet-500 font-medium mb-1">Por que está estacionado</p>
                <p className="text-sm text-violet-800">{selected.reason}</p>
              </div>
            )}
            <p className="text-sm text-slate-500 font-medium">O que fazer com isso?</p>
            <button
              onClick={() => promoteToProject(selected)}
              className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              Transformar em Projeto
            </button>
            <button
              onClick={() => promoteToTask(selected)}
              className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              Transformar em Tarefa
            </button>
            <button
              onClick={() => { deleteItem(selected.id); setSelected(null) }}
              className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-medium text-sm flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Excluir definitivamente
            </button>
          </div>
        </Modal>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Estacionar ideia">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Ideia ou desejo</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ex: Aprender violão"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Por que está estacionado?</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Não é prioridade agora"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40"
          >
            Estacionar
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
