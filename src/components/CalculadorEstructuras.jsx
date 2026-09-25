import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { getEstructuras, getParametros, calcularEstructura, getCatalogoMateriales } from '../services/api'

const defaultInput = {
  codigoEstructura: '',
  estructuraId: '',
  cantidad: 1,
  nivelTension: '13.2',
  tipoApoyo: 'POSTE_CONCRETO_12M_510',
  nivelInstalacion: '1',
  calibreConductor: '4/0',
}

export default function CalculadorEstructuras() {
  const [estructuras, setEstructuras] = useState([])
  const [parametros, setParametros] = useState({})
  const [input, setInput] = useState(defaultInput)
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialSuggestions, setMaterialSuggestions] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const [estructurasData, parametrosData] = await Promise.all([getEstructuras(), getParametros()])
        setEstructuras(estructurasData)
        setParametros(parametrosData)
        if (estructurasData.length > 0) {
          setInput((prev) => ({
            ...prev,
            estructuraId: prev.estructuraId || estructurasData[0].id,
            codigoEstructura: prev.codigoEstructura || estructurasData[0].codigo,
          }))
        }
      } catch (err) {
        setError(err.message)
      }
    }
    loadData()
  }, [])

  const parametroMap = useMemo(() => parametros || {}, [parametros])

  const tensionOptions = useMemo(
    () => parametroMap.TENSION_KV?.map((item) => item.valor) ?? ['13.2', '34.5'],
    [parametroMap],
  )

  const tipoApoyoOptions = useMemo(
    () =>
      parametroMap.TIPO_APOYO?.length
        ? parametroMap.TIPO_APOYO.map((item) => item.valor)
        : [
            'POSTE_CONCRETO_12M_1050',
            'POSTE_CONCRETO_10M_1050',
            'POSTE_CONCRETO_12M_510',
            'POSTE_CONCRETO_12M_750',
            'POSTE_CONCRETO_12M_1350',
            'POSTE_CONCRETO_14M_1050',
            'POSTE_CONCRETO_14M_1350',
            'POSTE_METALICO_10M_1050',
            'POSTE_METALICO_12M_510',
            'POSTE_METALICO_12M_750',
            'POSTE_METALICO_12M_1050',
            'POSTE_METALICO_12M_1350',
            'POSTE_METALICO_14M_1050',
            'POSTE_METALICO_14M_1350',
          ],
    [parametroMap],
  )

  const calibreOptions = useMemo(
    () => parametroMap.CALIBRE_CONDUCTOR?.map((item) => item.valor) ?? ['4/0', '2/0', '1/0', '3/0'],
    [parametroMap],
  )

  const nivelOptions = useMemo(
    () => parametroMap.NIVEL_INSTALACION?.map((item) => item.valor) ?? ['1', '2', '3'],
    [parametroMap],
  )

  const handleChange = (field, value) => {
    setInput((prev) => {
      if (field === 'estructuraId') {
        const estructura = estructuras.find((item) => item.id === value)
        return {
          ...prev,
          estructuraId: value,
          codigoEstructura: estructura?.codigo ?? prev.codigoEstructura,
        }
      }

      return { ...prev, [field]: value }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResultados([])

    try {
      const data = await calcularEstructura(input)
      setResultados(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = async (value) => {
    setMaterialSearch(value)
    if (!value.trim()) {
      setMaterialSuggestions([])
      return
    }
    try {
      const results = await getCatalogoMateriales(value, 1)
      setMaterialSuggestions(results.items?.slice(0, 10) || [])
    } catch (err) {
      setMaterialSuggestions([])
    }
  }

  const exportarExcel = () => {
    if (resultados.length === 0) return

    const datosExcel = resultados.map((item) => ({
      'Código': item.codigo || '',
      'Descripción Técnica': item.descripcionTecnica || '',
      'Unidad': item.unidad || '',
      'Cantidad': Number(item.cantidadCalculada || 0),
      'Observación': item.observacion || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(datosExcel)

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 55 },
      { wch: 12 },
      { wch: 16 },
      { wch: 40 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cálculo')

    const nombreArchivo = `Calculo_${input.codigoEstructura}_${input.cantidad}un.xlsx`
    XLSX.writeFile(workbook, nombreArchivo)
  }

  return (
    <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Calculador de Estructuras Serie LA</h2>
        <p className="mt-2 text-sm text-slate-500">
          Selecciona una estructura LA, ajusta parámetros y obtiene el desglose de materiales calculados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Estructura</label>
          <select
            value={input.estructuraId}
            onChange={(e) => handleChange('estructuraId', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          >
            {estructuras.map((estructura) => (
              <option key={estructura.id} value={estructura.id}>
                {estructura.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Cantidad</label>
          <input
            type="number"
            min="1"
            value={input.cantidad}
            onChange={(e) => handleChange('cantidad', Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tensión (kV)</label>
          <select
            value={input.nivelTension}
            onChange={(e) => handleChange('nivelTension', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          >
            {tensionOptions.map((tension) => (
              <option key={tension} value={tension}>
                {tension}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tipo de Poste</label>
          <select
            value={input.tipoApoyo}
            onChange={(e) => handleChange('tipoApoyo', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          >
            {tipoApoyoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Nivel de Instalación</label>
          <select
            value={input.nivelInstalacion}
            onChange={(e) => handleChange('nivelInstalacion', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          >
            {nivelOptions.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Calibre Conductor</label>
          <select
            value={input.calibreConductor}
            onChange={(e) => handleChange('calibreConductor', e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          >
            {calibreOptions.map((calibre) => (
              <option key={calibre} value={calibre}>
                {calibre}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Calculando materiales...' : 'Calcular Materiales'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {resultados.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Resultados de materiales</h3>
            <button
              onClick={exportarExcel}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              📊 Exportar Cálculo a Excel
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-white text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Descripción Técnica</th>
                  <th className="px-4 py-3 font-medium">Unidad</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {resultados.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-cyan-600">{item.codigo}</td>
                    <td className="px-4 py-3 text-slate-700">{item.descripcionTecnica}</td>
                    <td className="px-4 py-3 text-slate-600">{item.unidad}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{item.cantidadCalculada}</td>
                    <td className="px-4 py-3 text-slate-600">{item.observacion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Buscador directo de materiales</h3>
        <p className="mt-1 text-sm text-slate-500">
          Busca entre el catálogo de materiales con autocompletado desde el almacén.
        </p>
        <div className="mt-4 space-y-3">
          <input
            type="search"
            value={materialSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar material por código o descripción"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
          />

          {materialSuggestions.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              {materialSuggestions.map((item) => (
                <div key={item.codigo} className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-900">{item.codigo}</p>
                  <p className="text-sm text-slate-600">{item.descripcionTecnica}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}