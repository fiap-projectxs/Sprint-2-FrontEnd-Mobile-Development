import RalyRosto from './RalyRosto.jsx'

// Tela de carregamento rápida entre seções: robô, barra de progresso e nome do destino.
export default function Transicao({ rotulo }) {
  return (
    <div className="transicao" role="status" aria-live="polite">
      <div className="transicao__miolo">
        <span className="transicao__rosto"><RalyRosto tamanho={72} estado="falando" /></span>
        <strong className="transicao__rotulo">{rotulo}</strong>
        <span className="transicao__barra" aria-hidden="true"><i /></span>
      </div>
    </div>
  )
}
