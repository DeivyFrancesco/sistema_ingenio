import { useEffect, useState, useMemo } from "react";
import "./Prospectos.css";
import {
  getProspectos,
  createProspecto,
  updateProspecto,
  deleteProspecto,
} from "../services/prospectos.service";

const GRADOS = ["Inicial", "1°", "2°", "3°", "4°", "5°", "6°", "Primaria", "Secundaria"];
const ESTADOS = ["pendiente", "contactado", "matriculado", "no_interesado"];
const PER_PAGE_OPTIONS = [5, 10, 20, 50];

const ESTADO_CONFIG = {
  pendiente:      { label: "Pendiente",       emoji: "🕐", class: "estado-pendiente" },
  contactado:     { label: "Contactado",      emoji: "📞", class: "estado-contactado" },
  matriculado:    { label: "Matriculado ✓",   emoji: "✅", class: "estado-matriculado" },
  no_interesado:  { label: "No interesado",   emoji: "❌", class: "estado-no_interesado" },
};

const EMPTY_FORM = {
  nombre_padre:  "",
  nombre_hijo:   "",
  telefono:      "",
  grado_interes: "",
  fecha_prevista:"",
  estado:        "pendiente",
  notas:         "",
};

// Utilidades de fecha
const hoy = () => new Date().toISOString().split("T")[0];

const diasHasta = (fechaStr) => {
  if (!fechaStr) return null;
  const diff = new Date(fechaStr + "T00:00:00") - new Date(new Date().toDateString());
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const formatFecha = (fechaStr) => {
  if (!fechaStr) return null;
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
};

const getFechaClass = (fechaStr) => {
  const dias = diasHasta(fechaStr);
  if (dias === null) return "";
  if (dias === 0) return "hoy";
  if (dias > 0 && dias <= 7) return "pronto";
  if (dias < 0) return "pasado";
  return "";
};

const Prospectos = () => {
  const [prospectos, setProspectos]   = useState([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [editId, setEditId]           = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [sortField, setSortField]     = useState("fecha_prevista");
  const [sortDir, setSortDir]         = useState("asc");
  const [showForm, setShowForm]       = useState(false);
  const [mensaje, setMensaje]         = useState({ text: "", type: "" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [searching, setSearching]     = useState(false);
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(10);

  // ─── Carga ──────────────────────────────────────────────────────────────────
  const cargarProspectos = async (isSearch = false) => {
    try {
      if (isSearch) setSearching(true);
      else setInitialLoad(true);
      const params = searchTerm ? { buscar: searchTerm } : {};
      const res = await getProspectos(params);
      setProspectos(res.data.prospectos || res.data);
    } catch (err) {
      console.error(err);
      showMsg("Error al cargar prospectos", "error");
    } finally {
      setInitialLoad(false);
      setSearching(false);
    }
  };

  useEffect(() => { cargarProspectos(false); }, []);

  useEffect(() => {
    const t = setTimeout(() => cargarProspectos(true), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { setPage(1); }, [searchTerm, estadoFilter, sortField, sortDir]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const showMsg = (text, type = "success") => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: "", type: "" }), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateProspecto(editId, form);
        showMsg("✅ Prospecto actualizado correctamente", "success");
      } else {
        await createProspecto(form);
        showMsg("✅ Prospecto registrado correctamente", "success");
      }
      resetForm();
      setSearchTerm("");
      cargarProspectos();
    } catch (err) {
      const msg = err.response?.data?.error || "Error al guardar";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const handleEdit = (p) => {
    setForm({
      nombre_padre:   p.nombre_padre,
      nombre_hijo:    p.nombre_hijo,
      telefono:       p.telefono    || "",
      grado_interes:  p.grado_interes || "",
      fecha_prevista: p.fecha_prevista ? p.fecha_prevista.split("T")[0] : "",
      estado:         p.estado,
      notas:          p.notas || "",
    });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este prospecto?")) return;
    try {
      await deleteProspecto(id);
      showMsg("🗑️ Prospecto eliminado", "info");
      cargarProspectos();
    } catch (err) {
      const msg = err.response?.data?.error || "Error al eliminar";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  // Cambio rápido de estado desde la tabla
  const handleEstadoRapido = async (p) => {
    const orden = ["pendiente", "contactado", "matriculado", "no_interesado"];
    const siguiente = orden[(orden.indexOf(p.estado) + 1) % orden.length];
    try {
      await updateProspecto(p.id, { ...p, estado: siguiente });
      setProspectos(prev =>
        prev.map(x => x.id === p.id ? { ...x, estado: siguiente } : x)
      );
    } catch {
      showMsg("❌ Error al cambiar estado", "error");
    }
  };

  // ─── Ordenamiento & filtros ──────────────────────────────────────────────────
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const filtered = useMemo(() => {
    let list = [...prospectos];
    if (estadoFilter) list = list.filter(p => p.estado === estadoFilter);
    list.sort((a, b) => {
      let va = (a[sortField] || "").toString().toLowerCase();
      let vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [prospectos, estadoFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:         prospectos.length,
    pendiente:     prospectos.filter(p => p.estado === "pendiente").length,
    contactado:    prospectos.filter(p => p.estado === "contactado").length,
    matriculado:   prospectos.filter(p => p.estado === "matriculado").length,
    no_interesado: prospectos.filter(p => p.estado === "no_interesado").length,
  }), [prospectos]);

  // ─── Alertas de próximos ─────────────────────────────────────────────────────
  const proximos = useMemo(() =>
    prospectos.filter(p => {
      const d = diasHasta(p.fecha_prevista?.split?.("T")[0] ?? p.fecha_prevista);
      return d !== null && d >= 0 && d <= 7 &&
             !["matriculado", "no_interesado"].includes(p.estado);
    }),
  [prospectos]);

  const getInitials = (padre) =>
    (padre || "").split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";

  const getPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
      pages.push(i);
    }
    return pages;
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (initialLoad) {
    return (
      <div className="prospectos-container">
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
          <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 16 }}>
            Cargando prospectos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="prospectos-container">

      {/* ─── HEADER ─── */}
      <div className="pr-header">
        <div className="pr-header-left">
          <div className="pr-icon-box">🌟</div>
          <div>
            <h1 className="pr-title">Prospectos</h1>
            <p className="pr-subtitle">
              {prospectos.length} posible{prospectos.length !== 1 ? "s" : ""} cliente{prospectos.length !== 1 ? "s" : ""} registrado{prospectos.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button className="btn-new-pr" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Prospecto"}
        </button>
      </div>

      {/* ─── ALERTA PRÓXIMOS ─── */}
      {proximos.length > 0 && (
        <div className="alert-proximos">
          <span className="alert-icon">🔔</span>
          <span className="alert-text">
            Tienes <span>{proximos.length}</span> prospecto{proximos.length !== 1 ? "s" : ""} con fecha de matrícula en los próximos 7 días.
            {proximos.map(p => (
              <span key={p.id} style={{ marginLeft: 8 }}>
                · {p.nombre_padre} ({formatFecha(p.fecha_prevista?.split?.("T")[0] ?? p.fecha_prevista)})
              </span>
            ))}
          </span>
        </div>
      )}

      {/* ─── STATS ─── */}
      <div className="pr-stats">
        <div className="stat-card total">
          <span className="stat-icon">👥</span>
          <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Total</div></div>
        </div>
        <div className="stat-card pendiente">
          <span className="stat-icon">🕐</span>
          <div><div className="stat-num">{stats.pendiente}</div><div className="stat-lbl">Pendientes</div></div>
        </div>
        <div className="stat-card contactado">
          <span className="stat-icon">📞</span>
          <div><div className="stat-num">{stats.contactado}</div><div className="stat-lbl">Contactados</div></div>
        </div>
        <div className="stat-card matriculado">
          <span className="stat-icon">✅</span>
          <div><div className="stat-num">{stats.matriculado}</div><div className="stat-lbl">Matriculados</div></div>
        </div>
        <div className="stat-card no_interesado">
          <span className="stat-icon">❌</span>
          <div><div className="stat-num">{stats.no_interesado}</div><div className="stat-lbl">No interesado</div></div>
        </div>
      </div>

      {/* ─── MENSAJE ─── */}
      {mensaje.text && <div className={`mensaje ${mensaje.type}`}>{mensaje.text}</div>}

      {/* ─── FORMULARIO ─── */}
      {showForm && (
        <div className="form-card-pr">
          <h3 className="form-card-title">
            {editId ? "✏️ Editar Prospecto" : "➕ Nuevo Prospecto"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del Padre / Apoderado *</label>
                <input
                  name="nombre_padre"
                  placeholder="Ej: Carlos Ramírez"
                  value={form.nombre_padre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre del Hijo / Alumno *</label>
                <input
                  name="nombre_hijo"
                  placeholder="Ej: Lucía Ramírez"
                  value={form.nombre_hijo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Celular</label>
                <input
                  name="telefono"
                  placeholder="987 654 321"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Grado de interés</label>
                <select name="grado_interes" value={form.grado_interes} onChange={handleChange}>
                  <option value="">Sin definir</option>
                  {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha prevista de matrícula</label>
                <input
                  type="date"
                  name="fecha_prevista"
                  value={form.fecha_prevista}
                  min={hoy()}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange}>
                  {ESTADOS.map(e => (
                    <option key={e} value={e}>{ESTADO_CONFIG[e].emoji} {ESTADO_CONFIG[e].label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Notas (opcional)</label>
                <textarea
                  name="notas"
                  placeholder="Observaciones, horarios preferidos, cursos de interés..."
                  value={form.notas}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save-pr">
                {editId ? "💾 Actualizar" : "💾 Guardar"}
              </button>
              <button type="button" className="btn-cancel-form" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TOOLBAR ─── */}
      <div className="pr-toolbar">
        <div className="search-wrap">
          <span className="search-icon">{searching ? "⏳" : "🔍"}</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por padre, alumno o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Estado:</span>
          <select className="filter-select" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{ESTADO_CONFIG[e].emoji} {ESTADO_CONFIG[e].label}</option>
            ))}
          </select>
          <select className="per-page-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
      </div>

      {/* ─── TABLA ─── */}
      <div className="table-card">
        <div className="table-top">
          <h3>🌟 Lista de Prospectos</h3>
          <span className="count-badge">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="sortable" onClick={() => toggleSort("nombre_padre")}>
                  Padre / Alumno{sortIcon("nombre_padre")}
                </th>
                <th>Celular</th>
                <th className="sortable" onClick={() => toggleSort("grado_interes")}>
                  Grado{sortIcon("grado_interes")}
                </th>
                <th className="sortable" onClick={() => toggleSort("fecha_prevista")}>
                  Fecha Matrícula{sortIcon("fecha_prevista")}
                </th>
                <th>Estado</th>
                <th>Notas</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-icon">🔎</div>
                      <p>
                        {searchTerm || estadoFilter
                          ? "No se encontraron resultados"
                          : "No hay prospectos registrados"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => {
                  const fechaStr = p.fecha_prevista ? p.fecha_prevista.split("T")[0] : null;
                  const dias = diasHasta(fechaStr);
                  const cfg  = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.pendiente;

                  return (
                    <tr key={p.id}>
                      <td style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>
                        {(page - 1) * perPage + i + 1}
                      </td>
                      <td>
                        <div className="prospecto-cell">
                          <div className="avatar-pr">{getInitials(p.nombre_padre)}</div>
                          <div className="prospecto-names">
                            <span className="padre-name">👨 {p.nombre_padre}</span>
                            <span className="hijo-name">🎒 {p.nombre_hijo}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>
                        {p.telefono
                          ? <a href={`tel:${p.telefono}`} style={{ color: "#0284c7", textDecoration: "none", fontWeight: 700 }}>📱 {p.telefono}</a>
                          : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td>
                        {p.grado_interes
                          ? <span className="grado-badge">{p.grado_interes}</span>
                          : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td>
                        {fechaStr ? (
                          <span className={`fecha-badge ${getFechaClass(fechaStr)}`}>
                            📅 {formatFecha(fechaStr)}
                            {dias === 0 && " (¡Hoy!)"}
                            {dias !== null && dias > 0 && dias <= 7 && ` (en ${dias}d)`}
                            {dias !== null && dias < 0 && ` (hace ${Math.abs(dias)}d)`}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`estado-badge ${cfg.class}`}
                          onClick={() => handleEstadoRapido(p)}
                          title="Clic para cambiar estado"
                        >
                          {cfg.emoji} {cfg.label}
                        </button>
                      </td>
                      <td>
                        {p.notas
                          ? <span className="nota-text" title={p.notas}>{p.notas}</span>
                          : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-edit"   onClick={() => handleEdit(p)}       title="Editar">✏️</button>
                          <button className="btn-delete" onClick={() => handleDelete(p.id)}  title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINACIÓN ─── */}
        {filtered.length > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Mostrando{" "}
              <span>{Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)}</span>
              {" "}de{" "}
              <span>{filtered.length}</span> prospectos
            </div>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(1)}             disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => setPage(p => p - 1)}   disabled={page === 1}>‹</button>
              {getPageNumbers().map(n => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)}   disabled={page === totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)}   disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prospectos;
