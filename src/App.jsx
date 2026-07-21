import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Wand2,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState({ nombre: 'Supervisor Alfa', rol: 'Supervisor' })
  const [view, setView] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [activeSection, setActiveSection] = useState('Asistente LinkiNormas')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assistantForm, setAssistantForm] = useState({
    configuracion: 'Sencilla',
    tension: '13.2 kV',
    calibreConductor: '1/0',
    nivelPoste: 'Punta',
  })
  const [assistantResults, setAssistantResults] = useState([])
  const [assistantLoading, setAssistantLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('')
      setMessageType('')
    }
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    setTimeout(() => {
      setIsAuthenticated(true)
      setUser({ nombre: 'Supervisor Alfa', rol: 'Supervisor' })
      setLoading(false)
      setMessage('Bienvenido de nuevo')
      setMessageType('success')
    }, 1000)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    setTimeout(() => {
      setMessageType('success')
      setMessage('Registro exitoso. Ahora puedes iniciar sesión.')
      setView('login')
      setLoading(false)
    }, 1200)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setMessage('')
    setMessageType('')
    setView('login')
  }

  const handleAssistantSubmit = (e) => {
    e.preventDefault()
    setAssistantLoading(true)
    setMessage('')
    setMessageType('')

    setTimeout(() => {
      setAssistantResults([
        { id: 1, codigo: 'MAT-001', descripcion: 'Aislador de porcelana tipo pin 15kV', cantidad: 3 },
        { id: 2, codigo: 'MAT-042', descripcion: 'Cruceta de acero galvanizado 2.4m', cantidad: 1 },
        { id: 3, codigo: 'MAT-109', descripcion: 'Grapa de retención tipo pistola', cantidad: 3 },
        { id: 4, codigo: 'MAT-088', descripcion: 'Perno espárrago 5/8" x 10"', cantidad: 2 },
      ])
      setAssistantLoading(false)
      setMessage('Combinación calculada correctamente')
      setMessageType('success')
    }, 1500)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-10 text-slate-100">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
              <Wand2 size={24} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-white">
              {view === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {view === 'login'
                ? 'Accede al panel de supervisión'
                : 'Registra un nuevo perfil para comenzar'}
            </p>
          </div>

          <div className="mb-6 flex rounded-2xl bg-slate-900/60 p-1">
            <button
              type="button"
              onClick={() => {
                setView('login')
                setMessage('')
                setMessageType('')
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === 'login' ? 'bg-cyan-500 text-white' : 'text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setView('register')
                setMessage('')
                setMessageType('')
              }}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                view === 'register' ? 'bg-cyan-500 text-white' : 'text-slate-300'
              }`}
            >
              Registro
            </button>
          </div>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${messageType === 'success' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Procesando...' : view === 'login' ? 'Ingresar' : 'Registrarme'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-100 bg-white p-6 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-200">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">LinkiNormas</h1>
                  <p className="text-xs text-slate-400">Panel de Control v1.0</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 lg:hidden">
                <X size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-1.5">
              {[
                { name: 'Dashboard', icon: LayoutDashboard },
                { name: 'Asistente LinkiNormas', icon: Wand2 },
                { name: 'Materiales', icon: Package },
                { name: 'Reportes', icon: FileText },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.name
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveSection(item.name)
                      setSidebarOpen(false)
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                      isActive ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-cyan-600' : 'text-slate-400'} />
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                  <User size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-semibold text-slate-800">{user?.nombre}</p>
                  <p className="text-[10px] text-slate-400">{user?.rol}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-rose-600 hover:shadow-sm"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between border-b border-slate-100 bg-white px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{activeSection}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Sistema Online
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {activeSection === 'Dashboard' && (
                <>
                  <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">Resumen</p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900">Panorama general del sistema</h3>
                        <p className="mt-2 text-sm text-slate-500">Monitorea la actividad operativa y el estado de los materiales recomendados.</p>
                      </div>
                      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700">
                        Actualización en tiempo real
                      </div>
                    </div>
                  </div>
                  {[{ title: 'Materiales calculados', value: '128', detail: 'Este mes', icon: TrendingUp }, { title: 'Alertas', value: '4', detail: 'Pendientes', icon: AlertTriangle }, { title: 'Validaciones', value: '97%', detail: 'Conforme', icon: CheckCircle2 }].map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-500">{card.title}</p>
                          <div className="rounded-2xl bg-cyan-50 p-2 text-cyan-600">
                            <Icon size={16} />
                          </div>
                        </div>
                        <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
                        <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                      </div>
                    )
                  })}
                </>
              )}

              {activeSection === 'Asistente LinkiNormas' && (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Configurador Estructural Paramétrico</h3>
                    <p className="text-sm text-slate-400">Selecciona los parámetros de la estructura de red para calcular automáticamente la lista de materiales normalizada.</p>
                  </div>

                  {message && (
                    <div className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${messageType === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleAssistantSubmit} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Configuración de Red</label>
                      <select
                        value={assistantForm.configuracion}
                        onChange={(e) => setAssistantForm({ ...assistantForm, configuracion: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
                      >
                        <option value="Sencilla">Sencilla (Paso)</option>
                        <option value="Doble">Doble Angular</option>
                        <option value="Retención">Retención Terminal</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nivel de Tensión</label>
                      <select
                        value={assistantForm.tension}
                        onChange={(e) => setAssistantForm({ ...assistantForm, tension: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
                      >
                        <option value="13.2 kV">13.2 kV (Media Tensión)</option>
                        <option value="34.5 kV">34.5 kV (Media Tensión)</option>
                        <option value="110 V / 220 V">110V/220V (Baja Tensión)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Calibre del Conductor</label>
                      <select
                        value={assistantForm.calibreConductor}
                        onChange={(e) => setAssistantForm({ ...assistantForm, calibreConductor: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
                      >
                        <option value="No. 2">No. 2</option>
                        <option value="1/0">1/0</option>
                        <option value="3/0">3/0</option>
                        <option value="4/0">4/0</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Nivel de Poste</label>
                      <select
                        value={assistantForm.nivelPoste}
                        onChange={(e) => setAssistantForm({ ...assistantForm, nivelPoste: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
                      >
                        <option value="Punta">Punta</option>
                        <option value="Cuerpo">Cuerpo</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={assistantLoading}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {assistantLoading ? 'Calculando...' : 'Calcular Materiales'}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </form>

                  {assistantResults.length > 0 && (
                    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Código</th>
                            <th className="px-4 py-3 font-semibold">Descripción</th>
                            <th className="px-4 py-3 font-semibold">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {assistantResults.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-800">{item.codigo}</td>
                              <td className="px-4 py-3 text-slate-600">{item.descripcion}</td>
                              <td className="px-4 py-3 text-slate-600">{item.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'Materiales' && (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Gestión de materiales</h3>
                  <p className="mt-2 text-sm text-slate-500">Revisa el inventario y la disponibilidad de los insumos para cada estructura.</p>
                </div>
              )}

              {activeSection === 'Reportes' && (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">Reportes operativos</h3>
                  <p className="mt-2 text-sm text-slate-500">Consulta el desempeño de las estructuras recomendadas y su cumplimiento.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
