import { useMemo, useState } from 'react'
import FormTrecho from '../components/FormTrecho.jsx'
import ListaTrechos from '../components/ListaTrechos.jsx'
import FormOcorrencia from '../components/FormOcorrencia.jsx'
import ListaOcorrencias from '../components/ListaOcorrencias.jsx'
import PainelTrecho from '../components/PainelTrecho.jsx'
import { analisarTrecho } from '../utils/analisarTrecho.js'
import { filtrarOcorrencias, ocorrenciasDoTrecho } from '../utils/trechos.js'

// Tela da Sprint 2. O estado vive no App; aqui só há o estado dos filtros (é só de tela).
export default function Operacao({ trechos, trechoAtualId, ocorrencias, onCadastrarTrecho, onSelecionarTrecho, onCarregarExemplo, onRegistrarOcorrencia, onStatusOcorrencia }) {
  const [filtros, setFiltros] = useState({ gravidade: '', tipo: '' })
  const trecho = trechos.find((t) => t.id === trechoAtualId)

  // Isolamento: tudo abaixo trabalha só com as ocorrências do trecho atual.
  const doTrecho = useMemo(() => ocorrenciasDoTrecho(ocorrencias, trechoAtualId), [ocorrencias, trechoAtualId])
  const visiveis = useMemo(() => filtrarOcorrencias(doTrecho, filtros), [doTrecho, filtros])
  const resumo = useMemo(() => analisarTrecho(doTrecho), [doTrecho])
  const contagem = useMemo(() => {
    const c = {}
    for (const o of ocorrencias) c[o.trechoId] = (c[o.trechoId] || 0) + 1
    return c
  }, [ocorrencias])

  return (
    <div className="pagina">
      <div className="pagina__topo">
        <div>
          <h1>Trechos e ocorrências</h1>
          <p className="texto-suave">Cadastre trechos, registre ocorrências e acompanhe cada trecho. Os dados ficam neste navegador (<code>localStorage</code>) e continuam depois do F5.</p>
        </div>
      </div>
      <div className="grade grade--2">
        <FormTrecho trechos={trechos} onCadastrar={onCadastrarTrecho} />
        <ListaTrechos trechos={trechos} trechoAtualId={trechoAtualId} contagem={contagem} onSelecionar={(id) => { setFiltros({ gravidade: '', tipo: '' }); onSelecionarTrecho(id) }} onCarregarExemplo={onCarregarExemplo} />
      </div>
      <PainelTrecho trecho={trecho} resumo={resumo} />
      <div className="grade grade--2">
        <FormOcorrencia key={trechoAtualId || 'sem-trecho'} trecho={trecho} onRegistrar={onRegistrarOcorrencia} />
        <ListaOcorrencias ocorrencias={visiveis} totalNoTrecho={doTrecho.length} filtros={filtros} onFiltros={setFiltros} onStatus={onStatusOcorrencia} temTrecho={Boolean(trecho)} />
      </div>
    </div>
  )
}
