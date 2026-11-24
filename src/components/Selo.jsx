import Icon from './Icon.jsx'

// Selo de gravidade: cor + ícone + texto (nunca só a cor).
const TOM = { Baixa: ['check', 'baixa'], Média: ['clock', 'media'], Alta: ['alert', 'alta'] }

export default function Selo({ gravidade }) {
  const [icone, tom] = TOM[gravidade] || ['info', 'baixa']
  return (
    <span className={`selo selo--${tom}`}>
      <Icon nome={icone} tamanho={13} /> {gravidade}
    </span>
  )
}
