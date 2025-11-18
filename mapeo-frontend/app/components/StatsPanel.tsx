// StatsPanel: componente presentacional para mostrar y exportar estadísticas de detección.
// Contiene funciones de ayuda para exportar y copiar datos; mantiene la UI simple y legible.

import React from 'react'

export type Stats = {
  framesProcessed?: number
  lastMotionCount?: number
  totalDetections?: number
  framesWithDetections?: number
  fps?: number
  status?: 'idle' | 'running' | 'done'
}

export default function StatsPanel({ stats, onExport }: { stats: Stats, onExport?: () => void }) {
  // handleExport: delega a la prop onExport si está definida.
  function handleExport() {
    if (typeof onExport === 'function') onExport()
  }

  // handleCopyJSON: copia el objeto `stats` como JSON al portapapeles.
  // Usa navigator.clipboard cuando está disponible; captura errores silenciosamente.
  async function handleCopyJSON() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(stats))
      // opcional: podríamos mostrar una notificación breve aquí
    } catch {
      // fallback simple: crear textarea temporal para copiar
      try {
        const el = document.createElement('textarea')
        el.value = JSON.stringify(stats)
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        el.remove()
      } catch {
        // si falla, no hacemos nada
      }
    }
  }

  return (
    <aside className="w-80 rounded-lg p-4 bg-gradient-to-br from-black/90 via-neutral-900 to-neutral-800 text-zinc-200 shadow-lg border border-neutral-700">
      {/* Header: título y estado */}
      <h2 className="mb-3 text-sm font-semibold flex items-center justify-between">
        <span>Datos</span>
        <span className="text-xs px-2 py-1 rounded bg-neutral-800 text-zinc-300">{stats.status ?? 'idle'}</span>
      </h2>

      {/* Grid de métricas principales */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Frames</span>
          <strong className="text-lg">{stats.framesProcessed ?? '—'}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">FPS</span>
          <strong className="text-lg">{stats.fps ? stats.fps.toFixed(1) : '—'}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Det. totales</span>
          <strong className="text-lg">{stats.totalDetections ?? 0}</strong>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Frames c/ det.</span>
          <strong className="text-lg">{stats.framesWithDetections ?? 0}</strong>
        </div>
      </div>

      {/* Placeholder para mini-gráfica */}
      <div className="mt-3 h-16 bg-neutral-800 rounded flex items-center justify-center text-xs text-zinc-400">
        Mini-gráfica (detecciones / tiempo)
      </div>

      {/* Acciones: exportar y copiar JSON */}
      <div className="mt-3 flex gap-2">
        <button onClick={handleExport} className="flex-1 rounded bg-emerald-600 px-3 py-2 text-xs text-white">Exportar CSV</button>
        <button onClick={handleCopyJSON} className="rounded bg-neutral-700 px-3 py-2 text-xs text-white">Copiar JSON</button>
      </div>
    </aside>
  )
}