import { useState } from 'react'
import Card from './Card.jsx'
import { Selecao, Texto } from './Campo.jsx'
import { GRAVIDADES, TIPOS, validarOcorrencia } from '../utils/trechos.js'

const VAZIO = { tipo: 'Vegetação', gravidade: 'Média', descricao: '', km: '' }

// Props: trecho (trecho atual ou undefined) e onRegistrar(ocorrencia). A ocorrência já sai com trechoId, data e hora.
export default function FormOcorrencia({ trecho, onRegistrar }) {
  const [campos, setCampos] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const mudar = (k) => (v) => { setCampos((c) => ({ ...c, [k]: v })); setErros((e) => ({ ...e, [k]: undefined, geral: undefined })) }

  function enviar(e) {
    e.preventDefault()
    const r = validarOcorrencia(campos, trecho)
    if (!r.ok) { setErros(r.erros); return }
    onRegistrar(r.ocorrencia)
    setCampos(VAZIO)
    setErros({})
  }

  return (
    <Card titulo="Registrar ocorrência" subtitulo={trecho ? `Trecho atual: ${trecho.rodovia}, km ${trecho.kmInicial} ao ${trecho.kmFinal}` : 'Selecione um trecho para registrar.'}>
      <form className="form-op" onSubmit={enviar} noValidate>
        <div className="form-op__linha">
          <Selecao id="oc-tipo" rotulo="Tipo" valor={campos.tipo} onChange={mudar('tipo')} opcoes={TIPOS} todas={null} />
          <Selecao id="oc-grav" rotulo="Gravidade" valor={campos.gravidade} onChange={mudar('gravidade')} opcoes={GRAVIDADES} todas={null} />
        </div>
        <div>
          <Texto id="oc-km" rotulo="Km (opcional)" tipo="number" valor={campos.km} onChange={mudar('km')} placeholder={trecho ? String(trecho.kmInicial) : ''} />
          {erros.km && <p className="erro-campo" role="alert">{erros.km}</p>}
        </div>
        <div>
          <Texto id="oc-desc" rotulo="Descrição" linhas={3} valor={campos.descricao} onChange={mudar('descricao')} placeholder="Ex.: mato alto cobrindo a placa no acostamento" obrigatorio />
          {erros.descricao && <p className="erro-campo" role="alert">{erros.descricao}</p>}
        </div>
        {erros.geral && <p className="erro-campo" role="alert">{erros.geral}</p>}
        <button type="submit" className="btn btn--primario" disabled={!trecho}>Registrar ocorrência</button>
      </form>
    </Card>
  )
}
