import React from 'react'

interface LoaderProps {
  isLoading?: boolean
}

export default function Loader({ isLoading = true }: LoaderProps) {
  if (!isLoading) return null

  return (
    <div className="merlin-loader-wrap">
      <div className="merlin-loader-stage">
        <div className="loader">
          <span>
            <span />
            <span />
            <span />
            <span />
          </span>
          <div className="base">
            <span />
            <div className="face" />
          </div>
        </div>
        <div className="longfazers">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="merlin-loader-title">
        <p className="merlin-loader-subtitle">SPORTS PREDICTIONS</p>
        <h1>MERLIN</h1>
        <p className="merlin-loader-tagline">Predict smarter. Win bigger.</p>
      </div>
    </div>
  )
}
