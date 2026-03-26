import api from "../api/api";

// Obtener todos los cursos
export const getCursos = () => {
  return api.get("/cursos");
};

// Crear curso
export const createCurso = (data) => {
  return api.post("/cursos", data);
};

// Actualizar curso
export const updateCurso = (id, data) => {
  return api.put(`/cursos/${id}`, data);
};

// Eliminar curso
export const deleteCurso = (id) => {
  return api.delete(`/cursos/${id}`);
};
