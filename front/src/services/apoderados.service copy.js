import api from "../api/api";

// Obtener todos los apoderados
export const getApoderados = () => {
  return api.get("/apoderados");
};

// Crear apoderado
export const createApoderado = (data) => {
  return api.post("/apoderados", data);
};

// Actualizar apoderado
export const updateApoderado = (id, data) => {
  return api.put(`/apoderados/${id}`, data);
};

// Eliminar apoderado
export const deleteApoderado = (id) => {
  return api.delete(`/apoderados/${id}`);
};
