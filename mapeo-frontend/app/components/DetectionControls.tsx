// DetectionControls: controles de inicio/parada de detección y ajuste de FPS (presentacional).
'use client'
import React from 'react'
import { PlayIcon, StopIcon } from './icons'

type Props = {
  detectionActive: boolean
  onToggle: () => void
  fps: number
  onFpsChange: (v: number) => void
}

export default function DetectionControls({ detectionActive, onToggle, fps, onFpsChange }: Props) {
  return (
    <>
      <div className="flex gap-2 items-stretch">
        <button
          type="button"
          onClick={onToggle}
          className="w-full h-12 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 inline-flex items-center justify-center"
          aria-pressed={detectionActive}
        >
          {detectionActive ? (
            <>
              <StopIcon className="w-4 h-4 text-white mr-2" />
              Detener detección
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 text-white mr-2" />
              Iniciar detección
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <label className="text-xs text-zinc-300">FPS:</label>
        <input type="range" min={1} max={30} value={fps} onChange={e => onFpsChange(Number(e.target.value))} className="w-40" />
        <span className="text-xs text-white w-8 text-right">{fps}</span>
      </div>
    </>
  )
}