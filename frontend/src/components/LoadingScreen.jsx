import './LoadingScreen.css'

function LoadingScreen({ message = 'Generating names...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Fission animation */}
        <div className="loading-fission">
          <div className="loading-nucleus"></div>
          <div className="loading-orbit orbit-1">
            <div className="loading-electron"></div>
          </div>
          <div className="loading-orbit orbit-2">
            <div className="loading-electron"></div>
          </div>
          <div className="loading-orbit orbit-3">
            <div className="loading-electron"></div>
          </div>
          {/* Splitting particles */}
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
        </div>
        <p className="loading-message">{message}</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
