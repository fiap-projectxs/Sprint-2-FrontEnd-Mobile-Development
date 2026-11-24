// Contas de acesso iniciais de cada área (valem em qualquer instalação). A senha inicial deve ser trocada em Minha conta.
// admin@  -> área do Raly (profissional de trânsito).  admin#  -> SmartDeskAI (equipe da CCO, também administra a plataforma).
export const CONTAS_BASE = [
  { id: 'U-RALY', nome: 'Raly (profissional de trânsito)', usuario: 'admin@', senha: '1234', perfil: 'agente' },
  { id: 'U-SMARTDESK', nome: 'SmartDeskAI (CCO)', usuario: 'admin#', senha: '4321', perfil: 'admin' },
]
