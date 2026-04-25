'use client'
import { useEffect, useState, useCallback } from 'react'
import { pagamentosApi, alunosApi, sessoesApi } from '@/lib/api'
import { Table, Badge, Modal, PageHeader, StatCard, Field, Select, Empty } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'

const ESTADOS  = [
  { value: 'pendente',    label: 'Pendente' },
  { value: 'pago',        label: 'Pago' },
  { value: 'reembolsado', label: 'Reembolsado' },
]
const METODOS  = [
  { value: 'transferencia', label: 'Transferência' },
  { value: 'mbway',         label: 'MBWay' },
  { value: 'numerario',     label: 'Numerário' },
  { value: 'outro',         label: 'Outro' },
]

const EMPTY_FORM = {
  alunoId: '', sessaoId: '', valor: '', metodo: 'transferencia',
  estado: 'pendente', dataPagamento: '', descricao: '',
}

export default function PagamentosPage() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [resumo, setResumo]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [filtroEstado, setFiltro] = useState('')
  const [alunos, setAlunos]     = useState([])
  const [sessoes, setSessoes]   = useState([])
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = useCallback(async (estado = filtroEstado) => {
    setLoading(true)
    const params = { limit: 50 }
    if (estado) params.estado = estado
    const [res, res2] = await Promise.allSettled([
      pagamentosApi.listar(params),
      pagamentosApi.resumo(),
    ])
    setItems(res.value?.data ?? [])
    setTotal(res.value?.total ?? 0)
    setResumo(res2.value ?? null)
    setLoading(false)
  }, [filtroEstado])

  useEffect(() => {
    load()
    alunosApi.listar({ limit: 200 }).then(r => setAlunos(r.data ?? [])).catch(() => {})
  }, [])

  // Quando muda aluno no form, carrega sessões desse aluno
  useEffect(() => {
    if (!form.alunoId) { setSessoes([]); return }
    sessoesApi.listar({ alunoId: form.alunoId, limit: 50 })
      .then(r => setSessoes(r.data ?? []))
      .catch(() => {})
  }, [form.alunoId])

  function openCriar() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('criar')
  }

  function openEditar(p) {
    setForm({
      alunoId:       p.alunoId,
      sessaoId:      p.sessaoId ?? '',
      valor:         String(p.valor),
      metodo:        p.metodo ?? 'transferencia',
      estado:        p.estado,
      dataPagamento: p.dataPagamento ? p.dataPagamento.slice(0, 10) : '',
      descricao:     p.descricao ?? '',
    })
    setError('')
    setModal(p)
  }

  async function handleSave() {
    if (!form.alunoId || !form.valor) { setError('Aluno e valor são obrigatórios.'); return }
    setSaving(true)
    setError('')
    try {
      const data = {
        ...form,
        valor:    parseFloat(form.valor),
        sessaoId: form.sessaoId || null,
        dataPagamento: form.dataPagamento || null,
      }
      if (modal === 'criar') {
        await pagamentosApi.criar(data)
      } else {
        await pagamentosApi.atualizar(modal.id, data)
      }
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
    setSaving(false)
  }

  async function handleEliminar(id) {
    if (!confirm('Eliminar este pagamento?')) return
    await pagamentosApi.eliminar(id).catch(() => {})
    setModal(null)
    load()
  }

  const cols = [
    { key: 'aluno',    label: 'Aluno',   render: r => r.aluno?.nome ?? '—' },
    { key: 'valor',    label: 'Valor',   render: r => `€${Number(r.valor).toFixed(2)}` },
    { key: 'metodo',   label: 'Método',  render: r => r.metodo ?? '—' },
    { key: 'estado',   label: 'Estado',  render: r => <Badge estado={r.estado} /> },
    { key: 'dataPagamento', label: 'Data pag.', render: r =>
      r.dataPagamento ? new Date(r.dataPagamento).toLocaleDateString('pt-PT') : '—'
    },
    { key: 'descricao', label: 'Descrição', render: r => r.descricao ?? '—' },
  ]

  return (
    <div className="p-8">
      <PageHeader
        title="Pagamentos"
        subtitle={`${total} registos`}
        action={
          <button onClick={openCriar} className="btn-primary">
            <Plus size={15} /> Novo pagamento
          </button>
        }
      />

      {/* Resumo financeiro */}
      {resumo && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Recebido"
            value={`€${Number(resumo.pago?.total ?? 0).toFixed(2)}`}
            sub={`${resumo.pago?.count ?? 0} pagamentos`}
          />
          <StatCard
            label="Por receber"
            value={`€${Number(resumo.pendente?.total ?? 0).toFixed(2)}`}
            sub={`${resumo.pendente?.count ?? 0} pendentes`}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
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
          <Empty message="Sem pagamentos registados" />
        ) : (
          <Table columns={cols} data={items} onRowClick={openEditar} />
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'criar' ? 'Novo pagamento' : 'Editar pagamento'}
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Aluno" required>
              <Select
                value={form.alunoId}
                onChange={v => setForm(f => ({ ...f, alunoId: v, sessaoId: '' }))}
                options={alunos.map(a => ({ value: a.id, label: a.nome }))}
              />
            </Field>
            <Field label="Sessão associada">
              <Select
                value={form.sessaoId}
                onChange={v => setForm(f => ({ ...f, sessaoId: v }))}
                placeholder="Nenhuma"
                options={sessoes.map(s => ({
                  value: s.id,
                  label: `${new Date(s.dataHora).toLocaleDateString('pt-PT')} – ${s.materia?.nome}`,
                }))}
              />
            </Field>
            <Field label="Valor (€)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              />
            </Field>
            <Field label="Método">
              <Select
                value={form.metodo}
                onChange={v => setForm(f => ({ ...f, metodo: v }))}
                options={METODOS}
                placeholder=""
              />
            </Field>
            <Field label="Estado">
              <Select
                value={form.estado}
                onChange={v => setForm(f => ({ ...f, estado: v }))}
                options={ESTADOS}
                placeholder=""
              />
            </Field>
            <Field label="Data de pagamento">
              <input
                type="date"
                className="input"
                value={form.dataPagamento}
                onChange={e => setForm(f => ({ ...f, dataPagamento: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Descrição">
            <input
              className="input"
              placeholder="ex: Sessão 60min – Matemática"
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            {modal !== 'criar' ? (
              <button onClick={() => handleEliminar(modal.id)} className="btn-danger">
                <Trash2 size={14} /> Eliminar
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'A guardar…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
