const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getToken() {
  // Importa dinamicamente para evitar erros em SSR
  const { createBrowserClient } = await import("./supabase-browser");
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Erro desconhecido");
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Inscrições ──────────────────────────────────────────────
export const inscricoesApi = {
  listar: (params = {}) =>
    apiFetch("/inscricoes?" + new URLSearchParams(params)),
  atualizar: (id, data) =>
    apiFetch(`/inscricoes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  converter: (id) =>
    apiFetch(`/inscricoes/${id}/converter`, { method: "POST" }),
};

// ── Alunos ───────────────────────────────────────────────────
export const alunosApi = {
  listar: (params = {}) => apiFetch("/alunos?" + new URLSearchParams(params)),
  obter: (id) => apiFetch(`/alunos/${id}`),
  criar: (data) =>
    apiFetch("/alunos", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id, data) =>
    apiFetch(`/alunos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`/alunos/${id}`, { method: "DELETE" }),
};

// ── Sessões ──────────────────────────────────────────────────
export const sessoesApi = {
  listar: (params = {}) => apiFetch("/sessoes?" + new URLSearchParams(params)),
  obter: (id) => apiFetch(`/sessoes/${id}`),
  criar: (data) =>
    apiFetch("/sessoes", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id, data) =>
    apiFetch(`/sessoes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`/sessoes/${id}`, { method: "DELETE" }),
};

// ── Pagamentos ───────────────────────────────────────────────
export const pagamentosApi = {
  listar: (params = {}) =>
    apiFetch("/pagamentos?" + new URLSearchParams(params)),
  resumo: () => apiFetch("/pagamentos/resumo"),
  criar: (data) =>
    apiFetch("/pagamentos", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id, data) =>
    apiFetch(`/pagamentos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  eliminar: (id) => apiFetch(`/pagamentos/${id}`, { method: "DELETE" }),
  eliminarMultiplos: (ids) =>
    apiFetch("/pagamentos/lote", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};

// ── Matérias ─────────────────────────────────────────────────
export const materiasApi = {
  listar: () => apiFetch("/materias"),
};
