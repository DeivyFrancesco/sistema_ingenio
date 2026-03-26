import api from "../api/api";

// Obtener todos los pagos con búsqueda opcional
export const getPagos = (params = {}) => {
    return api.get("/pagos", { params });
};

// Crear pago
export const createPago = (data) => {
    return api.post("/pagos", data);
};

// Actualizar pago
export const updatePago = (id, data) => {
    return api.put(`/pagos/${id}`, data);
};

// Eliminar pago
export const deletePago = (id) => {
    return api.delete(`/pagos/${id}`);
};