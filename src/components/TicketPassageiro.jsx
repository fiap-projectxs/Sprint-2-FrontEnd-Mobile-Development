import { useState } from 'react'
import Card from './Card.jsx'
import EmptyState from './EmptyState.jsx'
import Timeline from './Timeline.jsx'
import { Selecao, Texto } from './Campo.jsx'
import { StatusBadge } from './StatusBadge.jsx'
import { formatarDataHora } from '../utils/datas.js'

const MOTIVOS = ['Reclamação', 'Dúvida', 'Sugestão', 'Outro']

// Visão do passageiro no TicketRal: registrar um ticket (reclamação ou contato com o suporte do Raly)
// e acompanhar só os próprios tickets. A fila completa fica com a equipe da CCO.
export default function TicketPassageiro({ usuario, tickets, criarTicket, avisar }) {
  const [motivo, setMotivo] = useState('Reclamação')
  const [trecho, setTrecho] = useState('')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const meus = tickets.filter((t) => t.dono === usuario.usuario)

  function enviar(e) {
    e.preventDefault()
    if (texto.trim().length < 5) { setErro('Conte o que aconteceu (mínimo de 5 caracteres).'); return }
    const id = criarTicket({
      titulo: `${motivo}: ${texto.trim().slice(0, 60)}`, categoria: 'Suporte do passageiro', prioridade: 'Média',
      equipe: 'Atendimento ao Usuário', trecho: trecho.trim() || 'trecho não informado', origem: 'Passageiro',
      autor: usuario.nome, dono: usuario.usuario, nota: texto.trim(),
    })
    avisar(`Ticket ${id} registrado. A equipe de atendimento vai responder (demonstração).`)
    setTexto(''); setTrecho(''); setErro('')
  }

  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>TicketRal · suporte ao passageiro</h1>
          <p className="texto-suave">Registre uma reclamação ou fale com o suporte do Raly. Quem atende é a equipe de trânsito na CCO. Nada é enviado a sistemas reais.</p>
        </div>
      </div>
      <div className="grade grade--2">
        <Card titulo="Registrar ticket" subtitulo="Conte o que aconteceu e onde.">
          <form className="form-op" onSubmit={enviar} noValidate>
            <Selecao id="tp-motivo" rotulo="Motivo" valor={motivo} onChange={setMotivo} opcoes={MOTIVOS} todas={null} />
            <Texto id="tp-trecho" rotulo="Rodovia e km (opcional)" valor={trecho} onChange={setTrecho} placeholder="Ex.: DEMO-101, km 42" />
            <Texto id="tp-texto" rotulo="Mensagem" linhas={4} valor={texto} onChange={(v) => { setTexto(v); setErro('') }} obrigatorio />
            {erro && <p className="erro-campo" role="alert">{erro}</p>}
            <button type="submit" className="btn btn--primario">Enviar ao suporte</button>
          </form>
        </Card>
        <Card titulo="Meus tickets" subtitulo={`${meus.length} registrado(s)`}>
          {meus.length === 0 ? (
            <EmptyState icone="inbox" titulo="Você ainda não registrou nenhum ticket">Use o formulário ao lado para falar com o suporte.</EmptyState>
          ) : (
            <ul className="lista-oc">
              {meus.map((t) => (
                <li key={t.id} className="oc">
                  <div className="oc__topo"><strong>{t.titulo}</strong><StatusBadge status={t.status} /><span className="texto-suave">{t.id}</span></div>
                  <p className="texto-suave oc__meta">{t.trecho} · aberto em {formatarDataHora(t.abertura)}</p>
                  <Timeline itens={t.historico} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
