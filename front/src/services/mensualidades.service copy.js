import api from "../api/api";

// Obtener todas las mensualidades con búsqueda opcional
export const getMensualidades = (params = {}) => {
    return api.get("/mensualidades", { params });
};

// Obtener mensualidades pendientes
export const getMensualidadesPendientes = () => {
    return api.get("/mensualidades/pendientes");
};

// Obtener mensualidades vencidas
export const getMensualidadesVencidas = () => {
    return api.get("/mensualidades/vencidas");
};

// Crear mensualidad
export const createMensualidad = (data) => {
    return api.post("/mensualidades", data);
};

// Actualizar mensualidad
export const updateMensualidad = (id, data) => {
    return api.put(`/mensualidades/${id}`, data);
};

// Eliminar mensualidad
export const deleteMensualidad = (id) => {
    return api.delete(`/mensualidades/${id}`);
};