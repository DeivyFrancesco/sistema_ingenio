import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getMensualidades = (params = {}) => {
  return axios.get(`${API_URL}/mensualidades`, { params });
};

export const getMensualidadById = (id) => {
  return axios.get(`${API_URL}/mensualidades/${id}`);
};

export const createMensualidad = (data) => {
  return axios.post(`${API_URL}/mensualidades`, data);
};

export const updateMensualidad = (id, data) => {
  return axios.put(`${API_URL}/mensualidades/${id}`, data);
};

export const deleteMensualidad = (id) => {
  return axios.delete(`${API_URL}/mensualidades/${id}`);
};

export const getMensualidadesPendientes = (params = {}) => {
  return axios.get(`${API_URL}/mensualidades/pendientes`, { params });
};

export const getMensualidadesVencidas = (params = {}) => {
  return axios.get(`${API_URL}/mensualidades/vencidas`, { params });
};

export const getPagosMensualidad = (id) => {
  return axios.get(`${API_URL}/mensualidades/${id}/pagos`);
};