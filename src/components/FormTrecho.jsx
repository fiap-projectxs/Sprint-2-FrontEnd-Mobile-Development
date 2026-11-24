import { useState } from 'react'
import Card from './Card.jsx'
import { Texto } from './Campo.jsx'
import { validarTrecho } from '../utils/trechos.js'

// Formulário controlado de cadastro de trecho. Props: trechos (para evitar duplicado) e onCadastrar(trecho).
export default function FormTrecho({ trechos, onCadastrar }) {
  const [campos, setCampos] = useState({ rodovia: '', kmInicial: '', kmFinal: '' })
  const [erros, setErros] = useState({})
  const mudar = (k) => (v) => { setCampos((c) => ({ ...c, [k]: v })); setErros((e) => ({ ...e, [k]: undefined })) }

  function enviar(e) {
    e.preventDefault()
    const r = validarTrecho(campos, trechos)
    if (!r.ok) { setErros(r.erros); return }
    onCadastrar(r.trecho)
    setCampos({ rodovia: '', kmInicial: '', kmFinal: '' })
    setErros({})
  }

  return (
    <Card titulo="Cadastrar trecho" subtitulo="Nome da rodovia e quilometragem inicial e final.">
      <form className="form-op" onSubmit={enviar} noValidate>
        <Texto id="tr-rodovia" rotulo="Nome da rodovia" valor={campos.rodovia} onChange={mudar('rodovia')} placeholder="Ex.: DEMO-101" obrigatorio />
        {erros.rodovia && <p className="erro-campo" role="alert">{erros.rodovia}</p>}
        <div className="form-op__linha">
          <div>
            <Texto id="tr-ini" rotulo="Km inicial" tipo="number" valor={campos.kmInicial} onChange={mudar('kmInicial')} placeholder="38" obrigatorio />
            {erros.kmInicial && <p className="erro-campo" role="alert">{erros.kmInicial}</p>}
          </div>
          <div>
            <Texto id="tr-fim" rotulo="Km final" tipo="number" valor={campos.kmFinal} onChange={mudar('kmFinal')} placeholder="52" obrigatorio />
            {erros.kmFinal && <p className="erro-campo" role="alert">{erros.kmFinal}</p>}
          </div>
        </div>
        <button type="submit" className="btn btn--primario">Cadastrar trecho</button>
      </form>
    </Card>
  )
}
