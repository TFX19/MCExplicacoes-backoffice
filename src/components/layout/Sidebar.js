"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inscricoes", label: "Inscrições", icon: FileText },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/sessoes", label: "Sessões", icon: Calendar },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Hamburger button (mobile only) ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-20 h-full bg-white border-r border-gray-200 flex flex-col
          transition-all duration-200 ease-in-out
          ${open ? "w-56" : "w-0 lg:w-14"}
          lg:relative lg:z-auto lg:h-screen
          overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="px-3 py-4 border-b border-gray-100 min-w-[224px] lg:min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex-shrink-0 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">MC</span>
            </div>
            <span
              className={`flex-1 font-semibold text-gray-900 text-sm whitespace-nowrap transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0 lg:opacity-0"}`}
            >
              Explicações
            </span>
          </div>

          {/* Chevron — desktop toggle, abaixo do logo */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="hidden lg:flex items-center justify-center mt-3 w-full p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            <ChevronRight
              size={15}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 min-w-[224px] lg:min-w-0">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                title={label}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group relative ${
                  active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} className="flex-shrink-0" />
                <span
                  className={`whitespace-nowrap transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0 lg:opacity-0"}`}
                >
                  {label}
                </span>

                {/* Tooltip quando fechado (desktop) */}
                {!open && (
                  <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 text-xs bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / logout */}
        <div className="px-2 py-3 border-t border-gray-100 min-w-[224px] lg:min-w-0">
          {open && (
            <div className="px-2.5 py-1.5 mb-1">
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={signOut}
            title="Sair"
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group relative"
          >
            <LogOut size={17} strokeWidth={1.8} className="flex-shrink-0" />
            <span
              className={`whitespace-nowrap transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0 lg:opacity-0"}`}
            >
              Sair
            </span>
            {!open && (
              <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 text-xs bg-gray-900 text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
