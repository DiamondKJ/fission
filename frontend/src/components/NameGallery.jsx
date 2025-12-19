import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import useStore from '../store'
import NameCard from './NameCard'
import './NameGallery.css'

// Generate scattered layout positions
function generateScatteredLayout(count, containerWidth, containerHeight) {
  const positions = []
  const centerX = containerWidth / 2
  const centerY = containerHeight / 3

  const seededRandom = (seed) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  for (let i = 0; i < count; i++) {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const angle = i * goldenAngle
    const radius = Math.sqrt(i) * 120

    let x = centerX + Math.cos(angle) * radius
    let y = centerY + Math.sin(angle) * radius

    const noise1 = seededRandom(i * 1.1) - 0.5
    const noise2 = seededRandom(i * 2.3) - 0.5
    const jitterAmount = 60 + seededRandom(i * 3.7) * 80
    x += noise1 * jitterAmount
    y += noise2 * jitterAmount

    const verticalStretch = 0.7 + seededRandom(i * 4.2) * 0.3
    y = centerY + (y - centerY) * verticalStretch

    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
    const normalizedDist = Math.min(distFromCenter / 800, 1)
    const depth = seededRandom(i * 5.5)
    const scale = 0.7 + (1 - normalizedDist * 0.3) * (0.3 + depth * 0.2)
    const zIndex = Math.floor((1 - normalizedDist) * 10 + depth * 5)
    const rotation = (seededRandom(i * 6.1) - 0.5) * 8

    positions.push({ x, y, scale, zIndex, rotation, depth })
  }

  return positions
}

function NameGallery({ exploding = false, names = [] }) {
  const { maxResults, setMaxResults } = useStore()
  // Use passed names prop (which may be filtered) or fall back to empty array
  const displayNames = names
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const [showSlider, setShowSlider] = useState(false)
  const [sliderValue, setSliderValue] = useState(maxResults)
  const sliderRef = useRef(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const layoutDimensions = useMemo(() => {
    const baseSize = Math.sqrt(displayNames.length) * 280
    const layoutWidth = Math.max(containerSize.width * 2, baseSize, 2000)
    const layoutHeight = Math.max(containerSize.height * 2, baseSize * 0.8, 1600)
    return { layoutWidth, layoutHeight }
  }, [displayNames.length, containerSize])

  const positions = useMemo(() => {
    return generateScatteredLayout(displayNames.length, layoutDimensions.layoutWidth, layoutDimensions.layoutHeight)
  }, [displayNames.length, layoutDimensions])

  useEffect(() => {
    if (displayNames.length > 0 && containerSize.width > 0) {
      const { layoutWidth, layoutHeight } = layoutDimensions
      const layoutCenterX = layoutWidth / 2
      const layoutCenterY = layoutHeight / 3
      const centerPanX = (containerSize.width / 2) - layoutCenterX
      const centerPanY = (containerSize.height / 2) - layoutCenterY
      setPan({ x: centerPanX, y: centerPanY })
      setZoom(1)
    }
  }, [displayNames.length, containerSize, layoutDimensions])

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('gallery-canvas') || e.target.classList.contains('name-gallery')) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y
      }
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const zoomToCenter = useCallback((newZoom) => {
    const clampedZoom = Math.max(0.3, Math.min(2, newZoom))
    const viewportCenterX = containerSize.width / 2
    const viewportCenterY = containerSize.height / 2
    const contentX = (viewportCenterX - pan.x) / zoom
    const contentY = (viewportCenterY - pan.y) / zoom
    const newPanX = viewportCenterX - contentX * clampedZoom
    const newPanY = viewportCenterY - contentY * clampedZoom
    setPan({ x: newPanX, y: newPanY })
    setZoom(clampedZoom)
  }, [containerSize, pan, zoom])

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    zoomToCenter(zoom + delta)
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target)) {
        setShowSlider(false)
        setSliderValue(maxResults)
      }
    }
    if (showSlider) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSlider, maxResults])

  const canvasStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <div
      ref={containerRef}
      className="name-gallery"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div className={`gallery-canvas ${exploding ? 'exploding' : ''}`} style={canvasStyle}>
        {displayNames.map((name, index) => (
          <NameCard
            key={name.id}
            name={name}
            position={positions[index]}
            index={index}
            exploding={exploding}
            centerX={layoutDimensions.layoutWidth / 2}
            centerY={layoutDimensions.layoutHeight / 3}
          />
        ))}
      </div>

      {/* Result count badge */}
      <div className="result-badge-container" ref={sliderRef}>
        <button
          className="result-badge"
          onClick={() => {
            setSliderValue(maxResults)
            setShowSlider(!showSlider)
          }}
        >
          {displayNames.length} names
          <svg className="badge-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {showSlider && (
          <div className="slider-popup">
            <div className="slider-header">
              <span>Number of names</span>
              <span className="slider-value">{sliderValue}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="name-count-slider"
            />
            <div className="slider-labels">
              <span>10</span>
              <span>100</span>
            </div>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button onClick={() => zoomToCenter(zoom + 0.2)}>+</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomToCenter(zoom - 0.2)}>-</button>
      </div>
    </div>
  )
}

export default NameGallery
