'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, CheckSquare, FolderOpen, ParkingSquare } from 'lucide-react'

const tabs = [
  { href: '/hoje', label: 'Hoje', Icon: Home },
  { href: '/tarefas', label: 'Tarefas', Icon: CheckSquare },
  { href: '/capturar', label: '', Icon: Plus, isMain: true },
  { href: '/projetos', label: 'Projetos', Icon: FolderOpen },
  { href: '/estacionamento', label: 'Pausa', Icon: ParkingSquare },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, label, Icon, isMain }) => {
          const active = pathname === href
          if (isMain) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 shadow-lg -mt-5"
                style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
              >
                <Icon size={24} className="text-white" />
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                active ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
