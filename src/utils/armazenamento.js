// Persistência da plataforma: UM único objeto no localStorage, lido ao abrir e gravado a cada mudança.
// Formato: { versao, trechos: [], trechoAtualId: string|null, ocorrencias: [] }
export const CHAVE = 'raly:plataforma:v1'
const VERSAO = 1

export const ESTADO_VAZIO = { versao: VERSAO, trechos: [], trechoAtualId: null, ocorrencias: [] }

// Valida o que veio do navegador para um F5 nunca quebrar a tela por causa de um dado antigo ou editado à mão.
function sanear(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ...ESTADO_VAZIO }
  const trechos = Array.isArray(bruto.trechos) ? bruto.trechos.filter((t) => t && typeof t.id === 'string') : []
  const ids = new Set(trechos.map((t) => t.id))
  const ocorrencias = Array.isArray(bruto.ocorrencias)
    ? bruto.ocorrencias.filter((o) => o && typeof o.id === 'string' && ids.has(o.trechoId))
    : []
  const trechoAtualId = ids.has(bruto.trechoAtualId) ? bruto.trechoAtualId : (trechos[0]?.id ?? null)
  return { versao: VERSAO, trechos, trechoAtualId, ocorrencias }
}

export function carregarPlataforma() {
  try {
    const texto = window.localStorage.getItem(CHAVE)
    return texto ? sanear(JSON.parse(texto)) : { ...ESTADO_VAZIO }
  } catch {
    return { ...ESTADO_VAZIO } // sem armazenamento ou JSON corrompido: começa vazio
  }
}

export function salvarPlataforma({ trechos, trechoAtualId, ocorrencias }) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ versao: VERSAO, trechos, trechoAtualId, ocorrencias }))
    return true
  } catch {
    return false // navegador sem armazenamento: os dados valem só nesta sessão
  }
}

export function limparPlataforma() {
  try { window.localStorage.removeItem(CHAVE) } catch { /* nada a limpar */ }
}

// Id único: instante + parte aleatória. Dois cadastros no mesmo milissegundo não colidem.
export function gerarId(prefixo) {
  const aleatorio = Math.random().toString(36).slice(2, 6)
  return `${prefixo}-${Date.now().toString(36)}-${aleatorio}`.toUpperCase()
}
