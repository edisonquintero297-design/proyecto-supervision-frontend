const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text || response.statusText}`);
  }
  return response.json();
};

export async function getCatalogoMateriales(q = '', page = 1) {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  params.append('page', String(page));
  const response = await fetch(`${API_BASE_URL}/catalogo-materiales?${params.toString()}`);
  return handleResponse(response);
}

export async function getEstructuras() {
  const response = await fetch(`${API_BASE_URL}/materiales/filtros`);
  const data = await handleResponse(response);
  return data.estructuras || [];
}

export async function getParametros() {
  const response = await fetch(`${API_BASE_URL}/parametros`);
  return handleResponse(response);
}

export async function calcularEstructura(dto) {
  const response = await fetch(`${API_BASE_URL}/estructuras/calcular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  return handleResponse(response);
}

const api = {
  getCatalogoMateriales,
  getEstructuras,
  getParametros,
  calcularEstructura,
};

export default api;