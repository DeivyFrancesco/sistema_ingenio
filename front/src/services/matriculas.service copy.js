import api from "../api/api";

export const getMatriculas = () => api.get("/matriculas");

export const createMatricula = (data) => api.post("/matriculas", data);

export const deleteMatricula = (id) => api.delete(`/matriculas/${id}`);