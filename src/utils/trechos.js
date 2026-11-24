// Regras de trechos e ocorrências da Sprint 2: constantes, validação e filtros (funções puras, sem React).
import { gerarId } from './armazenamento.js'

export const TIPOS = ['Vegetação', 'Buraco', 'Sinalização', 'Outro']
export const GRAVIDADES = ['Baixa', 'Média', 'Alta']
export const STATUS = ['Aberta', 'Em atendimento', 'Resolvida']

// Valida o formulário de trecho. Devolve { ok, erros, trecho }.
export function validarTrecho({ rodovia, kmInicial, kmFinal }, trechosExistentes = []) {
  const erros = {}
  const nome = String(rodovia || '').trim()
  const ini = Number(String(kmInicial).replace(',', '.'))
  const fim = Number(String(kmFinal).replace(',', '.'))
  if (!nome) erros.rodovia = 'Informe o nome da rodovia.'
  if (String(kmInicial).trim() === '' || Number.isNaN(ini) || ini < 0) erros.kmInicial = 'Informe um km inicial válido (0 ou mais).'
  if (String(kmFinal).trim() === '' || Number.isNaN(fim) || fim < 0) erros.kmFinal = 'Informe um km final válido (0 ou mais).'
  if (!erros.kmInicial && !erros.kmFinal && fim <= ini) erros.kmFinal = 'O km final precisa ser maior que o inicial.'
  if (!Object.keys(erros).length) {
    const repetido = trechosExistentes.some((t) => t.rodovia.toLowerCase() === nome.toLowerCase() && t.kmInicial === ini && t.kmFinal === fim)
    if (repetido) erros.rodovia = 'Esse trecho já está cadastrado.'
  }
  if (Object.keys(erros).length) return { ok: false, erros }
  return { ok: true, erros: {}, trecho: { id: gerarId('TR'), rodovia: nome, kmInicial: ini, kmFinal: fim, criadoEm: new Date().toISOString() } }
}

// Valida o formulário de ocorrência. Cada ocorrência nasce carimbada com trechoId, data e hora.
export function validarOcorrencia({ tipo, descricao, gravidade, km }, trecho) {
  const erros = {}
  if (!trecho) erros.geral = 'Selecione um trecho antes de registrar.'
  if (!TIPOS.includes(tipo)) erros.tipo = 'Escolha o tipo.'
  if (!GRAVIDADES.includes(gravidade)) erros.gravidade = 'Escolha a gravidade.'
  const texto = String(descricao || '').trim()
  if (texto.length < 5) erros.descricao = 'Descreva a ocorrência (mínimo de 5 caracteres).'
  let kmNum = null
  if (String(km ?? '').trim() !== '') {
    kmNum = Number(String(km).replace(',', '.'))
    if (Number.isNaN(kmNum)) erros.km = 'Km inválido.'
    else if (trecho && (kmNum < trecho.kmInicial || kmNum > trecho.kmFinal)) erros.km = `O km deve estar entre ${trecho.kmInicial} e ${trecho.kmFinal}.`
  }
  if (Object.keys(erros).length) return { ok: false, erros }
  const agora = new Date().toISOString()
  return { ok: true, erros: {}, ocorrencia: { id: gerarId('OC'), trechoId: trecho.id, tipo, descricao: texto, gravidade, km: kmNum, status: 'Aberta', criadoEm: agora, atualizadoEm: agora } }
}

// Isolamento: só entram ocorrências do trecho pedido.
export function ocorrenciasDoTrecho(ocorrencias, trechoId) {
  return ocorrencias.filter((o) => o.trechoId === trechoId)
}

// Filtro por gravidade, tipo e status (vazio = todos). Mais recentes primeiro.
export function filtrarOcorrencias(lista, { gravidade = '', tipo = '', status = '' } = {}) {
  return lista
    .filter((o) => (!gravidade || o.gravidade === gravidade) && (!tipo || o.tipo === tipo) && (!status || o.status === status))
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

// Trechos de exemplo, com dados que fazem sentido para a Motiva (rodovia fictícia).
export function trechosDeExemplo() {
  const base = [['DEMO-101', 38, 52], ['DEMO-101', 52, 71], ['DEMO-205', 10, 28]]
  return base.map(([rodovia, kmInicial, kmFinal]) => ({ id: gerarId('TR'), rodovia, kmInicial, kmFinal, criadoEm: new Date().toISOString() }))
}
