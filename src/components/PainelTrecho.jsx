import Card from './Card.jsx'
import Icon from './Icon.jsx'

// Props: trecho (ou undefined) e resumo (saída de analisarTrecho).
export default function PainelTrecho({ trecho, resumo }) {
  if (!trecho) {
    return <Card titulo="Painel do trecho"><p className="texto-suave">Selecione um trecho para ver o resumo.</p></Card>
  }
  return (
    <Card titulo={`Painel · ${trecho.rodovia}`} subtitulo={`km ${trecho.kmInicial} ao ${trecho.kmFinal}`}>
      {resumo.alerta.ativo && (
        <div className="alerta-trecho" role="alert"><Icon nome="alert" tamanho={18} /> {resumo.alerta.texto}</div>
      )}
      <div className="grade grade--3 painel-kpis">
        <div className="kpi"><span className="kpi__valor">{resumo.total}</span><span className="texto-suave">Ocorrências</span></div>
        <div className="kpi"><span className="kpi__valor">{resumo.alta}</span><span className="texto-suave">Gravidade alta</span></div>
        <div className="kpi"><span className="kpi__valor kpi__valor--texto">{resumo.tipoMaisFrequente || '—'}</span><span className="texto-suave">Tipo mais frequente</span></div>
      </div>
      <p className="texto-suave painel-linha">
        Abertas: {resumo.porStatus.Aberta} · Em atendimento: {resumo.porStatus['Em atendimento']} · Resolvidas: {resumo.porStatus.Resolvida}
      </p>
    </Card>
  )
}
