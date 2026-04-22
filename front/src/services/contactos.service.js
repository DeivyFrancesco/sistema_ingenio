import api from "../api/api";

export const enviarMensaje = (data) => {
  return api.post("/contactos", data); // 👈 CORRECTO
};