import { useState, useEffect } from 'react'
import useStore from '../store'
import apiService from '../api'
import './CategoryFilter.css'

function CategoryFilter() {
  const { searchResults, setSearchResults } = useStore()
  const [categories, setCategories] = useState([])
  const [activeFilters, setActiveFilters] = useState([])
  const [allNames, setAllNames] = useState([])

  // Fetch categories on mount
  useEffect(() => {
    apiService.getCategories().then(data => {
      setCategories(data.categories || [])
    })
  }, [])

  // Store all names when results change
  useEffect(() => {
    if (searchResults.length > 0 && allNames.length === 0) {
      setAllNames(searchResults)
    }
  }, [searchResults])

  // Reset when new search happens
  useEffect(() => {
    if (searchResults.length > 0 && allNames.length > 0 &&
        searchResults[0]?.id !== allNames[0]?.id) {
      setAllNames(searchResults)
      setActiveFilters([])
    }
  }, [searchResults])

  const toggleFilter = (categoryId) => {
    let newFilters
    if (activeFilters.includes(categoryId)) {
      newFilters = activeFilters.filter(f => f !== categoryId)
    } else {
      newFilters = [...activeFilters, categoryId]
    }
    setActiveFilters(newFilters)

    // Apply filter
    if (newFilters.length === 0) {
      setSearchResults(allNames)
    } else {
      const filtered = allNames.filter(name =>
        newFilters.includes(name.category)
      )
      setSearchResults(filtered)
    }
  }

  const clearFilters = () => {
    setActiveFilters([])
    setSearchResults(allNames)
  }

  if (categories.length === 0 || allNames.length === 0) return null

  // Count names per category
  const categoryCounts = {}
  allNames.forEach(name => {
    categoryCounts[name.category] = (categoryCounts[name.category] || 0) + 1
  })

  return (
    <div className="category-filter">
      <div className="filter-header">
        <span className="filter-label">Filter by category</span>
        {activeFilters.length > 0 && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>
      <div className="filter-chips">
        {categories.map(cat => {
          const count = categoryCounts[cat.id] || 0
          if (count === 0) return null

          const isActive = activeFilters.includes(cat.id)
          return (
            <button
              key={cat.id}
              className={`filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => toggleFilter(cat.id)}
              style={{
                '--chip-color': cat.color,
                '--chip-bg': isActive ? cat.color : 'transparent'
              }}
            >
              <span className="chip-dot" style={{ background: cat.color }}></span>
              <span className="chip-name">{cat.name}</span>
              <span className="chip-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFilter
