import Card from './Card.jsx'
import EmptyState from './EmptyState.jsx'

// Props: trechos, trechoAtualId, contagem (id do trecho -> nº de ocorrências), onSelecionar(id), onCarregarExemplo().
export default function ListaTrechos({ trechos, trechoAtualId, contagem, onSelecionar, onCarregarExemplo }) {
  return (
    <Card titulo="Trechos" subtitulo="Escolha o trecho atual para registrar e consultar ocorrências.">
      {trechos.length === 0 ? (
        <EmptyState icone="list" titulo="Nenhum trecho cadastrado">
          Cadastre um trecho ao lado ou{' '}
          <button type="button" className="link-botao" onClick={onCarregarExemplo}>carregue trechos de exemplo</button>.
        </EmptyState>
      ) : (
        <ul className="lista-trechos">
          {trechos.map((t) => {
            const atual = t.id === trechoAtualId
            return (
              <li key={t.id}>
                <button type="button" className={`trecho-item ${atual ? 'trecho-item--atual' : ''}`} aria-pressed={atual} onClick={() => onSelecionar(t.id)}>
                  <span className="trecho-item__nome">{t.rodovia}</span>
                  <span className="trecho-item__km">km {t.kmInicial} ao {t.kmFinal}</span>
                  <span className="trecho-item__contagem">{contagem[t.id] || 0} ocorr.</span>
                  {atual && <span className="trecho-item__atual">Trecho atual</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
