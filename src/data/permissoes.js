// Perfis e o que cada um pode abrir. null = público; 'logado' = qualquer pessoa autenticada.
export const PERFIS = {
  passageiro: { rotulo: 'Passageiro', descricao: 'Usa só o TicketRal: reporta problemas na via, fala com o suporte e avisa erros do app.' },
  agente: { rotulo: 'Profissional de trânsito', descricao: 'Usa o Raly nas rodovias: ocorrências, consultas e interações. Não abre o SmartDeskAI.' },
  coordenador: { rotulo: 'Equipe de trânsito (CCO)', descricao: 'Tudo do profissional, mais o SmartDeskAI e a fila de tickets.' },
  admin: { rotulo: 'Administrador', descricao: 'Tudo, mais o painel administrativo.' },
}
export const LISTA_PERFIS = Object.keys(PERFIS)

export const MODULOS_ACESSO = [
  { id: 'apresentacao', rotulo: 'Apresentação', quem: null },
  { id: 'sobre', rotulo: 'Sobre o Raly', quem: null },
  { id: 'agentes', rotulo: 'Agentes', quem: null },
  { id: 'inicio', rotulo: 'Visão geral', quem: null },
  { id: 'smartdesk', rotulo: 'SmartDeskAI (CCO)', quem: ['coordenador', 'admin'] },
  { id: 'operacao', rotulo: 'Trechos e ocorrências', quem: null },
  { id: 'raly', rotulo: 'Raly (operacional)', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'consultas', rotulo: 'Consultas', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'interacoes', rotulo: 'Interações', quem: ['agente', 'coordenador', 'admin'] },
  { id: 'ticketral', rotulo: 'TicketRal', quem: ['passageiro', 'coordenador', 'admin'] },
  { id: 'admin', rotulo: 'Painel administrativo', quem: ['admin'] },
  { id: 'conta', rotulo: 'Minha conta', quem: 'logado' },
  { id: 'entrar', rotulo: 'Entrar', quem: null },
]

// Passageiro só usa o TicketRal (e as páginas informativas e a própria conta).
const PASSAGEIRO_ABRE = ['apresentacao', 'sobre', 'agentes', 'ticketral', 'conta', 'entrar']

export function podeAcessar(pagina, sessao) {
  if (pagina === 'ticketral' && !sessao) return true // a porta de entrada do passageiro (entrar ou criar conta) fica dentro do TicketRal
  if (sessao?.perfil === 'passageiro') return PASSAGEIRO_ABRE.includes(pagina)
  const m = MODULOS_ACESSO.find((x) => x.id === pagina)
  if (!m || m.quem === null) return true
  if (!sessao) return false
  if (m.quem === 'logado') return true
  return m.quem.includes(sessao.perfil)
}

// Quem pode ver ou criar tickets (TicketRal).
// Fila completa de tickets: só a equipe da CCO. O passageiro vê apenas os próprios tickets.
export const podeTickets = (sessao) => Boolean(sessao) && ['coordenador', 'admin'].includes(sessao.perfil)
