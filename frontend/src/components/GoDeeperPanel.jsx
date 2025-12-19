import { useState, useEffect } from 'react'
import useStore from '../store'
import apiService from '../api'
import './GoDeeperPanel.css'

function GoDeeperPanel() {
  const {
    selectedName,
    deeperResults,
    setDeeperResults,
    isExploringDeeper,
    setIsExploringDeeper,
    explorationHistory,
    goDeeper,
    goBack,
    clearExploration,
    toggleFavorite,
    isFavorite,
    query,
  } = useStore()

  const [isLoading, setIsLoading] = useState(false)

  // Fetch deeper results when selected name changes or deeperResults is cleared
  useEffect(() => {
    if (selectedName && !deeperResults) {
      fetchDeeperResults()
    }
  }, [selectedName, deeperResults])

  const fetchDeeperResults = async () => {
    if (!selectedName) return

    setIsLoading(true)
    try {
      const results = await apiService.goDeeper(selectedName.name, query)
      setDeeperResults(results)
    } catch (error) {
      console.error('Go Deeper failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameClick = (name) => {
    goDeeper(name)
  }

  const handleClose = () => {
    clearExploration()
  }

  if (!selectedName) return null

  return (
    <div className="go-deeper-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          {explorationHistory.length > 1 && (
            <button className="back-button" onClick={goBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <div className="current-name">
            <span className="exploring-label">Exploring</span>
            <h2>{selectedName.name}</h2>
          </div>
        </div>
        <button className="close-button" onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Breadcrumb */}
      {explorationHistory.length > 1 && (
        <div className="exploration-breadcrumb">
          {explorationHistory.map((name, index) => (
            <span key={name.id || index}>
              {index > 0 && <span className="breadcrumb-arrow">&rarr;</span>}
              <span className={`breadcrumb-item ${index === explorationHistory.length - 1 ? 'active' : ''}`}>
                {name.name}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="panel-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Exploring dimensions...</p>
          </div>
        ) : deeperResults ? (
          <div className="dimension-threads">
            {deeperResults.threads?.map((thread, index) => (
              <div key={index} className="dimension-thread">
                <div className="thread-header">
                  <h3>{thread.title}</h3>
                  <span className="thread-description">{thread.description}</span>
                </div>
                <div className="thread-names">
                  {thread.names?.map((name, nameIndex) => (
                    <div
                      key={nameIndex}
                      className="deeper-name-card"
                      onClick={() => handleNameClick(name)}
                    >
                      <div className="name-main">
                        <span className="name-text">{name.name}</span>
                        <button
                          className={`mini-favorite ${isFavorite(name.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(name)
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill={isFavorite(name.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      </div>
                      <span className="name-meaning">{name.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Click "Go Deeper" on any result to explore</p>
          </div>
        )}
      </div>

      {/* Selected name details */}
      <div className="selected-name-details">
        <div className="detail-row">
          <span className="detail-label">Origin</span>
          <span className="detail-value">{selectedName.origin || selectedName.category}</span>
        </div>
        {selectedName.meaning && (
          <div className="detail-row">
            <span className="detail-label">Meaning</span>
            <span className="detail-value">{selectedName.meaning}</span>
          </div>
        )}
        {selectedName.pronunciation && (
          <div className="detail-row">
            <span className="detail-label">Pronunciation</span>
            <span className="detail-value">{selectedName.pronunciation}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoDeeperPanel
