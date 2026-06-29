'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'cadastro'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Preencha e-mail e senha.'); return }
    if (password.length < 6) { setError('Senha precisa ter ao menos 6 caracteres.'); return }
    setLoading(true)

    if (mode === 'cadastro') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } },
      })
      if (err) { setError(translateError(err.message)); setLoading(false); return }
      setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(translateError(err.message)); setLoading(false); return }
    router.push('/hoje')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Destrava</h1>
          <p className="text-slate-500 mt-1 text-sm">Pare de procrastinar. Comece agora.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
          {(['login', 'cadastro'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === 'cadastro' && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full bg-white rounded-xl border border-slate-200 pl-11 pr-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-base"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              className="w-full bg-white rounded-xl border border-slate-200 pl-11 pr-4 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-base"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full bg-white rounded-xl border border-slate-200 pl-11 pr-12 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-base"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm text-center">
            {success}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-base disabled:opacity-60 transition-opacity"
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
        </button>

        {mode === 'login' && (
          <button
            onClick={async () => {
              if (!email) { setError('Digite seu e-mail primeiro.'); return }
              setLoading(true)
              await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/nova-senha`,
              })
              setSuccess('Link de redefinição enviado para seu e-mail.')
              setLoading(false)
            }}
            className="w-full mt-3 text-sm text-slate-400 text-center"
          >
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be')) return 'Senha deve ter ao menos 6 caracteres.'
  return 'Algo deu errado. Tente novamente.'
}
