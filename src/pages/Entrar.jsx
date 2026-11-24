import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import RalyRosto from '../components/RalyRosto.jsx'
import SubNav from '../components/SubNav.jsx'
import { Texto } from '../components/Campo.jsx'
import { forcaSenha } from '../utils/auth.js'

function Forca({ senha }) {
  if (!senha) return null
  const f = forcaSenha(senha)
  return (
    <div className="forca" aria-live="polite">
      <span className="forca__barra">{[1, 2, 3, 4].map((n) => <i key={n} className={f.nivel >= n ? `forca__on forca__on--${f.nivel}` : ''} />)}</span>
      <span>Senha: {f.rotulo}</span>
    </div>
  )
}

// Entrar e criar conta. `motivo` explica por que a pessoa caiu aqui (ex.: página restrita).
// `permitirCriar` só é ligado no TicketRal: é o único lugar do site onde se cria conta (de passageiro).
export default function Entrar({ auth, navegar, motivo, destino, permitirCriar = false }) {
  const [aba, setAba] = useState('entrar')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [ver, setVer] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    let r
    try { r = aba === 'entrar' ? await auth.entrar(usuario, senha) : await auth.cadastrar({ nome, usuario, senha }) } catch { r = { ok: false, erro: 'Nao foi possivel concluir agora. Recarregue a pagina e tente de novo.' } }
    setCarregando(false)
    if (!r.ok) { setErro(r.erro); return }
    if (destino) navegar(destino.pagina, destino.sub || null)
    else navegar(r.sessao?.perfil === 'passageiro' ? 'ticketral' : 'inicio')
  }

  const estado = carregando ? 'falando' : (usuario || senha || nome) ? 'ouvindo' : 'pronto'

  return (
    <div className="pagina">
      <div className="login login--simples">
        <section className="login__cartao login__cartao--vivo" key={aba}>
          <div className="login__topo">
            <span className="login__rosto"><RalyRosto tamanho={72} estado={estado} /></span>
            <div>
              <h1>{permitirCriar ? 'TicketRal' : 'Entrar no Raly'}</h1>
              {permitirCriar && <p className="texto-suave">Conta de passageiro.</p>}
            </div>
          </div>
          {motivo && <p className="aviso aviso--info" role="status"><Icon nome="lock" tamanho={16} /> {motivo}</p>}
          {permitirCriar && <SubNav itens={[{ id: 'entrar', rotulo: 'Entrar' }, { id: 'criar', rotulo: 'Criar conta' }]} atual={aba} onMudar={(a) => { setAba(a); setErro('') }} rotulo="Entrar ou criar conta" />}
          <form onSubmit={enviar} className="login__form" noValidate>
            {aba === 'criar' && <Texto rotulo="Nome" valor={nome} onChange={setNome} id="login-nome" obrigatorio />}
            <Texto rotulo={aba === 'entrar' ? 'E-mail ou usuário' : 'E-mail'} valor={usuario} onChange={setUsuario} tipo={aba === 'entrar' ? 'text' : 'email'} id="login-usuario" obrigatorio />
            <div className="campo-senha">
              <Texto rotulo="Senha" valor={senha} onChange={setSenha} tipo={ver ? 'text' : 'password'} id="login-senha" obrigatorio />
              <button type="button" className="btn btn--secundario" onClick={() => setVer((v) => !v)} aria-pressed={ver}>{ver ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            {aba === 'criar' && <Forca senha={senha} />}
            {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
            <button type="submit" className="btn btn--primario login__enviar" disabled={carregando}>
              <Icon nome="lock" tamanho={16} /> {carregando ? 'Verificando…' : aba === 'entrar' ? 'Entrar' : 'Criar conta e entrar'}
            </button>
          </form>
        </section>

      </div>
    </div>
  )
}
