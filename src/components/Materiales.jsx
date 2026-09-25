import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

export default function Materiales() {
  // Estados de datos
  const [materiales, setMateriales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas las categorías')

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false)
  const [materialDetalle, setMaterialDetalle] = useState(null)
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false)

  // Carrito de Pedido Manual
  const [pedido, setPedido] = useState([])

  // Formulario Nuevo Material
  const [nuevoCodigo, setNuevoCodigo] = useState('')
  const [nuevoCodigoEmpresa, setNuevoCodigoEmpresa] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [nuevaUnidad, setNuevaUnidad] = useState('UND')
  const [guardando, setGuardando] = useState(false)

  // Carga inicial desde la API
  useEffect(() => {
    cargarMateriales()
  }, [])

  const cargarMateriales = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/api/materiales')
      
      if (!response.ok) {
        throw new Error(`Error en el servidor: Estado ${response.status}`)
      }

      const data = await response.json()
      // Formateamos para asegurar que sea un arreglo
      const lista = Array.isArray(data) ? data : (data.items || data.materiales || [])
      
      setMateriales(lista)
    } catch (err) {
      console.error('Error al conectar con la API:', err)
      setError('No se pudo conectar con la API en http://localhost:3001/api/materiales.')
    } finally {
      setLoading(false)
    }
  }

  // Lógica de Pedido / Carrito
  const agregarAlPedido = (item) => {
    const idUnico = item.id || item.codigo
    setPedido((prev) => {
      const existe = prev.find((p) => (p.id || p.codigo) === idUnico)
      if (existe) {
        return prev.map((p) =>
          (p.id || p.codigo) === idUnico ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { ...item, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (idUnico, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelPedido(idUnico)
      return
    }
    setPedido((prev) =>
      prev.map((item) => ((item.id || item.codigo) === idUnico ? { ...item, cantidad } : item))
    )
  }

  const eliminarDelPedido = (idUnico) => {
    setPedido((prev) => prev.filter((item) => (item.id || item.codigo) !== idUnico))
  }

  // Guardar Nuevo Material en el Backend
  const guardarNuevoMaterial = async (e) => {
    e.preventDefault()
    setGuardando(true)

    const nuevoItem = {
      codigo: nuevoCodigo,
      codigoEmpresa: nuevoCodigoEmpresa,
      descripcion: nuevaDescripcion,
      unidad: nuevaUnidad
    }

    try {
      const res = await fetch('http://localhost:3001/api/materiales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoItem)
      })

      if (res.ok) {
        const creado = await res.json()
        setMateriales([creado, ...materiales])
      } else {
        // Si no existe POST en el backend, lo insertamos en el estado local
        setMateriales([{ ...nuevoItem, id: Date.now().toString() }, ...materiales])
      }
    } catch (err) {
      setMateriales([{ ...nuevoItem, id: Date.now().toString() }, ...materiales])
    } finally {
      setGuardando(false)
      setNuevoCodigo('')
      setNuevoCodigoEmpresa('')
      setNuevaDescripcion('')
      setMostrarModalNuevo(false)
    }
  }

  const exportarPedidoExcel = () => {
    if (!pedido || pedido.length === 0) return;

    const datosExcel = pedido.map((item) => ({
      'Código': item.codigo || '',
      'Código Empresa': item.codigoEmpresa || '',
      'Descripción Técnica': item.descripcion || '',
      'Unidad': item.unidad || 'UND',
      'Cantidad Solicitada': Number(item.cantidad || 1),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 55 },
      { wch: 12 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitud Pedido');

    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Solicitud_Pedido_Manual_${fecha}.xlsx`);
  };

  const exportarCatálogoExcel = () => {
    const lista = materialesFiltrados.length > 0 ? materialesFiltrados : materiales
    if (!lista || lista.length === 0) return

    const datosExcel = lista.map((m) => ({
      'Código Interno': m.codigo || '',
      'Código Empresa (SAP)': m.codigoEmpresa || '',
      'Descripción Técnica': m.descripcion || '',
      'Unidad': m.unidad || 'UND',
    }))

    const worksheet = XLSX.utils.json_to_sheet(datosExcel)

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 55 },
      { wch: 12 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Catálogo')

    const fecha = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `Catalogo_Materiales_BD_${fecha}.xlsx`)
  }

  // Búsqueda multi-campo en tiempo real (busca por código, código empresa o descripción)
  const materialesFiltrados = materiales.filter((item) => {
    const desc = (item.descripcion || '').toLowerCase()
    const cod = (item.codigo || '').toLowerCase()
    const codEmp = (item.codigoEmpresa || '').toLowerCase()
    const query = busqueda.toLowerCase().trim()

    const cumpleBusqueda = desc.includes(query) || cod.includes(query) || codEmp.includes(query)
    return cumpleBusqueda
  })

  return (
    <div className="w-full space-y-6 p-2 sm:p-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Catálogo Maestro de Materiales</h2>
          <p className="text-slate-500 text-sm mt-1">
            {loading
              ? 'Cargando datos desde PostgreSQL...'
              : `Base de datos conectada: ${materiales.length.toLocaleString()} insumos registrados.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMostrarModalPedido(true)}
            className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2"
          >
            🛒 Pedido Manual
            {pedido.length > 0 && (
              <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pedido.length}
              </span>
            )}
          </button>

          <button
            onClick={exportarCatálogoExcel}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Exportar Excel
          </button>

          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors"
          >
            + Nuevo Material
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>⚠️ {error}</span>
          <button
            onClick={cargarMateriales}
            className="font-bold underline text-xs uppercase text-amber-900 hover:text-black shrink-0"
          >
            Reintentar Conexión
          </button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Buscar por descripción (ej: aislador, poste, tornillo) o por código (MAT-300548, 240083)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={() => setBusqueda('')}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Limpiar Búsqueda
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="px-6 py-4">Código Interno</th>
                <th className="px-6 py-4">Código Empresa</th>
                <th className="px-6 py-4">Descripción Técnica</th>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Cargando catálogo maestro desde PostgreSQL...
                  </td>
                </tr>
              ) : materialesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No se encontraron materiales que coincidan con "{busqueda}".
                  </td>
                </tr>
              ) : (
                // Renderizamos los primeros 150 registros para mantener la UI rápida y fluida
                materialesFiltrados.slice(0, 150).map((item, idx) => {
                  const idUnico = item.id || item.codigo
                  const enPedido = pedido.find((p) => (p.id || p.codigo) === idUnico)

                  return (
                    <tr key={idUnico || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-600">
                        {item.codigo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {item.codigoEmpresa || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-md">
                        {item.descripcion || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold">
                          {item.unidad || 'UND'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => agregarAlPedido(item)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              enPedido
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {enPedido ? `✓ En Pedido (${enPedido.cantidad})` : '+ Pedido'}
                          </button>
                          <button
                            onClick={() => setMaterialDetalle(item)}
                            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Detalle
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Solicitud de Pedido Manual */}
      {mostrarModalPedido && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Solicitud de Pedido Manual</h3>
                <p className="text-xs text-slate-500">Ajusta las cantidades requeridas antes de exportar la planilla.</p>
              </div>
              <button
                onClick={() => setMostrarModalPedido(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {pedido.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Tu lista de pedido está vacía. Haz clic en <strong>"+ Pedido"</strong> en la lista de materiales.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {pedido.map((item) => {
                  const idUnico = item.id || item.codigo
                  return (
                    <div
                      key={idUnico}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-xs font-bold text-sky-600">{item.codigo}</span>
                          {item.codigoEmpresa && (
                            <span className="text-xs font-mono text-slate-400">({item.codigoEmpresa})</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">
                          {item.descripcion}
                        </p>
                        <span className="text-xs text-slate-400">Unidad: {item.unidad || 'UND'}</span>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1 shadow-sm">
                          <button
                            onClick={() => cambiarCantidad(idUnico, item.cantidad - 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-800 text-sm w-6 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => cambiarCantidad(idUnico, item.cantidad + 1)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => eliminarDelPedido(idUnico)}
                          className="text-slate-400 hover:text-rose-600 font-bold text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xs text-slate-500">Total ítems seleccionados: {pedido.length}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarModalPedido(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700"
                >
                  Cerrar
                </button>
                {pedido.length > 0 && (
                  <button
                    onClick={exportarPedidoExcel}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    📊 Descargar Pedido en Excel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Detalle del Material */}
      {materialDetalle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-600">
                  {materialDetalle.codigo}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  {materialDetalle.descripcion}
                </h3>
              </div>
              <button
                onClick={() => setMaterialDetalle(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-slate-600 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p><strong>Código Interno:</strong> <span className="font-mono text-slate-800">{materialDetalle.codigo || 'N/A'}</span></p>
              <p><strong>Código Empresa (SAP/EPM):</strong> <span className="font-mono text-slate-800">{materialDetalle.codigoEmpresa || 'N/A'}</span></p>
              <p><strong>Unidad de Medida:</strong> <span className="text-slate-800">{materialDetalle.unidad || 'UND'}</span></p>
              {materialDetalle.id && (
                <p className="text-xs text-slate-400 font-mono"><strong>ID Postgres:</strong> {materialDetalle.id}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  agregarAlPedido(materialDetalle)
                  setMaterialDetalle(null)
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                + Agregar al Pedido
              </button>
              <button
                onClick={() => setMaterialDetalle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Crear Nuevo Material */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Agregar Nuevo Material</h3>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form className="space-y-3" onSubmit={guardarNuevoMaterial}>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Código Interno</label>
                <input
                  type="text"
                  placeholder="Ej: MAT-999000"
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Código Empresa (SAP/EPM)</label>
                <input
                  type="text"
                  placeholder="Ej: 300548"
                  value={nuevoCodigoEmpresa}
                  onChange={(e) => setNuevoCodigoEmpresa(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descripción Técnica</label>
                <textarea
                  rows="3"
                  placeholder="Descripción detallada del insumo o elemento de red"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Unidad de Medida</label>
                <select
                  value={nuevaUnidad}
                  onChange={(e) => setNuevaUnidad(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-sky-500 bg-white"
                >
                  <option value="UND">UND (Unidad)</option>
                  <option value="MTR">MTR (Metros)</option>
                  <option value="KG">KG (Kilogramos)</option>
                  <option value="JGO">JGO (Juego)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-lg text-sm bg-sky-600 text-white font-semibold hover:bg-sky-700"
                >
                  {guardando ? 'Guardando...' : 'Guardar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}