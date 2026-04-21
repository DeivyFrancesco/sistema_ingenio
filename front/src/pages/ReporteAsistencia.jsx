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

const ESTADO_COLORS = {
  presente:    { bg: "#d1fae5", color: "#065f46", emoji: "✅" },
  ausente:     { bg: "#fee2e2", color: "#7f1d1d", emoji: "❌" },
  tarde:       { bg: "#fef3c7", color: "#78350f", emoji: "⏰" },
  justificado: { bg: "#dbeafe", color: "#1e3a8a", emoji: "📋" },
};

const PctBar = ({ value }) => {
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="rep-pct-bar">
      <div className="rep-pct-fill" style={{ width: `${value}%`, background: color }} />
      <span className="rep-pct-txt" style={{ color }}>{value}%</span>
    </div>
  );
};

const getInitials = (n, a) =>
  `${(n || "")[0] || ""}${(a || "")[0] || ""}`.toUpperCase();

/* ══════════════════════════════════════════════════════════════
   MODAL DE IMPRESIÓN
══════════════════════════════════════════════════════════════ */
const PrintModal = ({ alumnos, desde, hasta, onClose, onPrint }) => {
  const [selected, setSelected]   = useState(() => new Set(alumnos.map(a => a.alumno_id)));
  const [withDetail, setWithDetail] = useState(true);
  const [search, setSearch]       = useState("");

  const lista = useMemo(() => {
    if (!search.trim()) return alumnos;
    const s = search.toLowerCase();
    return alumnos.filter(a =>
      a.nombres?.toLowerCase().includes(s) ||
      a.apellidos?.toLowerCase().includes(s) ||
      a.dni?.includes(s)
    );
  }, [alumnos, search]);

  const toggleOne = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const allSel = alumnos.length > 0 && alumnos.every(a => selected.has(a.alumno_id));

  return (
    <div className="rep-modal-overlay" onClick={onClose}>
      <div className="rep-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="rep-modal-header">
          <div>
            <h2 className="rep-modal-title">🖨️ Configurar Impresión</h2>
            <p className="rep-modal-sub">Período: {formatFecha(desde)} — {formatFecha(hasta)}</p>
          </div>
          <button className="rep-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="rep-modal-body">

          {/* ── Toggle incluir detalle ── */}
          <label className="rep-toggle-row">
            <div className={`rep-toggle-switch${withDetail ? " rep-toggle-on" : ""}`}>
              <input type="checkbox" checked={withDetail} onChange={e => setWithDetail(e.target.checked)} />
              <span className="rep-toggle-knob" />
            </div>
            <div>
              <div className="rep-toggle-text">Incluir detalle de asistencias por fecha</div>
              <div className="rep-toggle-hint">Muestra cada fecha con su estado debajo de cada alumno</div>
            </div>
          </label>

          {/* ── Buscador + seleccionar todos ── */}
          <div className="rep-modal-toolbar">
            <div className="rep-modal-search-wrap">
              <span className="rep-modal-si">🔍</span>
              <input
                type="text"
                className="rep-modal-search"
                placeholder="Buscar alumno..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="rep-modal-sclear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <button
              className="rep-modal-selall"
              onClick={() => allSel
                ? setSelected(new Set())
                : setSelected(new Set(alumnos.map(a => a.alumno_id)))
              }
            >
              {allSel ? "☐ Ninguno" : "☑ Todos"}
            </button>
          </div>

          <div className="rep-modal-count">
            <strong>{selected.size}</strong> de {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} seleccionados
          </div>

          {/* ── Lista de alumnos ── */}
          <div className="rep-modal-list">
            {lista.map(a => {
              const isSel = selected.has(a.alumno_id);
              const avatarBg = a.porcentaje >= 80
                ? "linear-gradient(135deg,#10b981,#34d399)"
                : a.porcentaje >= 60
                ? "linear-gradient(135deg,#f59e0b,#fcd34d)"
                : "linear-gradient(135deg,#ef4444,#f87171)";
              const pctColor = a.porcentaje >= 80 ? "#059669" : a.porcentaje >= 60 ? "#d97706" : "#dc2626";

              return (
                <label key={a.alumno_id} className={`rep-modal-item${isSel ? " rep-modal-item--sel" : ""}`}>
                  <input
                    type="checkbox"
                    className="rep-modal-cb"
                    checked={isSel}
                    onChange={() => toggleOne(a.alumno_id)}
                  />
                  <div className="rep-modal-av" style={{ background: avatarBg }}>
                    {getInitials(a.nombres, a.apellidos)}
                  </div>
                  <div className="rep-modal-info">
                    <span className="rep-modal-name">{a.apellidos}, {a.nombres}</span>
                    <span className="rep-modal-meta">
                      {a.grado || "Sin grado"} · {a.total} día{a.total !== 1 ? "s" : ""}
                      &nbsp;·&nbsp; ✅{a.presente} ⏰{a.tarde} 📋{a.justificado} ❌{a.ausente}
                    </span>
                  </div>
                  <span className="rep-modal-pct" style={{ color: pctColor }}>
                    {a.porcentaje}%
                  </span>
                </label>
              );
            })}
            {lista.length === 0 && (
              <div className="rep-modal-empty">Sin resultados para "{search}"</div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="rep-modal-footer">
          <button className="rep-modal-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="rep-modal-print-btn"
            disabled={selected.size === 0}
            onClick={() => onPrint(alumnos.filter(a => selected.has(a.alumno_id)), withDetail)}
          >
            🖨️ Imprimir {selected.size > 0 ? `${selected.size} alumno${selected.size !== 1 ? "s" : ""}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
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
  const [detalle, setDetalle]     = useState(null);
  const [printModal, setPrintModal] = useState(false);
  const [printData, setPrintData]   = useState(null);

  /* ── Generar ── */
  const handleGenerar = async () => {
    if (!desde || !hasta) { setError("Selecciona un rango de fechas"); return; }
    if (desde > hasta)    { setError("La fecha de inicio no puede ser mayor a la fecha final"); return; }
    setError(""); setLoading(true); setReporte(null); setDetalle(null); setPrintData(null);
    try {
      const res = await getReporteAsistencias({ desde, hasta, grado });
      setReporte(res.data);
    } catch {
      setError("Error al generar el reporte. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Ordenamiento ── */
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  /* ── Filtrado + ordenado ── */
  const filtered = useMemo(() => {
    if (!reporte) return [];
    let list = [...reporte.alumnos];
    if (buscarAl) {
      const s = buscarAl.toLowerCase();
      list = list.filter(a =>
        a.nombres?.toLowerCase().includes(s) ||
        a.apellidos?.toLowerCase().includes(s) ||
        a.dni?.includes(s)
      );
    }
    list.sort((a, b) => {
      let va, vb;
      if (["porcentaje","total","presente","ausente","tarde","justificado"].includes(sortField)) {
        va = a[sortField] ?? 0; vb = b[sortField] ?? 0;
        return sortDir === "asc" ? va - vb : vb - va;
      }
      va = (a[sortField] || "").toString().toLowerCase();
      vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [reporte, buscarAl, sortField, sortDir]);

  /* ── Totales del filtered ── */
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

  /* ── Imprimir con selección ── */
  const openPrintModal = () => setPrintModal(true);

  const handlePrintSelected = (alumnosToPrint, withDetail) => {
    setPrintData({ alumnos: alumnosToPrint, desde, hasta, withDetail });
    setPrintModal(false);
    setTimeout(() => {
      window.print();
      window.onafterprint = () => {
        setPrintData(null);
        window.onafterprint = null;
      };
    }, 350);
  };

  const toggleDetalle = (alumno_id) =>
    setDetalle(d => d === alumno_id ? null : alumno_id);

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className={`rep-container${printData ? " rep-printing" : ""}`}>

      {/* ── HEADER ── */}
      <div className="rep-header">
        <div className="rep-header-left">
          <div className="rep-icon-box">📊</div>
          <div>
            <h1 className="rep-title">Reporte de Asistencias</h1>
            <p className="rep-subtitle">Análisis por rango de fechas</p>
          </div>
        </div>
        {reporte && (
          <button className="btn-print" onClick={openPrintModal}>
            🖨️ Imprimir
          </button>
        )}
      </div>

      {/* ── FILTROS ── */}
      <div className="rep-filtros">
        <div className="rep-filtros-title">🔎 Filtros del Reporte</div>
        <div className="rep-filtros-grid">
          <div className="rep-fg">
            <label>Desde</label>
            <input
              type="date" value={desde} max={hasta} className="rep-date-input"
              onChange={e => setDesde(e.target.value)}
            />
          </div>
          <div className="rep-fg">
            <label>Hasta</label>
            <input
              type="date" value={hasta} min={desde} max={getTodayStr()} className="rep-date-input"
              onChange={e => setHasta(e.target.value)}
            />
          </div>
          <div className="rep-fg">
            <label>Grado</label>
            <select className="rep-select" value={grado} onChange={e => setGrado(e.target.value)}>
              <option value="">Todos los grados</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="rep-fg rep-fg--btn">
            <button className="btn-generar" onClick={handleGenerar} disabled={loading}>
              {loading ? "⏳ Generando..." : "📊 Generar Reporte"}
            </button>
          </div>
        </div>
        {error && <div className="rep-error">⚠️ {error}</div>}
      </div>

      {/* ── SKELETON ── */}
      {loading && (
        <div className="rep-skeleton">
          {[1, 2, 3, 4].map(i => <div key={i} className="rep-skel-row" />)}
        </div>
      )}

      {/* ── REPORTE ── */}
      {reporte && !loading && (
        <>
          {/* RESUMEN */}
          <div className="rep-resumen">
            <div className="rep-resumen-header">
              📋 Resumen
              <span>{formatFecha(desde)} — {formatFecha(hasta)}</span>
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

          {/* BUSCADOR */}
          {reporte.alumnos.length > 0 && (
            <div className="rep-search-wrap">
              <span className="rep-si">🔍</span>
              <input
                type="text" className="rep-search"
                placeholder="Buscar alumno en el reporte..."
                value={buscarAl}
                onChange={e => setBuscarAl(e.target.value)}
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
                          <td className="td-pct"><PctBar value={a.porcentaje} /></td>
                          <td className="td-center">
                            <button
                              className="btn-ver-detalle"
                              onClick={() => toggleDetalle(a.alumno_id)}
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
                                  const ec = ESTADO_COLORS[d.estado] || { bg: "#f1f5f9", color: "#64748b", emoji: "—" };
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

      {/* ── ESTADO VACÍO ── */}
      {!reporte && !loading && (
        <div className="rep-inicial">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
          <p>Selecciona el rango de fechas y presiona <strong>Generar Reporte</strong></p>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL DE SELECCIÓN PARA IMPRIMIR
      ══════════════════════════════════════════════ */}
      {printModal && reporte && (
        <PrintModal
          alumnos={filtered}
          desde={desde}
          hasta={hasta}
          onClose={() => setPrintModal(false)}
          onPrint={handlePrintSelected}
        />
      )}

      {/* ══════════════════════════════════════════════
          ÁREA DE IMPRESIÓN (solo visible al imprimir)
      ══════════════════════════════════════════════ */}
      {printData && (
        <div className="rep-print-area">

          {/* Cabecera del documento */}
          <div className="rep-pa-cabecera">
            <div className="rep-pa-logo-wrap">
              <span className="rep-pa-logo-icon">🎓</span>
              <div>
                <div className="rep-pa-logo-text">Ingenio</div>
                <div className="rep-pa-logo-sub">Sistema de Gestión Escolar</div>
              </div>
            </div>
            <div className="rep-pa-title-wrap">
              <div className="rep-pa-title">REPORTE DE ASISTENCIAS</div>
              <div className="rep-pa-meta">
                Período: <strong>{formatFecha(printData.desde)} — {formatFecha(printData.hasta)}</strong>
                &nbsp;·&nbsp;
                Generado: <strong>{new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })}</strong>
                &nbsp;·&nbsp;
                <strong>{printData.alumnos.length}</strong> alumno{printData.alumnos.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Resumen global */}
          {(() => {
            const t = printData.alumnos.reduce(
              (acc, a) => ({
                presente:    acc.presente    + (a.presente    || 0),
                tarde:       acc.tarde       + (a.tarde       || 0),
                justificado: acc.justificado + (a.justificado || 0),
                ausente:     acc.ausente     + (a.ausente     || 0),
                total:       acc.total       + (a.total       || 0),
              }),
              { presente: 0, tarde: 0, justificado: 0, ausente: 0, total: 0 }
            );
            return (
              <div className="rep-pa-summary">
                <div className="rep-pa-sum-item rep-pa-sum--presente">
                  <span className="rep-pa-sum-num">{t.presente}</span>
                  <span className="rep-pa-sum-lbl">✅ Presentes</span>
                </div>
                <div className="rep-pa-sum-item rep-pa-sum--tarde">
                  <span className="rep-pa-sum-num">{t.tarde}</span>
                  <span className="rep-pa-sum-lbl">⏰ Tardes</span>
                </div>
                <div className="rep-pa-sum-item rep-pa-sum--just">
                  <span className="rep-pa-sum-num">{t.justificado}</span>
                  <span className="rep-pa-sum-lbl">📋 Justificados</span>
                </div>
                <div className="rep-pa-sum-item rep-pa-sum--ausente">
                  <span className="rep-pa-sum-num">{t.ausente}</span>
                  <span className="rep-pa-sum-lbl">❌ Ausentes</span>
                </div>
                <div className="rep-pa-sum-item rep-pa-sum--total">
                  <span className="rep-pa-sum-num">{t.total}</span>
                  <span className="rep-pa-sum-lbl">📊 Total</span>
                </div>
              </div>
            );
          })()}

          {/* Alumnos */}
          {printData.alumnos.map((a, i) => (
            <div
              key={a.alumno_id}
              className={`rep-pa-alumno${a.porcentaje < 60 ? " rep-pa-alumno--alerta" : ""}`}
            >
              {/* Fila del alumno */}
              <div className="rep-pa-al-header">
                <span className="rep-pa-al-num">{i + 1}</span>
                <div className="rep-pa-al-av" style={{
                  background: a.porcentaje >= 80
                    ? "linear-gradient(135deg,#10b981,#34d399)"
                    : a.porcentaje >= 60
                    ? "linear-gradient(135deg,#f59e0b,#fcd34d)"
                    : "linear-gradient(135deg,#ef4444,#f87171)"
                }}>
                  {getInitials(a.nombres, a.apellidos)}
                </div>
                <div className="rep-pa-al-info">
                  <span className="rep-pa-al-name">{a.apellidos}, {a.nombres}</span>
                  {a.dni && <span className="rep-pa-al-dni">{a.dni}</span>}
                </div>
                {a.grado && <span className="rep-pa-al-grado">{a.grado}</span>}
                <div className="rep-pa-al-counts">
                  <span className="rep-pa-cnt rep-pa-cnt--p">✅ {a.presente}</span>
                  <span className="rep-pa-cnt rep-pa-cnt--t">⏰ {a.tarde}</span>
                  <span className="rep-pa-cnt rep-pa-cnt--j">📋 {a.justificado}</span>
                  <span className="rep-pa-cnt rep-pa-cnt--a">❌ {a.ausente}</span>
                  <span className="rep-pa-cnt rep-pa-cnt--d">{a.total} días</span>
                </div>
                <span
                  className="rep-pa-al-pct"
                  style={{ color: a.porcentaje >= 80 ? "#059669" : a.porcentaje >= 60 ? "#d97706" : "#dc2626" }}
                >
                  {a.porcentaje}%
                </span>
              </div>

              {/* Detalle por fecha */}
              {printData.withDetail && a.detalle?.length > 0 && (
                <div className="rep-pa-detalle">
                  {a.detalle.map((d, di) => {
                    const ec = ESTADO_COLORS[d.estado] || { bg: "#f1f5f9", color: "#64748b", emoji: "—" };
                    return (
                      <div key={di} className="rep-pa-det-item" style={{ background: ec.bg, color: ec.color }}>
                        <div className="rep-pa-det-fecha">{formatFecha(d.fecha?.toString().slice(0, 10))}</div>
                        <div className="rep-pa-det-est">{ec.emoji} {d.estado}</div>
                        {d.hora_ingreso && <div className="rep-pa-det-hora">{d.hora_ingreso}</div>}
                        {d.nota && <div className="rep-pa-det-nota">"{d.nota}"</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Pie de página */}
          <div className="rep-pa-footer">
            <div>✅ Presente &nbsp;·&nbsp; ⏰ Tarde &nbsp;·&nbsp; 📋 Justificado &nbsp;·&nbsp; ❌ Ausente</div>
            <div>⚠️ Fondo rojo = porcentaje de asistencia menor al 60%</div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ReporteAsistencia;
