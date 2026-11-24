// Autenticação SIMULADA no navegador (demonstração). Não oferece segurança real:
// os dados ficam no armazenamento local e qualquer pessoa com acesso ao navegador pode alterá-los.
// Mesmo assim, as senhas nunca são guardadas em texto: usam PBKDF2 com sal por usuário.
import { USUARIOS_DEMO } from '../demo/usuarios.js'
import { CONTAS_BASE } from '../data/contasBase.js'

const CHAVE_USUARIOS = 'raly:usuarios:v2'
const CHAVE_AUDITORIA = 'raly:auditoria'
const CHAVE_SESSAO = 'raly:sessao'
const CHAVE_BASE = 'raly:contas-base:v1'

function ler(armazem, chave, padrao) {
  try { const b = armazem.getItem(chave); return b ? JSON.parse(b) : padrao } catch { return padrao }
}
function gravar(armazem, chave, valor) {
  try { armazem.setItem(chave, JSON.stringify(valor)) } catch { /* sem armazenamento: vale só nesta aba */ }
}
const local = () => (typeof window !== 'undefined' ? window.localStorage : null)
const aba = () => (typeof window !== 'undefined' ? window.sessionStorage : null)

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
export function novoSal() {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return hex(a)
}
// PBKDF2-HMAC-SHA256 em JS puro: so entra quando o navegador nao oferece crypto.subtle
// (acontece em http://IP-da-rede, que nao e um contexto seguro). Gera o mesmo resultado do nativo.
const K256 = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2])
function sha256js(dados) {
  const h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19])
  const n = dados.length
  const total = ((n + 9 + 63) >> 6) << 6
  const m = new Uint8Array(total)
  m.set(dados); m[n] = 0x80
  const dv = new DataView(m.buffer)
  dv.setUint32(total - 4, (n * 8) >>> 0); dv.setUint32(total - 8, Math.floor((n * 8) / 4294967296))
  const w = new Uint32Array(64)
  for (let o = 0; o < total; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4)
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2]
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3)
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0
    }
    let [a, b, c, d, e, f, g, hh] = h
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K256[i] + w[i]) | 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh
  }
  const saida = new Uint8Array(32)
  const dvs = new DataView(saida.buffer)
  for (let i = 0; i < 8; i++) dvs.setUint32(i * 4, h[i])
  return saida
}
function pbkdf2js(senha, sal, iteracoes) {
  const enc = new TextEncoder()
  let chave = enc.encode(senha)
  if (chave.length > 64) chave = sha256js(chave)
  const ipad = new Uint8Array(64).fill(0x36), opad = new Uint8Array(64).fill(0x5c)
  chave.forEach((b, i) => { ipad[i] ^= b; opad[i] ^= b })
  const hmac = (msg) => {
    const i1 = new Uint8Array(64 + msg.length); i1.set(ipad); i1.set(msg, 64)
    const interno = sha256js(i1)
    const o1 = new Uint8Array(96); o1.set(opad); o1.set(interno, 64)
    return sha256js(o1)
  }
  const s = enc.encode(sal)
  const bloco = new Uint8Array(s.length + 4); bloco.set(s); bloco[s.length + 3] = 1
  let u = hmac(bloco)
  const t = new Uint8Array(u)
  for (let i = 1; i < iteracoes; i++) { u = hmac(u); for (let j = 0; j < 32; j++) t[j] ^= u[j] }
  return t
}
export async function hashSenha(senha, sal) {
  if (!globalThis.crypto?.subtle) return hex(pbkdf2js(senha, sal, 100000))
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(sal), iterations: 100000, hash: 'SHA-256' }, chave, 256)
  return hex(bits)
}

export async function criarRegistro({ id, nome, usuario, senha, perfil }) {
  const sal = novoSal()
  return { id, nome, usuario: usuario.trim().toLowerCase(), perfil, ativo: true, sal, hash: await hashSenha(senha, sal), criadoEm: new Date().toISOString(), ultimoAcesso: null }
}

export async function carregarUsuarios() {
  let lista = ler(local(), CHAVE_USUARIOS, null)
  if (!lista?.length) {
    // Contas de demonstração só em desenvolvimento ou com VITE_SEED_DEMO=true.
    const semear = import.meta.env.VITE_SEED_DEMO === 'true'
    lista = semear ? await Promise.all(USUARIOS_DEMO.map((u) => criarRegistro(u))) : []
  }
  // Contas iniciais de cada área (Raly e SmartDeskAI): criadas uma única vez; depois a pessoa pode trocar login e senha.
  if (!ler(local(), CHAVE_BASE, false)) {
    const novas = await Promise.all(CONTAS_BASE.filter((c) => !lista.some((x) => x.id === c.id)).map(async (c) => ({ ...(await criarRegistro(c)), senhaInicial: true })))
    lista = [...lista, ...novas]
    gravar(local(), CHAVE_BASE, true)
  }
  gravar(local(), CHAVE_USUARIOS, lista)
  return lista
}
export const salvarUsuarios = (lista) => gravar(local(), CHAVE_USUARIOS, lista)

export const carregarAuditoria = () => ler(local(), CHAVE_AUDITORIA, [])
export const salvarAuditoria = (lista) => gravar(local(), CHAVE_AUDITORIA, lista.slice(0, 300))

export const carregarSessao = () => ler(aba(), CHAVE_SESSAO, null)
export const salvarSessao = (s) => { try { if (s) aba().setItem(CHAVE_SESSAO, JSON.stringify(s)); else aba().removeItem(CHAVE_SESSAO) } catch { /* ignora */ } }

export async function conferirSenha(registro, senha) {
  return (await hashSenha(senha, registro.sal)) === registro.hash
}

// Força da senha: 0 a 4.
export function forcaSenha(s) {
  let n = 0
  if (s.length >= 8) n++
  if (s.length >= 12) n++
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) n++
  return { nivel: s.length < 8 ? Math.min(n, 1) : n, rotulo: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][s.length < 8 ? Math.min(n, 1) : n] }
}
// Validação de formato (sem servidor, não há como confirmar que a caixa de e-mail existe).
export const ehEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim()) && String(s).trim().length <= 120
export const senhaValida = (s) => s.length >= 8

export const sessaoDe = (u) => ({ id: u.id, nome: u.nome, usuario: u.usuario, perfil: u.perfil })
