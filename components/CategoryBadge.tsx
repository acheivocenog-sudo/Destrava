import { Category } from '@/lib/types'

const config: Record<Category, { label: string; className: string }> = {
  rotina: { label: 'Rotina', className: 'bg-cyan-100 text-cyan-700' },
  tarefa: { label: 'Tarefa', className: 'bg-emerald-100 text-emerald-700' },
  projeto: { label: 'Projeto', className: 'bg-amber-100 text-amber-700' },
  estacionamento: { label: 'Pausa', className: 'bg-violet-100 text-violet-700' },
}

export default function CategoryBadge({ category }: { category: Category }) {
  const { label, className } = config[category]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}
