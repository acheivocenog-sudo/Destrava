'use client'

import { useState } from 'react'
import { Plus, ChevronRight, Check } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import EditItemModal from '@/components/EditItemModal'
import PriorityBadge from '@/components/PriorityBadge'
import { useApp } from '@/lib/context'
import { Item, Step } from '@/lib/types'
import { generateId, now } from '@/lib/store'

export default function ProjetosPage() {
  const { state, addItems, updateItem, deleteItem } = useApp()
  const [selected, setSelected] = useState<Item | null>(null)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newStep, setNewStep] = useState('')

  const projetos = state.items
    .filter(i => i.category === 'projeto' && i.status !== 'cancelado')
    .sort((a, b) => b.priority - a.priority)

  const handleAdd = () => {
    if (!newName.trim()) return
    addItems([{
      name: newName,
      category: 'projeto',
      priority: 7,
      steps: [],
      progress: 0,
      nextAction: 'Definir as primeiras 3 etapas',
    }])
    setNewName('')
    setShowAdd(false)
  }

  const addStep = (project: Item) => {
    if (!newStep.trim()) return
    const steps = [...(project.steps ?? []), { id: generateId(), name: newStep, completed: false }]
    const progress = calcProgress(steps)
    updateItem(project.id, { steps, progress, updatedAt: now() })
    setNewStep('')
    setSelected(prev => prev ? { ...prev, steps, progress } : null)
  }

  const toggleStep = (project: Item, stepId: string) => {
    const steps = (project.steps ?? []).map(s =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    )
    const progress = calcProgress(steps)
    updateItem(project.id, { steps, progress })
    setSelected(prev => prev ? { ...prev, steps, progress } : null)
  }

  return (
    <AppShell
      title="Projetos"
      rightAction={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      }
    >
      {projetos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">Nenhum projeto ainda.</p>
          <button onClick={() => setShowAdd(true)} className="text-indigo-600 font-medium">
            + Criar projeto
          </button>
        </div>
      ) : (
        <div className="space-y-3 mt-1">
          {projetos.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="w-full bg-white rounded-2xl p-4 card-shadow border border-slate-100 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  {p.objective && <p className="text-sm text-slate-500 mt-0.5">{p.objective}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <PriorityBadge value={p.priority} />
                    {p.deadline && (
                      <span className="text-xs text-slate-400">até {formatDate(p.deadline)}</span>
                    )}
                  </div>
                  {(p.steps?.length ?? 0) > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{p.steps!.filter(s => s.completed).length}/{p.steps!.length} etapas</span>
                        <span>{p.progress ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${p.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-300 mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Project detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.name}>
          <div className="space-y-4">
            {selected.nextAction && (
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-medium text-indigo-500 mb-1">Próxima ação</p>
                <p className="text-sm text-indigo-800">{selected.nextAction}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Etapas</p>
              <div className="space-y-2">
                {(selected.steps ?? []).map(step => (
                  <button
                    key={step.id}
                    onClick={() => toggleStep(selected, step.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 text-left"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                    }`}>
                      {step.completed && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm ${step.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {step.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Nova etapa..."
                  value={newStep}
                  onChange={e => setNewStep(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addStep(selected)}
                />
                <button
                  onClick={() => addStep(selected)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { deleteItem(selected.id); setSelected(null) }}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium"
              >
                Excluir
              </button>
              <button
                onClick={() => { setEditItem(selected); setSelected(null) }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                Editar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Novo projeto">
        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Nome do projeto"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40"
          >
            Criar projeto
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}

function calcProgress(steps: Step[]): number {
  if (!steps.length) return 0
  return Math.round((steps.filter(s => s.completed).length / steps.length) * 100)
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
