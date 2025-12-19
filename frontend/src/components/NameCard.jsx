import { useState } from 'react'
import useStore from '../store'
import './NameCard.css'

// Category color mapping
const categoryColors = {
  mythology: 'var(--cat-mythology)',
  scientific: 'var(--cat-scientific)',
  modern: 'var(--cat-modern)',
  nature: 'var(--cat-nature)',
  abstract: 'var(--cat-abstract)',
  historical: 'var(--cat-historical)',
  default: 'var(--accent)',
}

function NameCard({ name, position, index, exploding, centerX, centerY }) {
  const [isHovered, setIsHovered] = useState(false)
  const { goDeeper, toggleFavorite, isFavorite } = useStore()

  const favorite = isFavorite(name.id)
  const categoryColor = categoryColors[name.category] || categoryColors.default

  const offsetX = centerX - position.x
  const offsetY = centerY - position.y
  const explosionDelay = exploding ? Math.min(index * 20, 600) : 0

  const style = {
    transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
    left: position.x,
    top: position.y,
    zIndex: isHovered ? 100 : position.zIndex,
    '--explosion-delay': `${explosionDelay}ms`,
    '--offset-x': `${offsetX}px`,
    '--offset-y': `${offsetY}px`,
    '--final-scale': position.scale,
    '--final-rotation': `${position.rotation}deg`,
    '--category-color': categoryColor,
  }

  const handleClick = (e) => {
    e.stopPropagation()
    goDeeper(name)
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    toggleFavorite(name)
  }

  return (
    <div
      className={`name-card ${isHovered ? 'hovered' : ''} ${exploding ? 'exploding' : ''}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="name-card-content">
        <span className="category-badge" style={{ background: categoryColor }}>
          {name.category}
        </span>
        <h3 className="name-text">{name.name}</h3>
        <p className="name-meaning">{name.meaning}</p>
      </div>

      <button
        className={`favorite-button ${favorite ? 'active' : ''}`}
        onClick={handleFavorite}
        title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div className="go-deeper-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
        <span>Go Deeper</span>
      </div>
    </div>
  )
}

export default NameCard
