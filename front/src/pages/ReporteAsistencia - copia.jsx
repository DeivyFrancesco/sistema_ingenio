import { useState, useMemo } from "react";
import "./ReporteAsistencia.css";
import { getReporteAsistencias } from "../services/asistencias.service";

const GRADOS = ["Inicial", "1°", "2°", "3°", "4°", "5°", "6°", "Primaria", "Secundaria"];

const getFirstOfMonth = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split("T")[0];
};
const getTodayStr = () => new Date().toISOString().split("T")[0];

const formatFecha = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

const PctBar = ({ value }) => {
  const color =
    value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="rep-pct-bar">
      <div
        className="rep-pct-fill"
        style={{ width: `${value}%`, background: color }}
      />
      <span className="rep-pct-txt" style={{ color }}>
        {value}%
      </span>
    </div>
  );
};

const ReporteAsistencia = () => {
  const [desde, setDesde]         = useState(getFirstOfMonth());
  const [hasta, setHasta]         = useState(getTodayStr());
  const [grado, setGrado]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [reporte, setReporte]     = useState(null);
  const [error, setError]         = useState("");
  const [buscarAl, setBuscarAl]   = useState("");
  const [sortField, setSortField] = useState("apellidos");
  const [sortDir, setSortDir]     = useState("asc");
  const [detalle, setDetalle]     = useState(null); // alumno_id con detalle abierto

  const handleGenerar = async () => {
    if (!desde || !hasta) {
      setError("Selecciona un rango de fechas");
      return;
    }
    if (desde > hasta) {
      setError("La fecha de inicio no puede ser mayor a la fecha final");
      return;
    }
    setError("");
    setLoading(true);
    setReporte(null);
    setDetalle(null);
    try {
      const res = await getReporteAsistencias({ desde, hasta, grado });
      setReporte(res.data);
    } catch {
      setError("Error al generar el reporte. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const filtered = useMemo(() => {
    if (!reporte) return [];
    let list = [...reporte.alumnos];
    if (buscarAl) {
      const s = buscarAl.toLowerCase();
      list = list.filter(
        (a) =>
          a.nombres?.toLowerCase().includes(s) ||
          a.apellidos?.toLowerCase().includes(s) ||
          a.dni?.includes(s)
      );
    }
    list.sort((a, b) => {
      let va, vb;
      if (sortField === "porcentaje" || sortField === "total" || sortField === "presente" ||
          sortField === "ausente" || sortField === "tarde" || sortField === "justificado") {
        va = a[sortField] ?? 0;
        vb = b[sortField] ?? 0;
        return sortDir === "asc" ? va - vb : vb - va;
      }
      va = (a[sortField] || "").toString().toLowerCase();
      vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [reporte, buscarAl, sortField, sortDir]);

  const getInitials = (n, a) =>
    `${(n || "")[0] || ""}${(a || "")[0] || ""}`.toUpperCase();

  // Totales de filtered
  const totalesFiltered = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.reduce(
      (acc, a) => ({
        presente:    acc.presente    + (a.presente    || 0),
        ausente:     acc.ausente     + (a.ausente     || 0),
        tarde:       acc.tarde       + (a.tarde       || 0),
        justificado: acc.justificado + (a.justificado || 0),
        total:       acc.total       + (a.total       || 0),
      }),
      { presente: 0, ausente: 0, tarde: 0, justificado: 0, total: 0 }
    );
  }, [filtered]);

  const handlePrint = () => window.print();

  const toggleDetalle = (alumno_id) =>
    setDetalle((d) => (d === alumno_id ? null : alumno_id));

  return (
    <div className="rep-container">

      {/* HEADER */}
      <div className="rep-header">
        <div className="rep-header-left">
          <div className="rep-icon-box">📊</div>
          <div>
            <h1 className="rep-title">Reporte de Asistencias</h1>
            <p className="rep-subtitle">Análisis por rango de fechas</p>
          </div>
        </div>
        {reporte && (
          <button className="btn-print" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="rep-filtros">
        <div className="rep-filtros-title">🔎 Filtros del Reporte</div>
        <div className="rep-filtros-grid">
          <div className="rep-fg">
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              max={hasta}
              className="rep-date-input"
            />
          </div>
          <div className="rep-fg">
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              min={desde}
              max={getTodayStr()}
              className="rep-date-input"
            />
          </div>
          <div className="rep-fg">
            <label>Grado</label>
            <select
              className="rep-select"
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
            >
              <option value="">Todos los grados</option>
              {GRADOS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="rep-fg rep-fg--btn">
            <button
              className="btn-generar"
              onClick={handleGenerar}
              disabled={loading}
            >
              {loading ? "⏳ Generando..." : "📊 Generar Reporte"}
            </button>
          </div>
        </div>
        {error && <p className="rep-error">⚠️ {error}</p>}
      </div>

      {/* SKELETON LOADING */}
      {loading && (
        <div className="rep-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rep-skel-row" />
          ))}
        </div>
      )}

      {/* RESULTADOS */}
      {reporte && !loading && (
        <>
          {/* RESUMEN GENERAL */}
          <div className="rep-resumen">
            <div className="rep-resumen-header">
              <strong>📋 Resumen</strong>
              <span>
                {formatFecha(reporte.desde)} — {formatFecha(reporte.hasta)}
                {grado ? ` · Grado: ${grado}` : ""}
              </span>
            </div>
            <div className="rep-resumen-stats">
              <div className="rep-rstat">
                <span className="rep-rstat-num">{reporte.alumnos.length}</span>
                <span className="rep-rstat-lbl">Alumnos</span>
              </div>
              <div className="rep-rstat rep-rstat--presente">
                <span className="rep-rstat-num">{reporte.totales.presente}</span>
                <span className="rep-rstat-lbl">✅ Presentes</span>
              </div>
              <div className="rep-rstat rep-rstat--tarde">
                <span className="rep-rstat-num">{reporte.totales.tarde}</span>
                <span className="rep-rstat-lbl">⏰ Tardes</span>
              </div>
              <div className="rep-rstat rep-rstat--just">
                <span className="rep-rstat-num">{reporte.totales.justificado}</span>
                <span className="rep-rstat-lbl">📋 Justificados</span>
              </div>
              <div className="rep-rstat rep-rstat--ausente">
                <span className="rep-rstat-num">{reporte.totales.ausente}</span>
                <span className="rep-rstat-lbl">❌ Ausentes</span>
              </div>
              <div className="rep-rstat rep-rstat--total">
                <span className="rep-rstat-num">{reporte.totales.total}</span>
                <span className="rep-rstat-lbl">Total registros</span>
              </div>
            </div>
          </div>

          {/* BUSCADOR en el reporte */}
          {reporte.alumnos.length > 0 && (
            <div className="rep-search-wrap">
              <span className="rep-si">🔍</span>
              <input
                type="text"
                className="rep-search"
                placeholder="Buscar alumno en el reporte..."
                value={buscarAl}
                onChange={(e) => setBuscarAl(e.target.value)}
              />
            </div>
          )}

          {/* TABLA */}
          {filtered.length === 0 ? (
            <div className="rep-empty">
              {reporte.alumnos.length === 0
                ? "No se encontraron registros de asistencia en ese período."
                : "No coincide ningún alumno con la búsqueda."}
            </div>
          ) : (
            <div className="rep-table-card">
              <div className="rep-table-top">
                <h3>📋 Detalle por Alumno</h3>
                <span className="rep-count">{filtered.length} alumno{filtered.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="rep-table-wrap">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="sortable" onClick={() => toggleSort("apellidos")}>Alumno{sortIcon("apellidos")}</th>
                      <th className="sortable" onClick={() => toggleSort("grado")}>Grado{sortIcon("grado")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("presente")}>✅{sortIcon("presente")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("tarde")}>⏰{sortIcon("tarde")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("justificado")}>📋{sortIcon("justificado")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("ausente")}>❌{sortIcon("ausente")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("total")}>Días{sortIcon("total")}</th>
                      <th className="sortable th-center" onClick={() => toggleSort("porcentaje")}>% Asist.{sortIcon("porcentaje")}</th>
                      <th className="th-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <>
                        <tr key={a.alumno_id} className={a.porcentaje < 60 ? "tr-alerta" : ""}>
                          <td className="td-num">{i + 1}</td>
                          <td>
                            <div className="rep-alumno-cell">
                              <div
                                className="rep-avatar"
                                style={
                                  a.porcentaje >= 80
                                    ? { background: "linear-gradient(135deg,#10b981,#34d399)" }
                                    : a.porcentaje >= 60
                                    ? { background: "linear-gradient(135deg,#f59e0b,#fcd34d)" }
                                    : { background: "linear-gradient(135deg,#ef4444,#f87171)" }
                                }
                              >
                                {getInitials(a.nombres, a.apellidos)}
                              </div>
                              <div>
                                <div className="rep-alumno-name">{a.apellidos}, {a.nombres}</div>
                                {a.dni && <div className="rep-alumno-dni">{a.dni}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {a.grado
                              ? <span className="rep-grado">{a.grado}</span>
                              : <span className="td-muted">—</span>}
                          </td>
                          <td className="td-center td-presente">{a.presente}</td>
                          <td className="td-center td-tarde">{a.tarde}</td>
                          <td className="td-center td-just">{a.justificado}</td>
                          <td className="td-center td-ausente">{a.ausente}</td>
                          <td className="td-center td-total">{a.total}</td>
                          <td className="td-pct">
                            <PctBar value={a.porcentaje} />
                          </td>
                          <td className="td-center">
                            <button
                              className="btn-ver-detalle"
                              onClick={() => toggleDetalle(a.alumno_id)}
                              title="Ver detalle de asistencias"
                            >
                              {detalle === a.alumno_id ? "▲ Cerrar" : "▼ Ver"}
                            </button>
                          </td>
                        </tr>

                        {/* DETALLE EXPANDIBLE */}
                        {detalle === a.alumno_id && (
                          <tr key={`det-${a.alumno_id}`} className="tr-detalle">
                            <td colSpan="10">
                              <div className="detalle-grid">
                                {a.detalle.map((d, di) => {
                                  const estadoColors = {
                                    presente:    { bg: "#d1fae5", color: "#065f46", emoji: "✅" },
                                    ausente:     { bg: "#fee2e2", color: "#7f1d1d", emoji: "❌" },
                                    tarde:       { bg: "#fef3c7", color: "#78350f", emoji: "⏰" },
                                    justificado: { bg: "#dbeafe", color: "#1e3a8a", emoji: "📋" },
                                  };
                                  const ec = estadoColors[d.estado] || { bg: "#f1f5f9", color: "#64748b", emoji: "—" };
                                  return (
                                    <div key={di} className="detalle-item" style={{ background: ec.bg, color: ec.color }}>
                                      <div className="detalle-fecha">{formatFecha(d.fecha?.toString().slice(0, 10))}</div>
                                      <div className="detalle-est">{ec.emoji} {d.estado}</div>
                                      {d.hora_ingreso && <div className="detalle-hora">🕐 {d.hora_ingreso}</div>}
                                      {d.nota && <div className="detalle-nota">💬 {d.nota}</div>}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>

                  {/* TOTALES */}
                  {totalesFiltered && (
                    <tfoot>
                      <tr className="tr-totales">
                        <td colSpan="3"><strong>TOTALES ({filtered.length} alumnos)</strong></td>
                        <td className="td-center"><strong>{totalesFiltered.presente}</strong></td>
                        <td className="td-center"><strong>{totalesFiltered.tarde}</strong></td>
                        <td className="td-center"><strong>{totalesFiltered.justificado}</strong></td>
                        <td className="td-center"><strong>{totalesFiltered.ausente}</strong></td>
                        <td className="td-center"><strong>{totalesFiltered.total}</strong></td>
                        <td colSpan="2">
                          <strong>
                            {totalesFiltered.total > 0
                              ? Math.round(((totalesFiltered.presente + totalesFiltered.tarde + totalesFiltered.justificado) / totalesFiltered.total) * 100)
                              : 0}% promedio
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* LEYENDA */}
              <div className="rep-leyenda">
                <span className="rep-ley-item rep-ley--verde">✅ Presente</span>
                <span className="rep-ley-item rep-ley--amarillo">⏰ Tarde</span>
                <span className="rep-ley-item rep-ley--azul">📋 Justificado</span>
                <span className="rep-ley-item rep-ley--rojo">❌ Ausente</span>
                <span className="rep-ley-sep">|</span>
                <span className="rep-ley-alerta">⚠️ Fondo rojo = asistencia menor al 60%</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado vacío inicial */}
      {!reporte && !loading && (
        <div className="rep-inicial">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
          <p>Selecciona el rango de fechas y presiona <strong>Generar Reporte</strong></p>
        </div>
      )}
    </div>
  );
};

export default ReporteAsistencia;
