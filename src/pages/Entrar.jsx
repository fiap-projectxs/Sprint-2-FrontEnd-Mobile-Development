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
export default function Entrar({ auth, navegar, motivo, destino }) {
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
    const r = aba === 'entrar' ? await auth.entrar(usuario, senha) : await auth.cadastrar({ nome, usuario, senha })
    setCarregando(false)
    if (!r.ok) { setErro(r.erro); return }
    if (destino) navegar(destino.pagina, destino.sub || null)
    else navegar('inicio')
  }

  const passos = aba === 'criar'
    ? [{ ok: nome.trim().length >= 2, r: 'Nome' }, { ok: /^\S+@\S+\.\S+$/.test(usuario), r: 'E-mail' }, { ok: senha.length >= 8, r: 'Senha' }]
    : [{ ok: /^\S+@\S+\.\S+$/.test(usuario), r: 'E-mail' }, { ok: senha.length >= 1, r: 'Senha' }]
  const feitos = passos.filter((p) => p.ok).length
  const estado = carregando ? 'falando' : (usuario || senha || nome) ? 'ouvindo' : 'pronto'
  const beneficios = aba === 'entrar'
    ? [['mic', 'Raly por voz', 'Converse com o assistente das rodovias.'], ['lock', 'Acesso por perfil', 'Cada módulo aparece para quem pode usar.'], ['info', 'Tudo no navegador', 'Sem servidor, só demonstração.']]
    : [['mic', 'Conta de passageiro', 'Registre um ticket ou fale com o suporte.'], ['lock', 'Senha com hash', 'Guardada protegida neste navegador.'], ['info', 'Perfis especiais', 'Agente, coordenador e admin vêm do administrador.']]

  return (
    <div className="pagina">
      <div className="login">
        <section className="login__cartao login__cartao--vivo" key={aba}>
          <div className="login__topo">
            <span className="login__rosto"><RalyRosto tamanho={72} estado={estado} /></span>
            <div>
              <h1>{aba === 'entrar' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
              <p className="texto-suave">{aba === 'entrar' ? 'Entre para liberar os módulos do seu perfil.' : 'Leva menos de um minuto. Preencha os três passos.'}</p>
            </div>
          </div>
          {motivo && <p className="aviso aviso--info" role="status"><Icon nome="lock" tamanho={16} /> {motivo}</p>}
          <SubNav itens={[{ id: 'entrar', rotulo: 'Entrar' }, { id: 'criar', rotulo: 'Criar conta' }]} atual={aba} onMudar={(a) => { setAba(a); setErro('') }} rotulo="Entrar ou criar conta" />
          <ol className="passos" aria-label="Progresso do formulário">
            {passos.map((p, i) => (
              <li key={p.r} className={p.ok ? 'passos__ok' : ''}><span>{p.ok ? '✓' : i + 1}</span>{p.r}</li>
            ))}
            <li className="passos__trilha" aria-hidden="true"><i style={{ width: `${(feitos / passos.length) * 100}%` }} /></li>
          </ol>
          <form onSubmit={enviar} className="login__form" noValidate>
            {aba === 'criar' && <Texto rotulo="Nome" valor={nome} onChange={setNome} id="login-nome" obrigatorio />}
            <Texto rotulo="E-mail" valor={usuario} onChange={setUsuario} tipo="email" id="login-usuario" obrigatorio />
            <div className="campo-senha">
              <Texto rotulo="Senha" valor={senha} onChange={setSenha} tipo={ver ? 'text' : 'password'} id="login-senha" obrigatorio />
              <button type="button" className="btn btn--secundario" onClick={() => setVer((v) => !v)} aria-pressed={ver}>{ver ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            {aba === 'criar' && <Forca senha={senha} />}
            {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
            <button type="submit" className="btn btn--primario login__enviar" disabled={carregando || !auth.pronto}>
              <Icon nome="lock" tamanho={16} /> {carregando ? 'Verificando…' : aba === 'entrar' ? 'Entrar' : 'Criar conta e entrar'}
            </button>
          </form>
          <p className="texto-suave login__troca">
            {aba === 'entrar' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button type="button" className="link-botao" onClick={() => { setAba(aba === 'entrar' ? 'criar' : 'entrar'); setErro('') }}>{aba === 'entrar' ? 'Criar agora' : 'Entrar'}</button>
          </p>
        </section>

        <aside className="login__lado" key={`lado-${aba}`}>
          <h2>{aba === 'entrar' ? 'Cada perfil, seu acesso' : 'O que você ganha'}</h2>
          <ul className="login__beneficios">
            {beneficios.map(([ic, t, d]) => (
              <li key={t}><span className="login__ic"><Icon nome={ic} tamanho={18} /></span><div><strong>{t}</strong><p className="texto-suave">{d}</p></div></li>
            ))}
          </ul>
          <div className="login__perfis" aria-label="Perfis de acesso">
            <span>Passageiro</span><span>Agente</span><span>Coordenador</span><span>Admin</span>
          </div>
          <p className="texto-suave"><Icon nome="info" tamanho={14} /> Login simulado no navegador, sem segurança real. O e-mail é validado só no formato.</p>
        </aside>
      </div>
    </div>
  )
}
