// Página principal: monta VideoPlayer y StatsPanel; coordina el estado de estadísticas.
'use client'
import React, { useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import StatsPanel, { Stats } from './components/StatsPanel'

export default function Home() {
  const [stats, setStats] = useState<Stats>({ status: 'idle' })

  return (
    <section className="flex gap-6">
      <div className="flex-1">
        <VideoPlayer onStatsUpdate={(s: Partial<Stats>) => setStats(prev => ({ ...prev, ...s }))} />
      </div>

      <StatsPanel stats={stats} onExport={() => {
        const data = JSON.stringify(stats, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'stats.json'; a.click(); URL.revokeObjectURL(url)
      }} />
    </section>
  )
}