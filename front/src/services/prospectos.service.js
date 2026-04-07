import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getProspectos  = (params) => axios.get(`${API}/prospectos`, { params });
export const getProspecto   = (id)     => axios.get(`${API}/prospectos/${id}`);
export const getProximos    = (dias)   => axios.get(`${API}/prospectos/proximos`, { params: { dias } });
export const createProspecto= (data)   => axios.post(`${API}/prospectos`, data);
export const updateProspecto= (id, data) => axios.put(`${API}/prospectos/${id}`, data);
export const deleteProspecto= (id)     => axios.delete(`${API}/prospectos/${id}`);
