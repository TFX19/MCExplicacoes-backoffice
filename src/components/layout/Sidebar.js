'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard, Users, FileText,
  Calendar, CreditCard, LogOut,
} from 'lucide-react'

const nav = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/inscricoes',   label: 'Inscrições',   icon: FileText },
  { href: '/alunos',       label: 'Alunos',       icon: Users },
  { href: '/sessoes',      label: 'Sessões',       icon: Calendar },
  { href: '/pagamentos',   label: 'Pagamentos',   icon: CreditCard },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Explicações</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Sair
        </button>
      </div>
    </aside>
  )
}
