'use client'
import { useEffect, useState, useCallback } from 'react'
import { alunosApi, materiasApi } from '@/lib/api'
import { Table, Badge, Modal, PageHeader, Field, Empty } from '@/components/ui'
import { Plus, Search, Trash2 } from 'lucide-react'

const EMPTY_FORM = {
  nome: '', email: '', telemovel: '', anoEscolar: '',
  escola: '', notasInternas: '', materiasIds: [],
}

export default function AlunosPage() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [materias, setMaterias] = useState([])
  const [modal, setModal]       = useState(null)   // null | 'criar' | aluno
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = useCallback(async (s = search) => {
    setLoading(true)
    const params = { limit: 50 }
    if (s) params.search = s
    const res = await alunosApi.listar(params).catch(() => ({ data: [], total: 0 }))
    setItems(res.data ?? [])
    setTotal(res.total ?? 0)
    setLoading(false)
  }, [search])

  useEffect(() => {
    load()
    materiasApi.listar().then(setMaterias).catch(() => {})
  }, [])

  function openCriar() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('criar')
  }

  function openEditar(aluno) {
    setForm({
      nome: aluno.nome,
      email: aluno.email,
      telemovel: aluno.telemovel ?? '',
      anoEscolar: aluno.anoEscolar ?? '',
      escola: aluno.escola ?? '',
      notasInternas: aluno.notasInternas ?? '',
      materiasIds: aluno.materias?.map(m => m.materiaId) ?? [],
    })
    setError('')
    setModal(aluno)
  }

  function toggleMateria(id) {
    setForm(f => ({
      ...f,
      materiasIds: f.materiasIds.includes(id)
        ? f.materiasIds.filter(m => m !== id)
        : [...f.materiasIds, id],
    }))
  }

  async function handleSave() {
    if (!form.nome || !form.email) { setError('Nome e email são obrigatórios.'); return }
    setSaving(true)
    setError('')
    try {
      if (modal === 'criar') {
        await alunosApi.criar(form)
      } else {
        await alunosApi.atualizar(modal.id, form)
      }
      setModal(null)
      load()
    } catch (e) {
      setError(e.message)
    }
    setSaving(false)
  }

  async function handleEliminar(id) {
    if (!confirm('Eliminar este aluno? Esta acção não pode ser desfeita.')) return
    await alunosApi.eliminar(id).catch(() => {})
    setModal(null)
    load()
  }

  const cols = [
    { key: 'nome',      label: 'Nome' },
    { key: 'email',     label: 'Email' },
    { key: 'anoEscolar', label: 'Ano',   render: r => r.anoEscolar || '—' },
    { key: 'materias',  label: 'Matérias', render: r => (
      <div className="flex flex-wrap gap-1">
        {r.materias?.slice(0, 3).map(m => (
          <span key={m.materiaId} className="badge bg-gray-100 text-gray-600">{m.materia?.nome}</span>
        ))}
        {(r.materias?.length ?? 0) > 3 && <span className="badge bg-gray-100 text-gray-500">+{r.materias.length - 3}</span>}
      </div>
    )},
    { key: 'ativo', label: 'Estado', render: r => <Badge estado={r.ativo ? 'convertido' : 'rejeitado'} /> },
  ]

  return (
    <div className="p-8">
      <PageHeader
        title="Alunos"
        subtitle={`${total} alunos`}
        action={
          <button onClick={openCriar} className="btn-primary">
            <Plus size={15} /> Novo aluno
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Pesquisar nome ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(search)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Empty message="Sem alunos. Cria o primeiro!" />
        ) : (
          <Table columns={cols} data={items} onRowClick={openEditar} />
        )}
      </div>

      {/* Modal criar / editar */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'criar' ? 'Novo aluno' : 'Editar aluno'}
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" required>
              <input className="input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </Field>
            <Field label="Email" required>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Telemóvel">
              <input className="input" value={form.telemovel} onChange={e => setForm(f => ({ ...f, telemovel: e.target.value }))} />
            </Field>
            <Field label="Ano escolar">
              <input className="input" placeholder="ex: 9º ano" value={form.anoEscolar} onChange={e => setForm(f => ({ ...f, anoEscolar: e.target.value }))} />
            </Field>
            <Field label="Escola">
              <input className="input" value={form.escola} onChange={e => setForm(f => ({ ...f, escola: e.target.value }))} />
            </Field>
          </div>

          <Field label="Matérias">
            <div className="flex flex-wrap gap-2 mt-1">
              {materias.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMateria(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    form.materiasIds.includes(m.id)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {m.nome}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notas internas">
            <textarea
              className="input resize-none"
              rows={3}
              value={form.notasInternas}
              onChange={e => setForm(f => ({ ...f, notasInternas: e.target.value }))}
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
