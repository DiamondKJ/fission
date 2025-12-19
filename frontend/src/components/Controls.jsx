import useStore from '../store'
import './Controls.css'

function Controls() {
  const { favoriteNames, clearExploration, selectedName } = useStore()

  return (
    <div className="controls">
      {favoriteNames.length > 0 && (
        <div className="favorites-info">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{favoriteNames.length} saved</span>
        </div>
      )}

      <div className="hint">
        <p>Drag to pan | Scroll to zoom | Click to explore</p>
      </div>
    </div>
  )
}

export default Controls
