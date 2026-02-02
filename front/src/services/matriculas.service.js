import api from "../api/api";

// Obtener todas las matrículas con búsqueda opcional
export const getMatriculas = (params = {}) => {
    return api.get("/matriculas", { params });
};

// Crear matrícula
export const createMatricula = (data) => {
    return api.post("/matriculas", data);
};

// Actualizar matrícula
export const updateMatricula = (id, data) => {
    return api.put(`/matriculas/${id}`, data);
};

// Eliminar matrícula
export const deleteMatricula = (id) => {
    return api.delete(`/matriculas/${id}`);
};