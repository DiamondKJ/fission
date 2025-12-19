import { useState } from 'react'
import useStore from '../store'
import './ExportPanel.css'

function ExportPanel() {
  const { favoriteNames } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (favoriteNames.length === 0) return null

  const exportAsText = () => {
    const text = favoriteNames.map(n =>
      `${n.name}\n  Category: ${n.category}\n  Meaning: ${n.meaning || 'N/A'}\n  Origin: ${n.origin || 'N/A'}`
    ).join('\n\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fission-names.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsJSON = () => {
    const json = JSON.stringify(favoriteNames, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fission-names.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    const headers = ['Name', 'Category', 'Meaning', 'Origin', 'Pronunciation']
    const rows = favoriteNames.map(n => [
      n.name,
      n.category,
      (n.meaning || '').replace(/,/g, ';'),
      (n.origin || '').replace(/,/g, ';'),
      n.pronunciation || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fission-names.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const text = favoriteNames.map(n => n.name).join(', ')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="export-panel-container">
      <button
        className="export-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Export {favoriteNames.length} names
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <div className="export-header">
            <h4>Export Favorites</h4>
            <button className="close-export" onClick={() => setIsOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="export-preview">
            {favoriteNames.slice(0, 5).map(n => (
              <span key={n.id} className="preview-name">{n.name}</span>
            ))}
            {favoriteNames.length > 5 && (
              <span className="preview-more">+{favoriteNames.length - 5} more</span>
            )}
          </div>

          <div className="export-actions">
            <button onClick={copyToClipboard} className="export-btn copy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copied ? 'Copied!' : 'Copy names'}
            </button>

            <button onClick={exportAsText} className="export-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Text file
            </button>

            <button onClick={exportAsCSV} className="export-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
              CSV file
            </button>

            <button onClick={exportAsJSON} className="export-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON file
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportPanel
