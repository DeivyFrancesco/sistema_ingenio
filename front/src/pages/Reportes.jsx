import { useEffect, useState } from "react";
import { getDashboard, getMorosos, getIngresos } from "../services/reportes.service";
import "./Reportes.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const YEAR_ACTUAL = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => YEAR_ACTUAL - i);
const MESES = [
  { val: "",  label: "Todo el año"  },
  { val: 1,   label: "Enero"        },
  { val: 2,   label: "Febrero"      },
  { val: 3,   label: "Marzo"        },
  { val: 4,   label: "Abril"        },
  { val: 5,   label: "Mayo"         },
  { val: 6,   label: "Junio"        },
  { val: 7,   label: "Julio"        },
  { val: 8,   label: "Agosto"       },
  { val: 9,   label: "Setiembre"    },
  { val: 10,  label: "Octubre"      },
  { val: 11,  label: "Noviembre"    },
  { val: 12,  label: "Diciembre"    },
];

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "morosos",   label: "⚠️ Morosos"   },
  { id: "ingresos",  label: "💰 Ingresos"  },
];

const Reportes = () => {
  const [tab, setTab] = useState("dashboard");

  // Dashboard
  const [dashboard, setDashboard]     = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [errorDash, setErrorDash]     = useState("");

  // Morosos
  const [morosos, setMorosos]             = useState([]);
  const [loadingMor, setLoadingMor]       = useState(false);
  const [errorMor, setErrorMor]           = useState("");
  const [morososLoaded, setMorososLoaded] = useState(false);

  // Ingresos
  const [anio, setAnio]             = useState(YEAR_ACTUAL);
  const [mes, setMes]               = useState("");
  const [ingresos, setIngresos]     = useState([]);
  const [loadingIng, setLoadingIng] = useState(false);
  const [errorIng, setErrorIng]     = useState("");

  useEffect(() => {
    getDashboard()
      .then((res) => setDashboard(res.data))
      .catch(() => setErrorDash("No se pudo cargar el dashboard."))
      .finally(() => setLoadingDash(false));
  }, []);

  useEffect(() => {
    if (tab === "morosos" && !morososLoaded) {
      setLoadingMor(true);
      getMorosos()
        .then((res) => { setMorosos(res.data); setMorososLoaded(true); })
        .catch(() => setErrorMor("No se pudo cargar la lista de morosos."))
        .finally(() => setLoadingMor(false));
    }
  }, [tab, morososLoaded]);

  useEffect(() => {
    if (tab === "ingresos") buscarIngresos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const buscarIngresos = () => {
    setLoadingIng(true);
    setErrorIng("");
    getIngresos(anio, mes || null)
      .then((res) => setIngresos(res.data))
      .catch(() => setErrorIng("No se pudo cargar los ingresos."))
      .finally(() => setLoadingIng(false));
  };

  return (
    <div className="repd-page">

      <div className="repd-header">
        <div className="repd-header-left">
          <span className="repd-icon">📊</span>
          <div>
            <h1>Reportes</h1>
            <p>Indicadores y estadísticas del colegio.</p>
          </div>
        </div>
      </div>

      <div className="repd-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`repd-tab${tab === t.id ? " repd-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === "dashboard" && (
        <>
          {loadingDash && <div className="repd-loading">Cargando dashboard...</div>}
          {errorDash   && <div className="repd-alert">{errorDash}</div>}
          {!loadingDash && !errorDash && dashboard && (
            <>
              <div className="repd-grid">
                <div className="repd-card repd-card--blue">
                  <div className="repd-card-icon">👨‍🎓</div>
                  <div className="repd-card-title">Alumnos</div>
                  <div className="repd-card-value">{dashboard.total_alumnos}</div>
                  <div className="repd-card-meta">Total registrados</div>
                  <div className="repd-card-extra">Matrículas activas: <strong>{dashboard.matriculas_activas}</strong></div>
                </div>

                <div className="repd-card repd-card--green">
                  <div className="repd-card-icon">💰</div>
                  <div className="repd-card-title">Ingresos del mes</div>
                  <div className="repd-card-value repd-card-value--sm">{formatMoney(dashboard.ingresos_mes_actual)}</div>
                  <div className="repd-card-meta">Mes actual</div>
                  <div className="repd-card-extra">Vencidas: <strong>{dashboard.mensualidades_vencidas}</strong></div>
                </div>

                <div className="repd-card repd-card--red">
                  <div className="repd-card-icon">⚠️</div>
                  <div className="repd-card-title">Morosidad</div>
                  <div className="repd-card-value">{dashboard.alumnos_morosos}</div>
                  <div className="repd-card-meta">Alumnos con deuda vencida</div>
                  <div className="repd-card-extra">Pendientes: <strong>{dashboard.mensualidades_pendientes}</strong></div>
                </div>

                <div className="repd-card repd-card--purple">
                  <div className="repd-card-icon">📘</div>
                  <div className="repd-card-title">Cursos</div>
                  <div className="repd-card-value">{dashboard.total_cursos}</div>
                  <div className="repd-card-meta">Cursos registrados</div>
                  <div className="repd-card-extra">Matrículas activas: <strong>{dashboard.matriculas_activas}</strong></div>
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
                    <strong className="repd-metric--danger">{dashboard.mensualidades_vencidas}</strong>
                  </div>
                  <div className="repd-metric-box">
                    <span className="repd-metric-label">Mensualidades pendientes</span>
                    <strong className="repd-metric--warn">{dashboard.mensualidades_pendientes}</strong>
                  </div>
                  <div className="repd-metric-box">
                    <span className="repd-metric-label">Ingresos mes actual</span>
                    <strong className="repd-metric--success">{formatMoney(dashboard.ingresos_mes_actual)}</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── MOROSOS ── */}
      {tab === "morosos" && (
        <div className="repd-chart-card">
          <div className="repd-chart-header">
            <div>
              <h2>⚠️ Alumnos Morosos</h2>
              <p>Alumnos con mensualidades en estado VENCIDO.</p>
            </div>
            {!loadingMor && (
              <span className="repd-badge repd-badge--red">{morosos.length} alumnos</span>
            )}
          </div>

          {loadingMor && <div className="repd-loading">Cargando morosos...</div>}
          {errorMor   && <div className="repd-alert">{errorMor}</div>}

          {!loadingMor && !errorMor && (
            morosos.length === 0 ? (
              <div className="repd-empty">✅ No hay alumnos morosos actualmente.</div>
            ) : (
              <div className="repd-table-wrap">
                <table className="repd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Alumno</th>
                      <th>DNI</th>
                      <th>Teléfono</th>
                      <th>Mensualidades vencidas</th>
                      <th>Deuda estimada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {morosos.map((m, i) => (
                      <tr key={m.id}>
                        <td>{i + 1}</td>
                        <td>{m.nombres} {m.apellidos}</td>
                        <td>{m.dni}</td>
                        <td>{m.telefono || "—"}</td>
                        <td><span className="repd-badge repd-badge--red">{m.mensualidades_vencidas}</span></td>
                        <td className="repd-td--danger">{formatMoney(m.deuda_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ── INGRESOS ── */}
      {tab === "ingresos" && (
        <div className="repd-chart-card">
          <div className="repd-chart-header">
            <div>
              <h2>💰 Ingresos por Período</h2>
              <p>Total de pagos recibidos agrupados por mes.</p>
            </div>
          </div>

          <div className="repd-filters">
            <div className="repd-filter-group">
              <label>Año</label>
              <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="repd-filter-group">
              <label>Mes</label>
              <select value={mes} onChange={(e) => setMes(e.target.value === "" ? "" : Number(e.target.value))}>
                {MESES.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
            </div>
            <button className="repd-btn" onClick={buscarIngresos}>🔍 Buscar</button>
          </div>

          {loadingIng && <div className="repd-loading">Cargando ingresos...</div>}
          {errorIng   && <div className="repd-alert">{errorIng}</div>}

          {!loadingIng && !errorIng && (
            ingresos.length === 0 ? (
              <div className="repd-empty">No hay ingresos registrados para ese período.</div>
            ) : (
              <>
                <div className="repd-ing-total">
                  <span>Total del período:</span>
                  <strong>{formatMoney(ingresos.reduce((acc, r) => acc + parseFloat(r.total_ingresos || 0), 0))}</strong>
                </div>
                <div className="repd-table-wrap">
                  <table className="repd-table">
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th>N° de pagos</th>
                        <th>Total ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresos.map((r) => (
                        <tr key={r.periodo}>
                          <td>{r.periodo}</td>
                          <td>{r.total_pagos}</td>
                          <td className="repd-td--success">{formatMoney(r.total_ingresos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;
