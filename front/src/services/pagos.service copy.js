import api from "../api/api";

// GET - listar pagos
export const getPagos = () => {
    return api.get("/pagos");
};

// POST - crear pago
export const createPago = (data) => {
    return api.post("/pagos", data);
};

// PUT - actualizar pago
export const updatePago = (id, data) => {
    return api.put(`/pagos/${id}`, data);
};

// DELETE - eliminar pago
export const deletePago = (id) => {
    return api.delete(`/pagos/${id}`);
};