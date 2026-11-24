// Voz offline dentro do próprio site (Piper em WebAssembly, pacote npm @diffusionstudio/vits-web).
// Funciona depois do `npm install`, sem Python e sem voz instalada no Windows.
// Na primeira vez o navegador baixa o modelo da voz (~60 MB) e guarda em cache; depois disso funciona sem internet.
const VOZ = 'pt_BR-faber-medium'
let modulo = null
let falhou = false
let preparo = null

const avisar = (preparando) => { try { window.dispatchEvent(new CustomEvent('raly:voz-preparando', { detail: preparando })) } catch { /* ignora */ } }

export const vozEmbutidaDisponivel = () => !falhou && typeof WebAssembly !== 'undefined' && typeof Worker !== 'undefined'

// Baixa o modelo uma vez, em segundo plano, para a fala já sair na hora quando a pessoa pedir.
export function prepararVozEmbutida() {
  if (!vozEmbutidaDisponivel()) return Promise.resolve()
  preparo ||= (async () => {
    avisar(true)
    try {
      modulo ||= await import('@diffusionstudio/vits-web')
      if (!(await modulo.stored()).includes(VOZ)) await modulo.download(VOZ)
    } catch { /* sem internet agora: tenta de novo na primeira fala */ preparo = null } finally { avisar(false) }
  })()
  return preparo
}

// Frases já sintetizadas (ou em síntese): evita a pausa de alguns segundos entre uma fala e outra.
const cache = new Map()
function sintetizar(texto) {
  if (!cache.has(texto)) {
    const p = (async () => {
      await prepararVozEmbutida()
      modulo ||= await import('@diffusionstudio/vits-web')
      return modulo.predict({ text: texto, voiceId: VOZ })
    })()
    p.catch(() => cache.delete(texto))
    cache.set(texto, p)
  }
  return cache.get(texto)
}

// Sintetiza uma lista de frases em segundo plano, uma de cada vez.
export async function preSintetizar(textos) {
  for (const t of textos) { try { await sintetizar(t) } catch { return } }
}

// Devolve um <audio> pronto para tocar, ou lança erro.
export async function falarEmbutida(texto) {
  try {
    const wav = await sintetizar(texto)
    const url = URL.createObjectURL(wav)
    const audio = new Audio(url)
    audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
    return audio
  } catch (e) {
    falhou = true
    throw e
  }
}
