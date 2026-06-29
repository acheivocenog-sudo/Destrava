'use client'

import { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import BottomNav from './BottomNav'
import { useApp } from '@/lib/context'

interface Props {
  children: ReactNode
  title?: string
  rightAction?: ReactNode
  showLogout?: boolean
}

export default function AppShell({ children, title, rightAction, showLogout }: Props) {
  const { signOut, state } = useApp()

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {title && (
        <header className="flex items-center justify-between px-5 pt-12 pb-4 bg-slate-50" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {state.userName && (
              <p className="text-xs text-slate-400 mt-0.5">{state.userName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightAction}
            {showLogout && (
              <button
                onClick={signOut}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>
      )}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
