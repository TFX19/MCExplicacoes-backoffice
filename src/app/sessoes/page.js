"use client";
import { useEffect, useState, useCallback } from "react";
import { sessoesApi, alunosApi, materiasApi } from "@/lib/api";
import {
  Table,
  Badge,
  Modal,
  PageHeader,
  Field,
  Select,
  Empty,
} from "@/components/ui";
import { Plus, Trash2 } from "lucide-react";

const ESTADOS = [
  { value: "agendada", label: "Agendada" },
  { value: "realizada", label: "Realizada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "falta", label: "Falta" },
];

const LOCAIS = [
  { value: "online", label: "Online" },
  { value: "casa do aluno", label: "Casa do aluno" },
  { value: "minha casa", label: "Minha casa" },
];

const EMPTY_FORM = {
  alunoId: "",
  materiaId: "",
  dataHora: "",
  duracaoMin: 60,
  local: "online",
  estado: "agendada",
  notas: "",
};

// Converte um string "YYYY-MM-DDTHH:mm" (hora local) para ISO UTC
function localToUtcIso(localStr) {
  if (!localStr) return localStr;
  const d = new Date(localStr);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + offsetMs).toISOString();
}

// Converte uma data UTC para string "YYYY-MM-DDTHH:mm" no timezone de Lisboa
function utcToLocalInput(utcStr) {
  if (!utcStr) return "";
  const d = new Date(utcStr);
  // Formata em pt-PT com timezone de Lisboa e extrai data+hora
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// Formata data para mostrar na tabela
function formatDataHora(utcStr) {
  return new Date(utcStr).toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessoesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltro] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (estado = filtroEstado) => {
      setLoading(true);
      const params = { limit: 50 };
      if (estado) params.estado = estado;
      const res = await sessoesApi
        .listar(params)
        .catch(() => ({ data: [], total: 0 }));
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setLoading(false);
    },
    [filtroEstado],
  );

  useEffect(() => {
    load();
    alunosApi
      .listar({ limit: 200 })
      .then((r) => setAlunos(r.data ?? []))
      .catch(() => {});
    materiasApi
      .listar()
      .then(setMaterias)
      .catch(() => {});
  }, []);

  function openCriar() {
    setForm(EMPTY_FORM);
    setError("");
    setModal("criar");
  }

  function openEditar(sessao) {
    setForm({
      alunoId: sessao.alunoId,
      materiaId: sessao.materiaId,
      dataHora: utcToLocalInput(sessao.dataHora), // UTC → hora Lisboa no input
      duracaoMin: sessao.duracaoMin,
      local: sessao.local ?? "online",
      estado: sessao.estado,
      notas: sessao.notas ?? "",
    });
    setError("");
    setModal(sessao);
  }

  async function handleSave() {
    if (!form.alunoId || !form.materiaId || !form.dataHora) {
      setError("Aluno, matéria e data são obrigatórios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        duracaoMin: Number(form.duracaoMin),
        dataHora: localToUtcIso(form.dataHora), // hora Lisboa → UTC
      };
      if (modal === "criar") {
        await sessoesApi.criar(payload);
      } else {
        await sessoesApi.atualizar(modal.id, payload);
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  async function handleEliminar(id) {
    if (!confirm("Eliminar esta sessão?")) return;
    await sessoesApi.eliminar(id).catch(() => {});
    setModal(null);
    load();
  }

  const cols = [
    { key: "aluno", label: "Aluno", render: (r) => r.aluno?.nome ?? "—" },
    { key: "materia", label: "Matéria", render: (r) => r.materia?.nome ?? "—" },
    {
      key: "dataHora",
      label: "Data / Hora",
      render: (r) => formatDataHora(r.dataHora),
    },
    {
      key: "duracaoMin",
      label: "Duração",
      render: (r) => `${r.duracaoMin} min`,
    },
    { key: "local", label: "Local" },
    {
      key: "estado",
      label: "Estado",
      render: (r) => <Badge estado={r.estado} />,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Sessões"
        subtitle={`${total} sessões`}
        action={
          <button onClick={openCriar} className="btn-primary">
            <Plus size={15} /> Nova sessão
          </button>
        }
      />

      {/* Filtros estado */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {["", ...ESTADOS.map((e) => e.value)].map((e) => (
          <button
            key={e}
            onClick={() => {
              setFiltro(e);
              load(e);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroEstado === e
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {e === "" ? "Todas" : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Empty message="Sem sessões" />
        ) : (
          <Table columns={cols} data={items} onRowClick={openEditar} />
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "criar" ? "Nova sessão" : "Editar sessão"}
      >
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Aluno" required>
              <Select
                value={form.alunoId}
                onChange={(v) => setForm((f) => ({ ...f, alunoId: v }))}
                options={alunos.map((a) => ({ value: a.id, label: a.nome }))}
              />
            </Field>
            <Field label="Matéria" required>
              <Select
                value={form.materiaId}
                onChange={(v) => setForm((f) => ({ ...f, materiaId: v }))}
                options={materias.map((m) => ({ value: m.id, label: m.nome }))}
              />
            </Field>
            <Field label="Data e hora" required>
              <input
                type="datetime-local"
                className="input"
                value={form.dataHora}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dataHora: e.target.value }))
                }
              />
            </Field>
            <Field label="Duração (min)">
              <input
                type="number"
                className="input"
                min={15}
                step={15}
                value={form.duracaoMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duracaoMin: e.target.value }))
                }
              />
            </Field>
            <Field label="Local">
              <Select
                value={form.local}
                onChange={(v) => setForm((f) => ({ ...f, local: v }))}
                options={LOCAIS}
                placeholder=""
              />
            </Field>
            <Field label="Estado">
              <Select
                value={form.estado}
                onChange={(v) => setForm((f) => ({ ...f, estado: v }))}
                options={ESTADOS}
                placeholder=""
              />
            </Field>
          </div>

          <Field label="Notas">
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Sumário da sessão, pontos trabalhados…"
              value={form.notas}
              onChange={(e) =>
                setForm((f) => ({ ...f, notas: e.target.value }))
              }
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            {modal !== "criar" ? (
              <button
                onClick={() => handleEliminar(modal.id)}
                className="btn-danger"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "A guardar…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
