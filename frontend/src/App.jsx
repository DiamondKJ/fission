import { useState, useEffect, useRef } from 'react'
import useStore from './store'
import apiService from './api'
import SearchBar from './components/SearchBar'
import NameGallery from './components/NameGallery'
import GoDeeperPanel from './components/GoDeeperPanel'
import Controls from './components/Controls'
import DarkModeToggle from './components/DarkModeToggle'
import CategoryFilter from './components/CategoryFilter'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [animationPhase, setAnimationPhase] = useState('idle')
  const [pendingResults, setPendingResults] = useState(null)
  const animationStartTime = useRef(null)

  const {
    isSearching,
    searchResults,
    selectedName,
    query,
    setQuery,
    setIsSearching,
    setSearchResults,
    setThreads,
    clearResults,
    deepMode,
    darkMode,
    maxResults,
    setMaxResults,
    clearExploration,
  } = useStore()

  useEffect(() => {
    apiService.healthCheck().then(setHealthStatus)
  }, [])

  // Handle Escape key to close panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedName) {
          clearExploration()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedName, clearExploration])

  // Perform search with animation
  const performSearch = async (searchQuery) => {
    if (animationPhase !== 'idle' && animationPhase !== 'done') return

    setQuery(searchQuery)
    clearResults()
    setPendingResults(null)

    setAnimationPhase(deepMode ? 'sucking-deep' : 'sucking')
    animationStartTime.current = Date.now()

    const minAnimationDuration = deepMode ? 3000 : 1500

    try {
      const dataPromise = apiService.generate(searchQuery, maxResults)

      const [data] = await Promise.all([
        dataPromise,
        new Promise(resolve => setTimeout(resolve, minAnimationDuration))
      ])

      setPendingResults(data)
      setAnimationPhase('collapsing')

      setTimeout(() => {
        setAnimationPhase('exploding')
        setSearchResults(data.names || [])
        setThreads(data.threads)

        setTimeout(() => {
          setAnimationPhase('done')
        }, 1500)
      }, 400)

    } catch (error) {
      console.error('Search failed:', error)
      setAnimationPhase('idle')
      alert('Generation failed. Please check if the backend is running.')
    }
  }

  const showHeader = searchResults.length > 0 || animationPhase === 'done'
  const showWelcomeContainer = animationPhase !== 'done'
  const hideWelcome = animationPhase === 'exploding' || animationPhase === 'done'
  const showResults = (animationPhase === 'exploding' || animationPhase === 'done') && searchResults.length > 0
  const isSucking = animationPhase === 'sucking' || animationPhase === 'sucking-deep'

  const goHome = () => {
    setAnimationPhase('idle')
    clearResults()
    setPendingResults(null)
    setMaxResults(50)
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      {showHeader && (
        <header className="app-header">
          <button className="logo" onClick={goHome}>
            <div className="logo-icon">
              <svg viewBox="0 0 32 32" fill="none">
                {/* Fission atom icon */}
                <circle cx="16" cy="16" r="3" fill="currentColor"/>
                <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 16 16)"/>
                <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 16 16)"/>
              </svg>
            </div>
          </button>

          <SearchBar onSearch={performSearch} />

          <div className="header-actions">
            <DarkModeToggle />
            <div className="health-indicator">
              {healthStatus?.status === 'healthy' && (
                <span className="status-dot healthy" title="Connected"></span>
              )}
              {healthStatus?.status === 'error' && (
                <span className="status-dot error" title="Disconnected"></span>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`app-main ${!showHeader ? 'full-height' : ''}`}>

        {/* Welcome Screen */}
        {showWelcomeContainer && (
          <div className={`welcome-container ${animationPhase} ${hideWelcome ? 'hidden' : ''}`}>
            <div className={`welcome-header ${isSucking ? 'sucking' : ''}`}>
              <div className="logo-icon large">
                <svg viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="3" fill="currentColor"/>
                  <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
                  <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 16 16)"/>
                  <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 16 16)"/>
                </svg>
              </div>
              <DarkModeToggle className="welcome-toggle" />
            </div>

            <div className="welcome-screen">
              {/* Background animation */}
              <div className={`background-fission ${animationPhase} ${isSucking ? 'sucking' : ''}`}>
                <div className="nucleus"></div>
                <div className="electron-orbit orbit-1"><div className="electron"></div></div>
                <div className="electron-orbit orbit-2"><div className="electron"></div></div>
                <div className="electron-orbit orbit-3"><div className="electron"></div></div>
              </div>

              <div className={`welcome-search ${isSucking ? 'sucking' : ''}`}>
                <h1 className="welcome-title">Fission</h1>
                <p className="welcome-subtitle">Split ideas into powerful names</p>
                <SearchBar centered onSearch={performSearch} />
              </div>

              <div className={`example-queries ${isSucking ? 'sucking' : ''}`}>
                <button onClick={() => performSearch('Hyperion')}>
                  Hyperion
                </button>
                <button onClick={() => performSearch('AI startup for creators')}>
                  AI Startup
                </button>
                <button onClick={() => performSearch('Premium sustainable fashion')}>
                  Fashion Brand
                </button>
                <button onClick={() => performSearch('Fintech for Gen Z')}>
                  Fintech
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <>
            <CategoryFilter />
            <NameGallery names={searchResults} exploding={animationPhase === 'exploding'} />
            <Controls />
          </>
        )}

        {/* Go Deeper Panel */}
        {selectedName && <GoDeeperPanel />}
      </main>
    </div>
  )
}

export default App
