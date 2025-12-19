import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Search state
  query: '',
  isSearching: false,
  searchResults: [], // Array of name objects
  threads: null, // Category threads
  deepMode: false, // Go Deeper mode
  maxResults: 50, // Number of names to generate

  // Go Deeper state
  selectedName: null, // Currently selected name for Go Deeper
  deeperResults: null, // Results from Go Deeper exploration
  isExploringDeeper: false,
  explorationHistory: [], // Stack of explored names for breadcrumb

  // UI state
  favoriteNames: [], // Saved favorite names
  hoveredName: null,
  viewMode: 'scattered', // 'scattered' | 'grid' | 'list'
  detailsPanel: null, // Name being viewed in details panel
  darkMode: false,
  activeCategory: null, // Currently selected category filter

  // Actions - Search
  setQuery: (query) => set({ query }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setThreads: (threads) => set({ threads }),
  toggleDeepMode: () => set((state) => ({ deepMode: !state.deepMode })),
  setMaxResults: (maxResults) => set({ maxResults }),

  // Actions - Go Deeper
  setSelectedName: (name) => set({ selectedName: name }),
  setDeeperResults: (results) => set({ deeperResults: results }),
  setIsExploringDeeper: (isExploring) => set({ isExploringDeeper: isExploring }),

  // Go deeper into a name
  goDeeper: (name) => {
    const history = get().explorationHistory
    set({
      selectedName: name,
      explorationHistory: [...history, name],
      deeperResults: null,
    })
  },

  // Go back in exploration history
  goBack: () => {
    const history = get().explorationHistory
    if (history.length > 1) {
      const newHistory = history.slice(0, -1)
      set({
        selectedName: newHistory[newHistory.length - 1],
        explorationHistory: newHistory,
        deeperResults: null,
      })
    } else {
      set({
        selectedName: null,
        explorationHistory: [],
        deeperResults: null,
      })
    }
  },

  // Clear Go Deeper exploration
  clearExploration: () => set({
    selectedName: null,
    deeperResults: null,
    explorationHistory: [],
  }),

  // Actions - Favorites
  toggleFavorite: (name) => {
    const favorites = get().favoriteNames
    const isFavorite = favorites.some(n => n.id === name.id)
    if (isFavorite) {
      set({ favoriteNames: favorites.filter(n => n.id !== name.id) })
    } else {
      set({ favoriteNames: [...favorites, name] })
    }
  },
  isFavorite: (nameId) => get().favoriteNames.some(n => n.id === nameId),

  // Actions - UI
  setHoveredName: (name) => set({ hoveredName: name }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDetailsPanel: (name) => set({ detailsPanel: name }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setActiveCategory: (category) => set({ activeCategory: category }),

  // Clear all results
  clearResults: () => set({
    searchResults: [],
    threads: null,
    selectedName: null,
    deeperResults: null,
    explorationHistory: [],
    hoveredName: null,
    detailsPanel: null,
    activeCategory: null,
  }),
}))

export default useStore
