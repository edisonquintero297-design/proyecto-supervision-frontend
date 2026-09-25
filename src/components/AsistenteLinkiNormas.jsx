import React, { useEffect, useState } from 'react';

export default function AsistenteLinkiNormas() {
  const [formData, setFormData] = useState({
    codigoLikinorma: 'LA202',
    nivelTension: '11.4 kV',
    nivelMontajeFisico: 1,
    capacidadCargaPoste: '510 daN',
    calibreTroncal: '1/0 ACSR',
  });

  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estructuras, setEstructuras] = useState([]);
  const [estructuraSeleccionada, setEstructuraSeleccionada] = useState('');

  useEffect(() => {
    const cargarEstructuras = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/materiales/filtros');
        if (!response.ok) throw new Error('Error al cargar estructuras');
        const data = await response.json();
        setEstructuras(data.estructuras || []);
      } catch (error) {
        console.error('Error cargando estructuras:', error);
        setEstructuras([]);
      }
    };

    cargarEstructuras();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nivelMontajeFisico' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMateriales([]);

    try {
      const response = await fetch('http://localhost:3001/materiales/generar-lista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error en la consulta: ${response.statusText}`);
      }

      const data = await response.json();
      setMateriales(data);
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el Backend (puerto 3001)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '24px', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>⚡ Motor de Reglas - Lista de Materiales</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Código Likinorma:</label>
          <input
            type="text"
            name="codigoLikinorma"
            value={formData.codigoLikinorma}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Nivel de Tensión:</label>
          <select 
            name="nivelTension" 
            value={formData.nivelTension} 
            onChange={handleChange}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="11.4 kV">11.4 kV</option>
            <option value="13.2 kV">13.2 kV</option>
            <option value="34.5 kV">34.5 kV</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Nivel Montaje Físico:</label>
          <input
            type="number"
            name="nivelMontajeFisico"
            value={formData.nivelMontajeFisico}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Capacidad Carga Poste:</label>
          <input
            type="text"
            name="capacidadCargaPoste"
            value={formData.capacidadCargaPoste}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Calibre Troncal:</label>
          <input
            type="text"
            name="calibreTroncal"
            value={formData.calibreTroncal}
            onChange={handleChange}
            required
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <label htmlFor="estructura" style={{ fontWeight: 'bold', color: '#475569' }}>
          Estructura
        </label>
        <select
          id="estructura"
          value={estructuraSeleccionada}
          onChange={(e) => setEstructuraSeleccionada(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="">Seleccione una estructura...</option>
          {estructuras &&
            estructuras.map((e) => (
              <option key={e.id || e.codigo} value={e.id || e.codigo}>
                {e.label || `${e.codigo} - ${e.nombre}`}
              </option>
            ))}
        </select>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '12px', 
            cursor: 'pointer', 
            backgroundColor: loading ? '#94a3b8' : '#2563eb', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? 'Consultando Backend...' : 'Generar Lista de Materiales'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {materiales.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '12px' }}>📋 Resultado de Materiales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px' }}>Código</th>
                <th style={{ padding: '10px' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: '600', color: '#1e293b' }}>{item.codigo}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}