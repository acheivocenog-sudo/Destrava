interface Props { value: number; className?: string }

export default function PriorityBadge({ value, className = '' }: Props) {
  const color =
    value >= 9 ? 'bg-red-100 text-red-700' :
    value >= 7 ? 'bg-orange-100 text-orange-700' :
    value >= 4 ? 'bg-yellow-100 text-yellow-700' :
    'bg-slate-100 text-slate-500'

  const label =
    value >= 9 ? 'Urgente' :
    value >= 7 ? 'Alta' :
    value >= 4 ? 'Média' : 'Baixa'

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color} ${className}`}>
      {label} {value}
    </span>
  )
}
