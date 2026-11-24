// Resumo do painel do trecho, calculado só a partir das ocorrências (mesmo estilo do analisarPerfil).
import { GRAVIDADES, STATUS, TIPOS } from './trechos.js'

// Regra do alerta: 3 ou mais ocorrências de gravidade alta ainda não resolvidas.
export const LIMITE_ALERTA = 3

export function analisarTrecho(ocorrencias) {
  const total = ocorrencias.length
  const porGravidade = Object.fromEntries(GRAVIDADES.map((g) => [g, ocorrencias.filter((o) => o.gravidade === g).length]))
  const porStatus = Object.fromEntries(STATUS.map((s) => [s, ocorrencias.filter((o) => o.status === s).length]))
  const porTipo = Object.fromEntries(TIPOS.map((t) => [t, ocorrencias.filter((o) => o.tipo === t).length]))

  // Tipo mais frequente: maior contagem; empate resolvido pela ordem da lista TIPOS.
  let tipoMaisFrequente = null
  for (const t of TIPOS) if (porTipo[t] > 0 && (tipoMaisFrequente === null || porTipo[t] > porTipo[tipoMaisFrequente])) tipoMaisFrequente = t

  const altasAbertas = ocorrencias.filter((o) => o.gravidade === 'Alta' && o.status !== 'Resolvida').length
  const alerta = altasAbertas >= LIMITE_ALERTA
    ? { ativo: true, texto: `${altasAbertas} ocorrências graves sem resolução neste trecho. Priorize o atendimento.` }
    : { ativo: false, texto: '' }

  return { total, alta: porGravidade.Alta, porGravidade, porStatus, porTipo, tipoMaisFrequente, altasAbertas, alerta }
}
