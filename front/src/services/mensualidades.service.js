import api from "../api/api";

// Obtener mensualidades
export const getMensualidades = (params = {}) => {
  return api.get("/mensualidades", { params });
};

export const getMensualidadById = (id) => {
  return api.get(`/mensualidades/${id}`);
};

export const createMensualidad = (data) => {
  return api.post("/mensualidades", data);
};

export const updateMensualidad = (id, data) => {
  return api.put(`/mensualidades/${id}`, data);
};

export const deleteMensualidad = (id) => {
  return api.delete(`/mensualidades/${id}`);
};

export const getMensualidadesPendientes = (params = {}) => {
  return api.get("/mensualidades/pendientes", { params });
};
