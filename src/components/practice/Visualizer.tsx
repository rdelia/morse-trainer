import './Visualizer.css'

export function Visualizer({ active }: { active: boolean }) {
  return (
    <div className={`viz ${active ? 'viz--on' : ''}`} aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}
