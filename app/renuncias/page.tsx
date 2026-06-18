'use client'

import { useState } from 'react'
import { Shield, Plus, Check } from 'lucide-react'
import AppShell from '@/components/AppShell'
import Modal from '@/components/Modal'
import { useApp } from '@/lib/context'

export default function RenunciasPage() {
  const { state, updateRenuncio, addRenuncio, deleteRenuncio } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    addRenuncio(newName)
    setNewName('')
    setShowAdd(false)
  }

  const activeCount = state.renuncias.filter(r => r.active).length

  return (
    <AppShell
      title="Renúncias"
      rightAction={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      }
    >
      <div className="bg-amber-50 rounded-2xl p-4 mb-4 mt-1 border border-amber-100">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-amber-600" />
          <p className="text-sm font-semibold text-amber-700">{activeCount} renúncia{activeCount !== 1 ? 's' : ''} ativas</p>
        </div>
        <p className="text-xs text-amber-600">
          Estas são as coisas que você está evitando para manter o foco.
        </p>
      </div>

      <div className="space-y-2">
        {state.renuncias.map(r => (
          <div
            key={r.id}
            className={`bg-white rounded-2xl p-4 card-shadow border border-slate-100 flex items-center gap-3 ${
              r.active ? '' : 'opacity-50'
            }`}
          >
            <button
              onClick={() => updateRenuncio(r.id, !r.active)}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                r.active ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
              }`}
            >
              {r.active && <Check size={12} className="text-white" strokeWidth={3} />}
            </button>
            <p className={`flex-1 font-medium ${r.active ? 'text-slate-800' : 'text-slate-400'}`}>
              {r.name}
            </p>
            <button
              onClick={() => deleteRenuncio(r.id)}
              className="text-slate-300 hover:text-red-400 p-1 text-lg"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova renúncia">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">O que você precisa evitar para manter o foco?</p>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Ex: Redes sociais de manhã"
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
