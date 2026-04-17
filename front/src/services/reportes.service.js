import api from "../api/api";

export const getDashboard    = ()          => api.get("/reportes/dashboard");
export const getMorosos      = ()          => api.get("/reportes/morosos");
export const getEstadisticas = ()          => api.get("/reportes/estadisticas");
export const getIngresos     = (anio, mes) => {
  const params = { anio };
  if (mes) params.mes = mes;
  return api.get("/reportes/ingresos", { params });
};
