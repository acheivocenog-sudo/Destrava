'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '@/lib/context'
import { classifyText } from '@/lib/store'
import { Item, Category } from '@/lib/types'
import CategoryBadge from '@/components/CategoryBadge'
import PriorityBadge from '@/components/PriorityBadge'

type Stage = 'input' | 'review' | 'done'

const categories: { value: Category; label: string }[] = [
  { value: 'rotina', label: 'Rotina' },
  { value: 'tarefa', label: 'Tarefa' },
  { value: 'projeto', label: 'Projeto' },
  { value: 'estacionamento', label: 'Pausa' },
]

export default function CapturarPage() {
  const { addItems } = useApp()
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('input')
  const [text, setText] = useState('')
  const [classified, setClassified] = useState<Partial<Item>[]>([])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const handleClassify = () => {
    const lines = text.split('\n').filter(l => l.trim())
    if (!lines.length) return
    setClassified(classifyText(lines))
    setStage('review')
  }

  const updateItem = (idx: number, updates: Partial<Item>) => {
    setClassified(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item))
  }

  const handleConfirm = () => {
    addItems(classified)
    setStage('done')
  }

  if (stage === 'done') {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
          <Check size={36} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{classified.length} item{classified.length !== 1 ? 's' : ''} organizados</h2>
        <p className="text-slate-500 mt-2">Sua mente está mais leve agora.</p>
        <button
          onClick={() => router.push('/hoje')}
          className="mt-8 w-full max-w-xs py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg"
        >
          Ver plano do dia
        </button>
        <button
          onClick={() => { setText(''); setClassified([]); setStage('input') }}
          className="mt-3 w-full max-w-xs py-3 text-indigo-600 font-medium"
        >
          Capturar mais
        </button>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="px-5 pt-12 pb-4 safe-top">
          <h1 className="text-2xl font-bold text-slate-800">Revisar organização</h1>
          <p className="text-slate-500 text-sm mt-1">Ajuste se precisar, depois confirme.</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32 space-y-3">
          {classified.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{item.name}</p>
                  <div className="flex gap-2 mt-1.5">
                    <CategoryBadge category={item.category ?? 'tarefa'} />
                    <PriorityBadge value={item.priority ?? 5} />
                  </div>
                </div>
                {expandedIdx === idx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expandedIdx === idx && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Categoria</label>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(c => (
                        <button
                          key={c.value}
                          onClick={() => updateItem(idx, { category: c.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            item.category === c.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Prioridade: <strong className="text-indigo-600">{item.priority}</strong>
                    </label>
                    <input
                      type="range" min={0} max={10} value={item.priority ?? 5}
                      onChange={e => updateItem(idx, { priority: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  {item.nextAction && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Próxima ação</label>
                      <input
                        className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={item.nextAction}
                        onChange={e => updateItem(idx, { nextAction: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 safe-bottom">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg"
          >
            Confirmar {classified.length} itens
          </button>
          <button
            onClick={() => setStage('input')}
            className="w-full py-2 text-slate-500 text-sm mt-1"
          >
            Voltar e editar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-5 pt-12 pb-4 safe-top">
        <h1 className="text-2xl font-bold text-slate-800">O que está na sua cabeça?</h1>
        <p className="text-slate-500 text-sm mt-1">Escreva tudo sem filtro. Um item por linha.</p>
      </div>

      <div className="flex-1 px-4 pb-4">
        <textarea
          className="w-full h-full min-h-64 bg-white rounded-2xl border border-slate-200 p-4 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none card-shadow"
          placeholder={`Exemplos:\nMarcar dentista\nExercício todo dia às 7h\nCriar site para o negócio\nAprender violão um dia\nResponder João no WhatsApp`}
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
      </div>

      <div className="px-4 pb-8 safe-bottom">
        <button
          onClick={handleClassify}
          disabled={!text.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Sparkles size={20} />
          Organizar agora
        </button>
      </div>
    </div>
  )
}
