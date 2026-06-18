import { Item, Renuncio, AppState } from './types'

const STORAGE_KEY = 'destrava_state'

const defaultRenuncias: Renuncio[] = [
  { id: '1', name: 'Redes sociais em excesso', active: true },
  { id: '2', name: 'Novos compromissos esta semana', active: false },
  { id: '3', name: 'Projetos paralelos novos', active: true },
  { id: '4', name: 'WhatsApp fora do horário', active: false },
  { id: '5', name: 'Conversas improdutivas', active: false },
]

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { items: [], renuncias: defaultRenuncias, userName: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], renuncias: defaultRenuncias, userName: null }
    return JSON.parse(raw)
  } catch {
    return { items: [], renuncias: defaultRenuncias, userName: null }
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function now(): string {
  return new Date().toISOString()
}

// Heuristic classifier
export function classifyText(lines: string[]): Partial<Item>[] {
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const lower = line.toLowerCase()
      let category: Item['category'] = 'tarefa'
      let priority = 5

      // Estacionamento
      if (/um dia|futuramente|talvez|quero (aprender|fazer|criar|comprar|viajar)|sonho|ideia de|quando eu|no futuro/i.test(lower)) {
        category = 'estacionamento'
        priority = 2
      }
      // Rotina
      else if (/todo dia|todos os dias|diariamente|cada (manhã|tarde|noite|semana)|exercício|academia|estudar \d|acordar|dormir|devocional|meditar|leitura diária|revisar|planejar o dia/i.test(lower)) {
        category = 'rotina'
        priority = 6
      }
      // Projeto
      else if (/criar (um|uma|o|a)|montar|lançar|desenvolver|construir|estruturar|campanha|site|aplicativo|app|empresa|produto|reforma|viagem (para|em)/i.test(lower)) {
        category = 'projeto'
        priority = 7
      }

      // Priority bumps
      if (/urgente|hoje|agora|atrasado|prazo|vencendo/i.test(lower)) priority = 9
      else if (/amanhã|esta semana|semana que vem/i.test(lower)) priority = 7
      else if (category === 'estacionamento') priority = 2

      const nextAction = category === 'tarefa' || category === 'projeto'
        ? suggestNextAction(line, category)
        : undefined

      const deadline = category === 'tarefa' || category === 'projeto'
        ? suggestDeadline(lower, priority)
        : undefined

      return { name: line, category, priority, nextAction, deadline }
    })
}

function suggestNextAction(name: string, category: Item['category']): string {
  if (category === 'tarefa') {
    if (/marcar|agendar/i.test(name)) return `Pegar o telefone e ligar agora`
    if (/pagar|conta/i.test(name)) return `Abrir o app do banco e pagar`
    if (/responder|enviar|mandar/i.test(name)) return `Abrir a mensagem e responder agora`
    if (/comprar/i.test(name)) return `Pesquisar preço e adicionar ao carrinho`
    return `Separar 15 minutos para resolver`
  }
  return `Definir as primeiras 3 etapas do projeto`
}

function suggestDeadline(lower: string, priority: number): string {
  const d = new Date()
  if (priority >= 9 || /hoje/i.test(lower)) {
    return d.toISOString().split('T')[0]
  }
  if (priority >= 7 || /amanhã/i.test(lower)) {
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }
  if (/esta semana/i.test(lower)) {
    d.setDate(d.getDate() + 5)
    return d.toISOString().split('T')[0]
  }
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}
