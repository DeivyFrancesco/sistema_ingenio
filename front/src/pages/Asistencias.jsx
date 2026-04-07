import { useEffect, useState, useMemo } from "react";
import "./Asistencias.css";
import {
  getAsistenciasPorFecha,
  marcarAsistencia,
  marcarAsistenciaLote,
} from "../services/asistencias.service";

const GRADOS = ["Inicial", "1°", "2°", "3°", "4°", "5°", "6°", "Primaria", "Secundaria"];

const ESTADOS = [
  { key: "presente",    label: "Presente",    emoji: "✅", color: "#10b981", bg: "#d1fae5", text: "#065f46" },
  { key: "tarde",       label: "Tarde",       emoji: "⏰", color: "#f59e0b", bg: "#fef3c7", text: "#78350f" },
  { key: "justificado", label: "Justificado", emoji: "📋", color: "#3b82f6", bg: "#dbeafe", text: "#1e3a8a" },
  { key: "ausente",     label: "Ausente",     emoji: "❌", color: "#ef4444", bg: "#fee2e2", text: "#7f1d1d" },
];

const getTodayStr = () => new Date().toISOString().split("T")[0];
const formatFecha = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

// ✅ CORREGIDO: construcción local de la fecha para evitar problemas de zona horaria
const getDayOfWeekNumber = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // hora local
  let dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, …, 6 = sábado
  // Convertir a: 0 = lunes, 1 = martes, …, 6 = domingo
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};

const Asistencias = () => {
  const [fecha, setFecha]           = useState(getTodayStr());
  const [alumnos, setAlumnos]       = useState([]);
  const [stats, setStats]           = useState({ presentes: 0, ausentes: 0, tarde: 0, justificado: 0, sinMarcar: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [gradoFilter, setGradoFilter] = useState("");
  const [loading, setLoading]       = useState(true);
  const [marking, setMarking]       = useState({});
  const [mensaje, setMensaje]       = useState({ text: "", type: "" });
  const [loteLoading, setLoteLoading] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await getAsistenciasPorFecha({ fecha });
      // ✅ Usar el estado que viene de la API (no forzar null)
      const rows = (res.data.alumnos || []).map(alumno => ({ ...alumno, estado: alumno.estado ?? null }));
      setAlumnos(rows);
      // ✅ Calcular stats reales desde los datos cargados
      setStats(recalcStats(rows));
    } catch {
      showMsg("Error al cargar alumnos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [fecha]);

  const showMsg = (text, type = "success") => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: "", type: "" }), 3200);
  };

  const recalcStats = (lista) => ({
    presentes:   lista.filter((a) => a.estado === "presente").length,
    ausentes:    lista.filter((a) => a.estado === "ausente").length,
    tarde:       lista.filter((a) => a.estado === "tarde").length,
    justificado: lista.filter((a) => a.estado === "justificado").length,
    sinMarcar:   lista.filter((a) => !a.estado && a.matricula_id).length,
  });

  const handleMarcar = async (alumno, estado) => {
    if (!alumno.matricula_id || marking[alumno.alumno_id]) return;

    setMarking((m) => ({ ...m, [alumno.alumno_id]: true }));
    const prevEstado = alumno.estado;

    setAlumnos((prev) => {
      const updated = prev.map((a) =>
        a.alumno_id === alumno.alumno_id ? { ...a, estado } : a
      );
      setStats(recalcStats(updated));
      return updated;
    });

    try {
      await marcarAsistencia({ alumno_id: alumno.alumno_id, fecha, estado });
    } catch {
      setAlumnos((prev) => {
        const reverted = prev.map((a) =>
          a.alumno_id === alumno.alumno_id ? { ...a, estado: prevEstado } : a
        );
        setStats(recalcStats(reverted));
        return reverted;
      });
      showMsg("Error al marcar asistencia", "error");
    } finally {
      setMarking((m) => ({ ...m, [alumno.alumno_id]: false }));
    }
  };

  const handleMarcarTodosPendientes = async (estado) => {
    const pendientes = filtered.filter((a) => a.matricula_id && !a.estado);
    if (pendientes.length === 0) {
      showMsg("Todos ya tienen asistencia marcada", "info");
      return;
    }

    setLoteLoading(true);
    try {
      await marcarAsistenciaLote({
        fecha,
        estado,
        alumno_ids: pendientes.map((a) => a.alumno_id),
      });

      setAlumnos((prev) => {
        const ids = new Set(pendientes.map((a) => a.alumno_id));
        const updated = prev.map((a) =>
          ids.has(a.alumno_id) && !a.estado ? { ...a, estado } : a
        );
        setStats(recalcStats(updated));
        return updated;
      });

      showMsg(`✅ ${pendientes.length} alumnos marcados como "${estado}"`, "success");
    } catch {
      showMsg("Error al marcar en lote", "error");
    } finally {
      setLoteLoading(false);
    }
  };

  const getInitials = (n, a) =>
    `${(n || "")[0] || ""}${(a || "")[0] || ""}`.toUpperCase();

  const getEstadoInfo = (e) => ESTADOS.find((x) => x.key === e);

  // Filtro con la corrección del día
  const filtered = useMemo(() => {
    // Excluir alumnos sin matrícula (alumnos retirados)
    let list = alumnos.filter((a) => a.matricula_id);
    if (gradoFilter) list = list.filter((a) => a.grado === gradoFilter);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.nombres?.toLowerCase().includes(s) ||
          a.apellidos?.toLowerCase().includes(s) ||
          a.dni?.includes(s)
      );
    }
    if (!mostrarTodos) {
      const dayOfWeek = getDayOfWeekNumber(fecha);
      list = list.filter((a) => {
        if (!a.dias_asistencia || !Array.isArray(a.dias_asistencia) || a.dias_asistencia.length === 0) {
          return true; // asiste todos los días
        }
        return a.dias_asistencia.includes(dayOfWeek);
      });
    }
    return list;
  }, [alumnos, searchTerm, gradoFilter, fecha, mostrarTodos]);

  const pctAsistencia = useMemo(() => {
    const totalConMatricula = filtered.filter(a => a.matricula_id).length;
    if (totalConMatricula === 0) return 0;
    const asistencias = filtered.filter(a => a.estado === "presente" || a.estado === "tarde" || a.estado === "justificado").length;
    return Math.round((asistencias / totalConMatricula) * 100);
  }, [filtered]);

  if (loading) {
    return (
      <div className="asist-container">
        <div className="asist-loading">
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <p>Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asist-container">
      <div className="asist-header">
        <div className="asist-header-left">
          <div className="asist-icon-box">📋</div>
          <div>
            <h1 className="asist-title">Control de Asistencias</h1>
            <p className="asist-subtitle">
              {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} — {formatFecha(fecha)}
            </p>
          </div>
        </div>
        <div className="asist-date-wrap">
          <label htmlFor="fecha-pick">📅 Fecha</label>
          <input
            id="fecha-pick"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="asist-date-input"
            max={getTodayStr()}
          />
        </div>
      </div>

      {mensaje.text && (
        <div className={`asist-msg asist-msg--${mensaje.type}`}>{mensaje.text}</div>
      )}

      <div className="asist-stats">
        <div className="stat-card stat--total">
          <span className="stat-num">{filtered.length}</span>
          <span className="stat-lbl">Mostrados</span>
        </div>
        <div className="stat-card stat--presente">
          <span className="stat-num">{stats.presentes || 0}</span>
          <span className="stat-lbl">✅ Presentes</span>
        </div>
        <div className="stat-card stat--tarde">
          <span className="stat-num">{stats.tarde || 0}</span>
          <span className="stat-lbl">⏰ Tarde</span>
        </div>
        <div className="stat-card stat--justificado">
          <span className="stat-num">{stats.justificado || 0}</span>
          <span className="stat-lbl">📋 Justificado</span>
        </div>
        <div className="stat-card stat--ausente">
          <span className="stat-num">{stats.ausentes || 0}</span>
          <span className="stat-lbl">❌ Ausentes</span>
        </div>
        <div className="stat-card stat--sinmarcar">
          <span className="stat-num">{stats.sinMarcar || 0}</span>
          <span className="stat-lbl">⬜ Sin marcar</span>
        </div>
        <div className="stat-card stat--pct">
          <span className="stat-num stat-pct-num">{pctAsistencia}%</span>
          <span className="stat-lbl">Asistencia</span>
          <div className="pct-bar">
            <div className="pct-fill" style={{ width: `${pctAsistencia}%` }} />
          </div>
        </div>
      </div>

      <div className="asist-toolbar">
        <div className="asist-search-wrap">
          <span className="asist-si">🔍</span>
          <input
            type="text"
            className="asist-search"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="asist-toolbar-right">
          <select
            className="asist-fsel"
            value={gradoFilter}
            onChange={(e) => setGradoFilter(e.target.value)}
          >
            <option value="">Todos los grados</option>
            {GRADOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <label className="asist-checkbox-label">
            <input
              type="checkbox"
              checked={mostrarTodos}
              onChange={(e) => setMostrarTodos(e.target.checked)}
            />
            Mostrar todos los alumnos
          </label>
          <button
            className="btn-lote btn-lote--presente"
            onClick={() => handleMarcarTodosPendientes("presente")}
            disabled={loteLoading}
          >
            {loteLoading ? "⏳ Marcando..." : "✅ Marcar pendientes presente"}
          </button>
          <button
            className="btn-lote btn-lote--ausente"
            onClick={() => handleMarcarTodosPendientes("ausente")}
            disabled={loteLoading}
          >
            {loteLoading ? "⏳" : "❌ Marcar pendientes ausente"}
          </button>
        </div>
      </div>

      <div className="asist-list-card">
        <div className="asist-list-top">
          <h3>👥 Lista de Asistencia</h3>
          <span className="asist-count-badge">{filtered.length} alumno{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="asist-empty">
            <div style={{ fontSize: 48 }}>🔎</div>
            <p>No se encontraron alumnos con matrícula activa para este día.</p>
            {!mostrarTodos && (
              <p>Puedes activar "Mostrar todos los alumnos" para ver la lista completa.</p>
            )}
          </div>
        ) : (
          <div className="asist-rows">
            {filtered.map((alumno, i) => {
              const ei = getEstadoInfo(alumno.estado);
              const isBusy = marking[alumno.alumno_id];
              const dayOfWeek = getDayOfWeekNumber(fecha);
              const esDiaAsistencia = (!alumno.dias_asistencia || !Array.isArray(alumno.dias_asistencia) || alumno.dias_asistencia.length === 0) ||
                                      alumno.dias_asistencia.includes(dayOfWeek);

              return (
                <div
                  key={alumno.alumno_id}
                  className={`asist-row asist-row--${alumno.estado || "none"} ${isBusy ? "asist-row--busy" : ""}`}
                >
                  <span className="asist-row-num">{i + 1}</span>
                  <div
                    className="asist-avatar"
                    style={
                      ei
                        ? { background: `linear-gradient(135deg, ${ei.color} 0%, ${ei.color}99 100%)` }
                        : undefined
                    }
                  >
                    {getInitials(alumno.nombres, alumno.apellidos)}
                  </div>
                  <div className="asist-row-info">
                    <div className="asist-row-name">
                      {alumno.apellidos}, {alumno.nombres}
                    </div>
                    <div className="asist-row-meta">
                      {alumno.dni && <span className="asist-dni">{alumno.dni}</span>}
                      {alumno.grado && <span className="asist-grado">{alumno.grado}</span>}
                      {!alumno.matricula_id && <span className="asist-no-mat">Sin matrícula</span>}
                      {alumno.dias_asistencia && alumno.dias_asistencia.length > 0 && !esDiaAsistencia && (
                        <span className="asist-no-dia" title="Este alumno no asiste hoy según su horario">🚫 No asiste hoy</span>
                      )}
                    </div>
                  </div>
                  {ei ? (
                    <div
                      className="asist-estado-badge"
                      style={{ background: ei.bg, color: ei.text, borderColor: ei.color }}
                    >
                      {ei.emoji} {ei.label}
                    </div>
                  ) : (
                    alumno.matricula_id && (
                      <div className="asist-estado-badge asist-estado-badge--none">
                        ⬜ Sin marcar
                      </div>
                    )
                  )}
                  <div className="asist-btns">
                    {!alumno.matricula_id ? (
                      <span className="asist-no-mat-msg">No disponible</span>
                    ) : (
                      ESTADOS.map((est) => (
                        <button
                          key={est.key}
                          className={`btn-est ${alumno.estado === est.key ? "btn-est--active" : ""}`}
                          style={
                            alumno.estado === est.key
                              ? { background: est.color, borderColor: est.color, color: "#fff" }
                              : {}
                          }
                          onClick={() => handleMarcar(alumno, est.key)}
                          disabled={isBusy}
                          title={est.label}
                        >
                          {est.emoji}
                          <span className="btn-est-lbl">{est.label}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Asistencias;