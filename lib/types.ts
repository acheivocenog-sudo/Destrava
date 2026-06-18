export type Category = 'rotina' | 'tarefa' | 'projeto' | 'estacionamento'
export type Status = 'ativo' | 'concluido' | 'cancelado'
export type Frequency = 'diaria' | 'semanal' | 'mensal'

export interface Step {
  id: string
  name: string
  completed: boolean
}

export interface Item {
  id: string
  name: string
  category: Category
  priority: number
  status: Status
  createdAt: string
  updatedAt: string
  // Rotina
  frequency?: Frequency
  suggestedTime?: string
  completedToday?: boolean
  // Tarefa
  deadline?: string
  nextAction?: string
  // Projeto
  objective?: string
  steps?: Step[]
  progress?: number
  // Estacionamento
  reason?: string
  reviewDate?: string
}

export interface Renuncio {
  id: string
  name: string
  active: boolean
}

export interface AppState {
  items: Item[]
  renuncias: Renuncio[]
  userName: string | null
}
