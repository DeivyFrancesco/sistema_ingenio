import { useEffect, useState } from "react";
import { getDashboard } from "../services/reportes.service";
import "./Reportes.css";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const Reportes = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getDashboard();
        setDashboard(res.data);
      } catch (err) {
        console.error("Error cargando dashboard de reportes:", err);
        setError("No se pudo cargar los datos. Intente nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="repd-page">
      <div className="repd-header">
        <div className="repd-header-left">
          <span className="repd-icon">📊</span>
          <div>
            <h1>Dashboard de Reportes</h1>
            <p>Visión general de los indicadores del colegio.</p>
          </div>
        </div>
      </div>

      {error && <div className="repd-alert">{error}</div>}

      {loading ? (
        <div className="repd-loading">Cargando tablero de reportes...</div>
      ) : (
        <>
          <div className="repd-grid">
            <div className="repd-card">
              <div className="repd-card-title">Alumnos</div>
              <div className="repd-card-value">{dashboard.total_alumnos}</div>
              <div className="repd-card-meta">Total de alumnos registrados</div>
              <div className="repd-card-extra">
                Matrículas activas: {dashboard.matriculas_activas}
              </div>
            </div>

            <div className="repd-card">
              <div className="repd-card-title">Ingresos</div>
              <div className="repd-card-value">{formatMoney(dashboard.ingresos_mes_actual)}</div>
              <div className="repd-card-meta">Ingresos del mes actual</div>
              <div className="repd-card-extra">
                Mensualidades vencidas: {dashboard.mensualidades_vencidas}
              </div>
            </div>

            <div className="repd-card">
              <div className="repd-card-title">Morosidad</div>
              <div className="repd-card-value">{dashboard.alumnos_morosos}</div>
              <div className="repd-card-meta">Alumnos con mensualidades vencidas</div>
              <div className="repd-card-extra">
                Pendientes: {dashboard.mensualidades_pendientes}
              </div>
            </div>

            <div className="repd-card">
              <div className="repd-card-title">Cursos</div>
              <div className="repd-card-value">{dashboard.total_cursos}</div>
              <div className="repd-card-meta">Cursos registrados</div>
              <div className="repd-card-extra">
                Usuarios con matrícula activa: {dashboard.matriculas_activas}
              </div>
            </div>
          </div>

          <div className="repd-chart-card">
            <div className="repd-chart-header">
              <div>
                <h2>Indicadores clave</h2>
                <p>Resumen rápido de desempeño actual.</p>
              </div>
            </div>
            <div className="repd-chart-body">
              <div className="repd-metric-box">
                <span className="repd-metric-label">Matrículas activas</span>
                <strong>{dashboard.matriculas_activas}</strong>
              </div>
              <div className="repd-metric-box">
                <span className="repd-metric-label">Mensualidades vencidas</span>
                <strong>{dashboard.mensualidades_vencidas}</strong>
              </div>
              <div className="repd-metric-box">
                <span className="repd-metric-label">Ingresos mes</span>
                <strong>{formatMoney(dashboard.ingresos_mes_actual)}</strong>
              </div>
              <div className="repd-metric-box">
                <span className="repd-metric-label">Alumnos morosos</span>
                <strong>{dashboard.alumnos_morosos}</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;
