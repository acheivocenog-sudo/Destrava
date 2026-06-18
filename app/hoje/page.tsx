'use client'

import { useState } from 'react'
import { Check, Star, Zap, RefreshCw, ParkingSquare } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { useApp } from '@/lib/context'
import { Item } from '@/lib/types'
import EditItemModal from '@/components/EditItemModal'

export default function HojePage() {
  const { state, todayPlan, toggleComplete } = useApp()
  const [editItem, setEditItem] = useState<Item | null>(null)

  const { importantTask, mainTasks, projectAdvance, essentialRoutine, toStation } = todayPlan
  const activeCount = state.items.filter(i => i.status === 'ativo').length
  const doneToday = state.items.filter(i => i.status === 'concluido').length

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="pt-12 pb-6 safe-top">
        <p className="text-slate-500 text-sm">{greeting()}{state.userName ? `, ${state.userName}` : ''}</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Plano de Hoje</h1>
        {activeCount > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (doneToday / (doneToday + activeCount)) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{doneToday}/{doneToday + activeCount}</span>
          </div>
        )}
      </div>

      {activeCount === 0 && doneToday === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {importantTask && (
            <Section icon={<Zap size={16} className="text-red-500" />} title="Tarefa importante">
              <PlanCard item={importantTask} onToggle={() => toggleComplete(importantTask.id)} onEdit={() => setEditItem(importantTask)} />
            </Section>
          )}

          {mainTasks.length > 0 && (
            <Section icon={<Star size={16} className="text-amber-500" />} title="Tarefas do dia">
              <div className="space-y-2">
                {mainTasks.map(t => (
                  <PlanCard key={t.id} item={t} onToggle={() => toggleComplete(t.id)} onEdit={() => setEditItem(t)} />
                ))}
              </div>
            </Section>
          )}

          {projectAdvance && (
            <Section icon={<RefreshCw size={16} className="text-indigo-500" />} title="Avanço em projeto">
              <PlanCard item={projectAdvance} onToggle={() => toggleComplete(projectAdvance.id)} onEdit={() => setEditItem(projectAdvance)} />
            </Section>
          )}

          {essentialRoutine && (
            <Section icon={<Check size={16} className="text-emerald-500" />} title="Rotina essencial">
              <PlanCard item={essentialRoutine} onToggle={() => toggleComplete(essentialRoutine.id)} onEdit={() => setEditItem(essentialRoutine)} />
            </Section>
          )}

          {toStation && (
            <Section icon={<ParkingSquare size={16} className="text-violet-500" />} title="Estacionar ou cancelar">
              <PlanCard item={toStation} onToggle={() => toggleComplete(toStation.id)} onEdit={() => setEditItem(toStation)} />
            </Section>
          )}
        </div>
      )}

      {editItem && (
        <EditItemModal item={editItem} onClose={() => setEditItem(null)} />
      )}
    </AppShell>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        {icon}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  )
}

function PlanCard({ item, onToggle, onEdit }: { item: Item; onToggle: () => void; onEdit: () => void }) {
  const done = item.status === 'concluido'
  return (
    <div className={`bg-white rounded-2xl p-4 card-shadow border border-slate-100 flex items-center gap-3 ${done ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          done ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
        }`}
      >
        {done && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0" onClick={onEdit}>
        <p className={`font-medium text-slate-800 ${done ? 'line-through text-slate-400' : ''}`}>
          {item.name}
        </p>
        {item.nextAction && !done && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{item.nextAction}</p>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <Zap size={28} className="text-indigo-500" />
      </div>
      <h2 className="text-lg font-semibold text-slate-700">Tudo limpo!</h2>
      <p className="text-slate-500 mt-2 max-w-xs">
        Toque em <strong>+</strong> para capturar o que está na sua cabeça.
      </p>
    </div>
  )
}
