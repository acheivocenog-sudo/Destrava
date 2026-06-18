'use client'

import { ReactNode } from 'react'
import BottomNav from './BottomNav'

interface Props {
  children: ReactNode
  title?: string
  rightAction?: ReactNode
}

export default function AppShell({ children, title, rightAction }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {title && (
        <header className="flex items-center justify-between px-5 pt-12 pb-4 bg-slate-50 safe-top">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {rightAction}
        </header>
      )}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
