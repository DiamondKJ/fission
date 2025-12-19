import { useState } from 'react'
import useStore from '../store'
import apiService from '../api'
import './SearchBar.css'

function SearchBar({ centered = false, onSearch = null }) {
  const { query, setQuery, deepMode, toggleDeepMode, setIsSearching, setSearchResults, setThreads, clearResults, maxResults } = useStore()
  const [inputValue, setInputValue] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    if (onSearch) {
      onSearch(inputValue)
      return
    }

    setQuery(inputValue)
    setIsSearching(true)
    clearResults()

    try {
      const data = await apiService.generate(inputValue, maxResults)
      setSearchResults(data.names || [])
      setThreads(data.threads)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Generation failed. Please check if the backend is running.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className={`search-bar ${centered ? 'centered' : ''}`}>
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={centered ? "Describe your business or enter a name to explore..." : "Search names..."}
            className="search-input"
            autoFocus={centered}
          />
          <div className="search-actions">
            <button
              type="button"
              className={`deep-mode-button ${deepMode ? 'active' : ''}`}
              onClick={toggleDeepMode}
              title={deepMode ? 'Deep Mode On' : 'Deep Mode Off'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </button>
            <button type="submit" className="search-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SearchBar
