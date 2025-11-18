// CameraControls: selector de cámara y botón para iniciar/detener la transmisión.
// 'use client'
import React from 'react'
import { CameraIcon } from './icons'

type Props = {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string | null
  onSelect: (id: string | null) => void
  onToggle: () => void
  streaming: boolean
}

export default function CameraControls({ devices, selectedDeviceId, onSelect, onToggle, streaming }: Props) {
  return (
    <div className="inline-flex w-full items-stretch">
      <select
        value={selectedDeviceId ?? ''}
        onChange={e => onSelect(e.target.value || null)}
        className="h-12 rounded-l-lg border-2 border-gray-700 bg-black px-4 py-2 text-white min-w-0 flex-1"
      >
        <option value="">Selecciona la cámara</option>
        {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Cámara ${d.deviceId}`}</option>)}
      </select>

      <button
        type="button"
        onClick={onToggle}
        className="h-12 rounded-r-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 inline-flex items-center justify-center"
      >
        <CameraIcon className="w-4 h-4 text-white mr-2" />
        {streaming ? 'Detener cámara' : 'Iniciar cámara'}
      </button>
    </div>
  )
}