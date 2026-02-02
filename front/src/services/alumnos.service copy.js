import api from "../api/api";

// Obtener todos los alumnos
export const getAlumnos = () => {
  return api.get("/alumnos");
};

// Crear alumno
export const createAlumno = (data) => {
  return api.post("/alumnos", data);
};

// Actualizar alumno
export const updateAlumno = (id, data) => {
  return api.put(`/alumnos/${id}`, data);
};

// Eliminar alumno
export const deleteAlumno = (id) => {
  return api.delete(`/alumnos/${id}`);
};
