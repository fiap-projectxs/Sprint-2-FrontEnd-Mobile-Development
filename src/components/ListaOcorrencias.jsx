import Card from './Card.jsx'
import EmptyState from './EmptyState.jsx'
import Selo from './Selo.jsx'
import { Selecao } from './Campo.jsx'
import { GRAVIDADES, STATUS, TIPOS } from '../utils/trechos.js'
import { formatarDataHora } from '../utils/datas.js'

// Props: ocorrencias (já filtradas), totalNoTrecho, filtros {gravidade, tipo}, onFiltros(novos), onStatus(id, status), temTrecho.
export default function ListaOcorrencias({ ocorrencias, totalNoTrecho, filtros, onFiltros, onStatus, temTrecho }) {
  const mudar = (k) => (v) => onFiltros({ ...filtros, [k]: v })
  const filtrando = Boolean(filtros.gravidade || filtros.tipo)
  return (
    <Card titulo="Ocorrências do trecho" subtitulo={temTrecho ? `${ocorrencias.length} de ${totalNoTrecho} exibidas` : undefined}>
      <div className="filtros">
        <Selecao id="f-grav" rotulo="Filtrar por gravidade" valor={filtros.gravidade} onChange={mudar('gravidade')} opcoes={GRAVIDADES} todas="Todas" />
        <Selecao id="f-tipo" rotulo="Filtrar por tipo" valor={filtros.tipo} onChange={mudar('tipo')} opcoes={TIPOS} todas="Todos" />
        {filtrando && <button type="button" className="btn btn--secundario btn--pequeno" onClick={() => onFiltros({ gravidade: '', tipo: '' })}>Limpar filtros</button>}
      </div>
      {!temTrecho ? (
        <EmptyState icone="list" titulo="Nenhum trecho selecionado">Cadastre ou selecione um trecho para ver as ocorrências.</EmptyState>
      ) : totalNoTrecho === 0 ? (
        <EmptyState icone="inbox" titulo="Nenhuma ocorrência neste trecho">Use o formulário para registrar a primeira.</EmptyState>
      ) : ocorrencias.length === 0 ? (
        <EmptyState icone="search" titulo="Nenhuma ocorrência com esses filtros">Limpe os filtros para ver todas.</EmptyState>
      ) : (
        <ul className="lista-oc">
          {ocorrencias.map((o) => (
            <li key={o.id} className="oc">
              <div className="oc__topo">
                <strong>{o.tipo}</strong>
                <Selo gravidade={o.gravidade} />
                <span className="texto-suave">{o.id}</span>
              </div>
              <p className="oc__desc">{o.descricao}</p>
              <p className="texto-suave oc__meta">{o.km != null ? `km ${o.km} · ` : ''}registrada em {formatarDataHora(o.criadoEm)}</p>
              <label className="campo oc__status" htmlFor={`st-${o.id}`}>
                <span>Status</span>
                <select id={`st-${o.id}`} value={o.status} onChange={(e) => onStatus(o.id, e.target.value)}>
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
