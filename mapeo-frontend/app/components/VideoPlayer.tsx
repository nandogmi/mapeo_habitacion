// VideoPlayer: controla reproducción, acceso a cámara, muestreo de frames y detección; expone onStatsUpdate.
'use client'

import React, { useEffect, useRef, useState } from 'react'
import FileUploader from './FileUploader'
import CameraControls from './CameraControls'
import DetectionControls from './DetectionControls'

type StatsUpdate = (s: any) => void

export default function VideoPlayer({ onStatsUpdate }: { onStatsUpdate?: StatsUpdate }) {
  // DOM refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // UI state
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // camera/devices
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // detection (client)
  const prevSmallRef = useRef<ImageData | null>(null)
  const timerRef = useRef<number | null>(null)
  const [detectionActive, setDetectionActive] = useState(false)
  const [detectionFps, setDetectionFps] = useState<number>(5)
  const detectionFpsRef = useRef<number>(detectionFps)
  useEffect(() => { detectionFpsRef.current = detectionFps }, [detectionFps])

  // simple counters
  const framesProcessedRef = useRef<number>(0)
  const totalDetectionsRef = useRef<number>(0)
  const framesWithDetRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  // -------------------------
  // Helpers
  // -------------------------

  // valida que el file sea un video (primero por MIME, fallback por extensión)
  function isVideoFile(file: File | undefined | null) {
    if (!file) return false
    if (file.type && file.type.startsWith('video/')) return true
    const name = (file.name || '').toLowerCase()
    return /\.(mp4|webm|ogg|mov|mkv|avi|flv|wmv)$/.test(name)
  }

  function loadFile(file: File) {
    // validar antes de cargar
    if (!isVideoFile(file)) {
      alert('Archivo no válido: selecciona solo archivos de video.')
      return
    }

    setFileName(file.name)
    const url = URL.createObjectURL(file)
    if (videoRef.current) {
      // limpiar cualquier srcObject y asignar URL como fuente del video
      try { if (videoRef.current.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()) } } catch {}
      videoRef.current.srcObject = null
      videoRef.current.src = url
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }

  function safeGet2D(ctxCanvas: HTMLCanvasElement | null) {
    if (!ctxCanvas) return null
    return ctxCanvas.getContext('2d')
  }

  // -------------------------
  // Drag & drop
  // -------------------------
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (!isVideoFile(f)) {
      alert('Archivo no válido: suelta solo archivos de video.')
      return
    }
    loadFile(f)
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDragEnter(e: React.DragEvent) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragging(false) }

  // -------------------------
  // Devices / Camera
  // -------------------------
  useEffect(() => {
    if (!navigator?.mediaDevices?.enumerateDevices) return
    let mounted = true
    navigator.mediaDevices.enumerateDevices()
      .then(list => {
        if (!mounted) return
        setDevices(list.filter(d => d.kind === 'videoinput'))
      })
      .catch(() => { /* ignore */ })
    return () => { mounted = false }
  }, [])

  async function startCamera(deviceId?: string) {
    try {
      const constraints: MediaStreamConstraints = deviceId
        ? { video: { deviceId: { exact: deviceId } }, audio: false }
        : { video: { facingMode: 'environment' }, audio: false }

      const s = await navigator.mediaDevices.getUserMedia(constraints)
      mediaStreamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setStreaming(true)
      const list = await navigator.mediaDevices.enumerateDevices()
      setDevices(list.filter(d => d.kind === 'videoinput'))
    } catch (err) {
      console.error('startCamera error', err)
      alert('No se pudo acceder a la cámara (permiso/https)')
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    setStreaming(false)
  }

  // -------------------------
  // Client detection (frame-difference)
  // -------------------------
  function sampleFrameSmall(scale = 0.2): ImageData | null {
    const v = videoRef.current
    if (!v) return null
    const w = Math.max(1, Math.floor((v.videoWidth || v.clientWidth) * scale))
    const h = Math.max(1, Math.floor((v.videoHeight || v.clientHeight) * scale))
    const off = document.createElement('canvas')
    off.width = w; off.height = h
    const ctx = off.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(v, 0, 0, w, h)
    return ctx.getImageData(0, 0, w, h)
  }

  function calcDiffAndDrawSmall(prev: ImageData, curr: ImageData, threshold = 30, step = 4) {
    const c = canvasRef.current
    const v = videoRef.current
    if (!c || !v) return 0
    const ctx = c.getContext('2d')
    if (!ctx) return 0
    c.width = v.clientWidth; c.height = v.clientHeight
    ctx.clearRect(0, 0, c.width, c.height)
    const sw = curr.width, sh = curr.height
    const scaleX = c.width / sw, scaleY = c.height / sh
    ctx.fillStyle = 'rgba(16,185,129,0.35)'

    let motionCount = 0
    for (let y = 0; y < sh; y += step) {
      for (let x = 0; x < sw; x += step) {
        const i = (y * sw + x) * 4
        const dr = Math.abs(curr.data[i] - prev.data[i])
        const dg = Math.abs(curr.data[i + 1] - prev.data[i + 1])
        const db = Math.abs(curr.data[i + 2] - prev.data[i + 2])
        const delta = dr + dg + db
        if (delta > threshold) {
          motionCount++
          const rx = Math.floor(x * scaleX)
          const ry = Math.floor(y * scaleY)
          const rw = Math.max(3, Math.ceil(step * scaleX))
          const rh = Math.max(3, Math.ceil(step * scaleY))
          ctx.fillRect(rx, ry, rw, rh)
        }
      }
    }
    return motionCount
  }

  function reportStats(lastMotion = 0) {
    const start = startTimeRef.current
    const elapsed = start ? (performance.now() - start) / 1000 : 0
    const fpsApprox = elapsed ? framesProcessedRef.current / elapsed : 0
    onStatsUpdate?.({
      framesProcessed: framesProcessedRef.current,
      lastMotionCount: lastMotion,
      totalDetections: totalDetectionsRef.current,
      framesWithDetections: framesWithDetRef.current,
      fps: fpsApprox,
      status: detectionActive ? 'running' : 'idle',
    })
  }

  function motionLoop() {
    const interval = Math.max(10, Math.round(1000 / (detectionFpsRef.current || 5)))
    const prev = prevSmallRef.current
    const curr = sampleFrameSmall(0.2)
    if (curr && prev) {
      const motion = calcDiffAndDrawSmall(prev, curr) || 0
      framesProcessedRef.current += 1
      totalDetectionsRef.current += motion
      if (motion > 0) framesWithDetRef.current += 1
      reportStats(motion)
    }
    prevSmallRef.current = curr
    timerRef.current = window.setTimeout(() => motionLoop(), interval)
  }

  function startClientDetection() {
    if (detectionActive) return
    const first = sampleFrameSmall(0.2)
    if (!first) return alert('Video/cámara no disponible para muestrear')
    framesProcessedRef.current = 0
    totalDetectionsRef.current = 0
    framesWithDetRef.current = 0
    startTimeRef.current = performance.now()
    prevSmallRef.current = first
    setDetectionActive(true)
    timerRef.current = window.setTimeout(() => motionLoop(), Math.round(1000 / detectionFpsRef.current))
  }

  function stopClientDetection() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    prevSmallRef.current = null
    const c = canvasRef.current
    if (c) {
      const ctx = c.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, c.width, c.height)
    }
    setDetectionActive(false)
    startTimeRef.current = null
    reportStats(0)
  }

  // -------------------------
  // Upload (simple fetch fallback)
  // -------------------------
  async function startUploadProcess() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) { alert('Selecciona un archivo para subir'); return }
    try {
      setUploadProgress(0)
      const form = new FormData()
      form.append('video', file, file.name)
      const res = await fetch('http://localhost:8000/process', { method: 'POST', body: form })
      setUploadProgress(null)
      if (res.ok) {
        const json = await res.json()
        onStatsUpdate?.(json)
        alert('Procesamiento en servidor completado')
      } else {
        alert('Error servidor: ' + res.status)
      }
    } catch (err) {
      console.error(err)
      setUploadProgress(null)
      alert('Error en la subida')
    }
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop())
      if (timerRef.current != null) clearTimeout(timerRef.current)
    }
  }, [])

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="relative flex flex-col gap-4 p-4">
      {/* Media container: recuadro con aspecto de video */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-neutral-800">
          {/* video: controls -> evita que el blob se abra en nueva pestaña */}
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
            // evita autoplay forzado que algunos navegadores bloquean
            autoPlay={false}
            playsInline
          />
          {/* canvas overlay posicionado sobre el video */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          {/* placeholder / drop overlay */}
          {!streaming && !fileName && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0'}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
            >
              <span className="text-white">Suelta el video aquí</span>
            </div>
          )}
        </div>
      </div>

      {/* Controles (modularizados) */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-stretch">
          <div className="flex-1">
            <FileUploader onFile={loadFile} />
          </div>
          <div className="flex-1">
            <CameraControls
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelect={(id) => setSelectedDeviceId(id)}
              onToggle={() => streaming ? stopCamera() : startCamera(selectedDeviceId ?? undefined)}
              streaming={streaming}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-stretch">
          <div className="flex-1">
            <DetectionControls
              detectionActive={detectionActive}
              onToggle={() => detectionActive ? stopClientDetection() : startClientDetection()}
              fps={detectionFps}
              onFpsChange={(v) => setDetectionFps(v)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1">
            <span className="block truncate text-white">{fileName ? `Archivo: ${fileName}` : 'Ningún archivo cargado'}</span>
          </div>
          {uploadProgress !== null && (
            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}