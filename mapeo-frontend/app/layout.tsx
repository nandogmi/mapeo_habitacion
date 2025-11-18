// Layout global: estilos y metadata de la aplicación (Server Component).
import './globals.css'

export const metadata = {
  title: 'Mapeo de Habitación',
  description: 'Interfaz de detección',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-black/90 via-neutral-900 to-neutral-800 text-zinc-50">
        <header className="w-full">
          <div className="max-w-6xl mx-auto px-6 py-4 rounded-b-lg bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 text-white shadow-md flex items-center">
            <h1 className="text-lg font-semibold flex items-center gap-3">
              <span className="text-2xl"> 🎥🐍</span>
              <span>Mapeo de Habitación</span>
            </h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}