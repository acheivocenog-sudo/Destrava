'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { AppState, Item, Renuncio } from './types'
import { loadState, saveState, generateId, now } from './store'

interface AppContextValue {
  state: AppState
  addItems: (items: Partial<Item>[]) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  toggleComplete: (id: string) => void
  setUserName: (name: string) => void
  updateRenuncio: (id: string, active: boolean) => void
  addRenuncio: (name: string) => void
  deleteRenuncio: (id: string) => void
  todayPlan: TodayPlan
}

export interface TodayPlan {
  importantTask: Item | null
  mainTasks: Item[]
  projectAdvance: Item | null
  essentialRoutine: Item | null
  toStation: Item | null
}

const AppContext = createContext<AppContextValue | null>(null)

function buildTodayPlan(items: Item[]): TodayPlan {
  const active = items.filter(i => i.status === 'ativo')
  const tarefas = active.filter(i => i.category === 'tarefa').sort((a, b) => b.priority - a.priority)
  const projetos = active.filter(i => i.category === 'projeto').sort((a, b) => b.priority - a.priority)
  const rotinas = active.filter(i => i.category === 'rotina')
  const baixaPrioridade = active.filter(i => i.priority <= 3 && i.category !== 'rotina').sort((a, b) => a.priority - b.priority)

  return {
    importantTask: tarefas[0] ?? null,
    mainTasks: tarefas.slice(1, 4),
    projectAdvance: projetos[0] ?? null,
    essentialRoutine: rotinas[0] ?? null,
    toStation: baixaPrioridade[0] ?? null,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ items: [], renuncias: [], userName: null })

  useEffect(() => {
    setState(loadState())
  }, [])

  const persist = useCallback((next: AppState) => {
    setState(next)
    saveState(next)
  }, [])

  const addItems = useCallback((partials: Partial<Item>[]) => {
    setState(prev => {
      const newItems: Item[] = partials.map(p => ({
        id: generateId(),
        name: p.name ?? '',
        category: p.category ?? 'tarefa',
        priority: p.priority ?? 5,
        status: 'ativo',
        createdAt: now(),
        updatedAt: now(),
        ...p,
      }))
      const next = { ...prev, items: [...prev.items, ...newItems] }
      saveState(next)
      return next
    })
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setState(prev => {
      const next = {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, ...updates, updatedAt: now() } : i),
      }
      saveState(next)
      return next
    })
  }, [])

  const deleteItem = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, items: prev.items.filter(i => i.id !== id) }
      saveState(next)
      return next
    })
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setState(prev => {
      const next = {
        ...prev,
        items: prev.items.map(i =>
          i.id === id
            ? { ...i, status: (i.status === 'concluido' ? 'ativo' : 'concluido') as import('./types').Status, updatedAt: now() }
            : i
        ),
      }
      saveState(next)
      return next
    })
  }, [])

  const setUserName = useCallback((name: string) => {
    setState(prev => {
      const next = { ...prev, userName: name }
      saveState(next)
      return next
    })
  }, [])

  const updateRenuncio = useCallback((id: string, active: boolean) => {
    setState(prev => {
      const next = {
        ...prev,
        renuncias: prev.renuncias.map(r => r.id === id ? { ...r, active } : r),
      }
      saveState(next)
      return next
    })
  }, [])

  const addRenuncio = useCallback((name: string) => {
    setState(prev => {
      const next = {
        ...prev,
        renuncias: [...prev.renuncias, { id: generateId(), name, active: true }],
      }
      saveState(next)
      return next
    })
  }, [])

  const deleteRenuncio = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, renuncias: prev.renuncias.filter(r => r.id !== id) }
      saveState(next)
      return next
    })
  }, [])

  const todayPlan = buildTodayPlan(state.items)

  return (
    <AppContext.Provider value={{
      state, addItems, updateItem, deleteItem, toggleComplete,
      setUserName, updateRenuncio, addRenuncio, deleteRenuncio, todayPlan,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
