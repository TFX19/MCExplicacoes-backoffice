'use client'
import { useEffect, useState } from 'react'
import { inscricoesApi } from '@/lib/api'
import { Table, Badge, Modal, PageHeader, Field, Select, Empty } from '@/components/ui'
import { RefreshCw, UserPlus } from 'lucide-react'

const ESTADOS = [
  { value: 'pendente',   label: 'Pendente' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'rejeitado',  label: 'Rejeitado' },
]

export default function InscricoesPage() {
  const [items, setItems]         = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [filtroEstado, setFiltro] = useState('')
  const [selected, setSelected]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')

  async function load(estado = filtroEstado) {
    setLoading(true)
    const params = { limit: 50 }
    if (estado) params.estado = estado
    const res = await inscricoesApi.listar(params).catch(() => ({ data: [], total: 0 }))
    setItems(res.data ?? [])
    setTotal(res.total ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleEstado(novoEstado) {
    setSaving(true)
    await inscricoesApi.atualizar(selected.id, { estado: novoEstado })
    setSelected(s => ({ ...s, estado: novoEstado }))
    setSaving(false)
    setMsg('Estado actualizado.')
    load()
  }

  async function handleConverter() {
    if (!confirm('Criar aluno a partir desta inscrição?')) return
    setSaving(true)
    try {
      await inscricoesApi.converter(selected.id)
      // Remove a inscrição da tabela após converter com sucesso
      setItems(items.filter(i => i.id !== selected.id))
      setTotal(t => t - 1)
      setSelected(null)
      // Recarrega para garantir consistência com o servidor
      load()
    } catch (e) {
      setMsg('Erro: ' + e.message)
    }
    setSaving(false)
  }

  const cols = [
    { key: 'nome',      label: 'Nome' },
    { key: 'email',     label: 'Email' },
    { key: 'anoEscolar', label: 'Ano' },
    { key: 'estado',    label: 'Estado',   render: r => <Badge estado={r.estado} /> },
    { key: 'criadoEm', label: 'Data',     render: r => new Date(r.criadoEm).toLocaleDateString('pt-PT') },
  ]

  return (
    <div className="p-8">
      <PageHeader
        title="Inscrições"
        subtitle={`${total} inscrições no total`}
        action={
          <button onClick={() => load()} className="btn-secondary">
            <RefreshCw size={14} /> Actualizar
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        {['', ...ESTADOS.map(e => e.value)].map(e => (
          <button
            key={e}
            onClick={() => { setFiltro(e); load(e) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroEstado === e
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {e === '' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Empty message="Sem inscrições" />
        ) : (
          <Table cols={cols} columns={cols} data={items} onRowClick={setSelected} />
        )}
      </div>

      {/* Detalhe modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setMsg('') }} title="Detalhe da inscrição">
        {selected && (
          <div className="space-y-4">
            {msg && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{msg}</p>}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Nome',     selected.nome],
                ['Email',    selected.email],
                ['Telemóvel', selected.telemovel || '—'],
                ['Ano',      selected.anoEscolar || '—'],
                ['Escola',   selected.escola || '—'],
                ['Data',     new Date(selected.criadoEm).toLocaleDateString('pt-PT')],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-500 mb-0.5">{k}</p>
                  <p className="font-medium text-gray-900">{v}</p>
                </div>
              ))}
            </div>

            {selected.mensagem && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Mensagem</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.mensagem}</p>
              </div>
            )}

            <Field label="Mudar estado">
              <Select
                value={selected.estado}
                onChange={handleEstado}
                options={ESTADOS}
                placeholder=""
              />
            </Field>

            {selected.estado !== 'convertido' && (
              <button
                onClick={handleConverter}
                disabled={saving}
                className="btn-primary w-full justify-center"
              >
                <UserPlus size={15} />
                {saving ? 'A criar aluno…' : 'Converter em aluno'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
