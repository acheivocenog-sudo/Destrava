'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase/client'
import { AppState, Item, Renuncio } from './types'
import { generateId, now } from './store'

interface AppContextValue {
  state: AppState
  user: User | null
  loading: boolean
  addItems: (items: Partial<Item>[]) => Promise<void>
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  updateRenuncio: (id: string, active: boolean) => Promise<void>
  addRenuncio: (name: string) => Promise<void>
  deleteRenuncio: (id: string) => Promise<void>
  signOut: () => Promise<void>
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
  const baixa = active.filter(i => i.priority <= 3 && i.category !== 'rotina').sort((a, b) => a.priority - b.priority)

  return {
    importantTask: tarefas[0] ?? null,
    mainTasks: tarefas.slice(1, 4),
    projectAdvance: projetos[0] ?? null,
    essentialRoutine: rotinas[0] ?? null,
    toStation: baixa[0] ?? null,
  }
}

const DEFAULT_RENUNCIAS: Omit<Renuncio, 'id'>[] = [
  { name: 'Redes sociais em excesso', active: true },
  { name: 'Novos compromissos esta semana', active: false },
  { name: 'Projetos paralelos novos', active: true },
  { name: 'WhatsApp fora do horário', active: false },
  { name: 'Conversas improdutivas', active: false },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<AppState>({ items: [], renuncias: [], userName: null })
  const supabase = createClient()

  // Auth listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load data when user changes
  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadData()
  }, [user])

  async function loadData() {
    if (!user) return
    setLoading(true)
    const [{ data: items }, { data: renuncias }] = await Promise.all([
      supabase.from('items').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('renuncias').select('*').eq('user_id', user.id).order('created_at'),
    ])

    // Seed default renuncias for new users
    let finalRenuncias = renuncias ?? []
    if (finalRenuncias.length === 0) {
      const toInsert = DEFAULT_RENUNCIAS.map(r => ({ ...r, id: generateId(), user_id: user.id }))
      const { data: inserted } = await supabase.from('renuncias').insert(toInsert).select()
      finalRenuncias = inserted ?? []
    }

    setState({
      items: (items ?? []).map(dbToItem),
      renuncias: finalRenuncias.map(dbToRenuncio),
      userName: user.user_metadata?.name ?? user.email?.split('@')[0] ?? null,
    })
    setLoading(false)
  }

  const addItems = useCallback(async (partials: Partial<Item>[]) => {
    if (!user) return
    const rows = partials.map(p => ({
      id: generateId(),
      user_id: user.id,
      name: p.name ?? '',
      category: p.category ?? 'tarefa',
      priority: p.priority ?? 5,
      status: 'ativo',
      created_at: now(),
      updated_at: now(),
      frequency: p.frequency ?? null,
      suggested_time: p.suggestedTime ?? null,
      completed_today: false,
      deadline: p.deadline ?? null,
      next_action: p.nextAction ?? null,
      objective: p.objective ?? null,
      steps: p.steps ?? [],
      progress: p.progress ?? 0,
      reason: p.reason ?? null,
      review_date: p.reviewDate ?? null,
    }))
    const { data } = await supabase.from('items').insert(rows).select()
    if (data) {
      setState(prev => ({ ...prev, items: [...prev.items, ...data.map(dbToItem)] }))
    }
  }, [user])

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const dbUpdates: Record<string, unknown> = { updated_at: now() }
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency
    if (updates.suggestedTime !== undefined) dbUpdates.suggested_time = updates.suggestedTime
    if (updates.completedToday !== undefined) dbUpdates.completed_today = updates.completedToday
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline
    if (updates.nextAction !== undefined) dbUpdates.next_action = updates.nextAction
    if (updates.objective !== undefined) dbUpdates.objective = updates.objective
    if (updates.steps !== undefined) dbUpdates.steps = updates.steps
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress
    if (updates.reason !== undefined) dbUpdates.reason = updates.reason
    if (updates.reviewDate !== undefined) dbUpdates.review_date = updates.reviewDate

    await supabase.from('items').update(dbUpdates).eq('id', id)
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, ...updates, updatedAt: now() } : i),
    }))
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
  }, [])

  const toggleComplete = useCallback(async (id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id)
      if (!item) return prev
      const newStatus = item.status === 'concluido' ? 'ativo' : 'concluido'
      supabase.from('items').update({ status: newStatus, updated_at: now() }).eq('id', id)
      return {
        ...prev,
        items: prev.items.map(i => i.id === id ? { ...i, status: newStatus } : i),
      }
    })
  }, [])

  const updateRenuncio = useCallback(async (id: string, active: boolean) => {
    await supabase.from('renuncias').update({ active }).eq('id', id)
    setState(prev => ({
      ...prev,
      renuncias: prev.renuncias.map(r => r.id === id ? { ...r, active } : r),
    }))
  }, [])

  const addRenuncio = useCallback(async (name: string) => {
    if (!user) return
    const row = { id: generateId(), user_id: user.id, name, active: true }
    await supabase.from('renuncias').insert(row)
    setState(prev => ({ ...prev, renuncias: [...prev.renuncias, { id: row.id, name, active: true }] }))
  }, [user])

  const deleteRenuncio = useCallback(async (id: string) => {
    await supabase.from('renuncias').delete().eq('id', id)
    setState(prev => ({ ...prev, renuncias: prev.renuncias.filter(r => r.id !== id) }))
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ items: [], renuncias: [], userName: null })
  }, [])

  return (
    <AppContext.Provider value={{
      state, user, loading,
      addItems, updateItem, deleteItem, toggleComplete,
      updateRenuncio, addRenuncio, deleteRenuncio,
      signOut,
      todayPlan: buildTodayPlan(state.items),
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

// DB → App type mappers
function dbToItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Item['category'],
    priority: row.priority as number,
    status: row.status as Item['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    frequency: row.frequency as Item['frequency'],
    suggestedTime: row.suggested_time as string | undefined,
    completedToday: row.completed_today as boolean | undefined,
    deadline: row.deadline as string | undefined,
    nextAction: row.next_action as string | undefined,
    objective: row.objective as string | undefined,
    steps: (row.steps as Item['steps']) ?? [],
    progress: row.progress as number | undefined,
    reason: row.reason as string | undefined,
    reviewDate: row.review_date as string | undefined,
  }
}

function dbToRenuncio(row: Record<string, unknown>): Renuncio {
  return { id: row.id as string, name: row.name as string, active: row.active as boolean }
}
