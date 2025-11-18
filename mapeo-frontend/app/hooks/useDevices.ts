// useDevices: hook simple que devuelve la lista de dispositivos de entrada de video.
// Devuelve la lista de dispositivos de entrada de video (videoinput). Hook cliente ligero que reconsulta enumerateDevices.
import { useEffect, useState } from 'react'

export default function useDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    if (!navigator?.mediaDevices?.enumerateDevices) return
    let mounted = true
    navigator.mediaDevices.enumerateDevices()
      .then(list => { if (mounted) setDevices(list.filter(d => d.kind === 'videoinput')) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return devices
}