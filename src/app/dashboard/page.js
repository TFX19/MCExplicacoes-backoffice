'use client'
import { useEffect, useState } from 'react'
import { alunosApi, sessoesApi, pagamentosApi, inscricoesApi } from '@/lib/api'
import { StatCard, PageHeader } from '@/components/ui'
import { Badge } from '@/components/ui'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats]           = useState(null)
  const [proximasSessoes, setProx]  = useState([])
  const [inscPendentes, setInscP]   = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const [alunos, sessoes, resumo, insc] = await Promise.allSettled([
        alunosApi.listar({ limit: 1 }),
        sessoesApi.listar({ estado: 'agendada', limit: 5 }),
        pagamentosApi.resumo(),
        inscricoesApi.listar({ estado: 'pendente', limit: 5 }),
      ])

      setStats({
        totalAlunos:  alunos.value?.total ?? 0,
        totalSessoes: sessoes.value?.total ?? 0,
        valorPago:    resumo.value?.pago?.total ?? 0,
        valorPendente: resumo.value?.pendente?.total ?? 0,
      })
      setProx(sessoes.value?.data ?? [])
      setInscP(insc.value?.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" subtitle="Visão geral das explicações" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Alunos activos" value={stats?.totalAlunos ?? 0} />
        <StatCard label="Sessões agendadas" value={stats?.totalSessoes ?? 0} />
        <StatCard label="Recebido" value={`€${Number(stats?.valorPago ?? 0).toFixed(2)}`} />
        <StatCard label="Por receber" value={`€${Number(stats?.valorPendente ?? 0).toFixed(2)}`} sub="Pagamentos pendentes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas sessões */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Próximas sessões</h2>
            <Link href="/sessoes" className="text-xs text-gray-500 hover:text-gray-900">Ver todas →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {proximasSessoes.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem sessões agendadas</p>
            )}
            {proximasSessoes.map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.aluno?.nome}</p>
                  <p className="text-xs text-gray-500">{s.materia?.nome} · {s.duracaoMin} min</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(s.dataHora).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Inscrições pendentes */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Inscrições pendentes</h2>
            <Link href="/inscricoes" className="text-xs text-gray-500 hover:text-gray-900">Ver todas →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {inscPendentes.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem inscrições pendentes</p>
            )}
            {inscPendentes.map(i => (
              <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{i.nome}</p>
                  <p className="text-xs text-gray-500">{i.email} · {i.anoEscolar}</p>
                </div>
                <Badge estado={i.estado} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
