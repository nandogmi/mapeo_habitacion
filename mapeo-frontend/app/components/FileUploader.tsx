// FileUploader: componente presentacional para seleccionar y validar archivos de video.
// Componente presentacional: gestiona selección y validación de archivos de video y expone el archivo seleccionado via onFile.
'use client'
import { useRef } from 'react'
import { UploadIcon } from './icons'

type Props = {
  onFile: (f: File) => void
}

export default function FileUploader({ onFile }: Props) {
  const ref = useRef<HTMLInputElement | null>(null)

  function isVideoFile(file: File | undefined | null) {
    if (!file) return false
    if (file.type && file.type.startsWith('video/')) return true
    const name = (file.name || '').toLowerCase()
    return /\.(mp4|webm|ogg|mov|mkv|avi|flv|wmv)$/.test(name)
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const input = e.target as HTMLInputElement
          const f = input.files?.[0]
          if (!f) return
          if (!isVideoFile(f)) {
            alert('Archivo no válido: selecciona solo archivos de video.')
            input.value = ''
            return
          }
          onFile(f)
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full h-12 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 inline-flex items-center justify-center"
      >
        <UploadIcon className="w-4 h-4 text-white mr-2" />
        Cargar video
      </button>
    </>
  )
}