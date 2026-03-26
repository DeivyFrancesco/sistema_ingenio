import { useEffect, useState, useMemo } from "react";
import "./Cursos.css";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../services/cursos.service";

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const CURSO_ICONS = { Inicial: "🌱", Primaria: "📚", Secundaria: "🎓" };

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState({ nombre: "", nivel: "", precio_base: "" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.buscar = searchTerm;
      const res = await getCursos(params);
      setCursos(res.data.cursos || res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      showMsg("Error al cargar cursos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarCursos(); }, [searchTerm]);
  useEffect(() => { setPage(1); }, [searchTerm, nivelFilter, sortField, sortDir]);

  const showMsg = (text, type = "success") => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: "", type: "" }), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.nivel || !form.precio_base) {
      showMsg("❌ Complete todos los campos", "error");
      return;
    }
    try {
      if (editId) {
        await updateCurso(editId, form);
        showMsg("✅ Curso actualizado correctamente", "success");
      } else {
        await createCurso(form);
        showMsg("✅ Curso registrado correctamente", "success");
      }
      resetForm();
      setSearchTerm("");
    } catch (error) {
      const msg = error.response?.data?.error || "Error al guardar curso";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const editar = (c) => {
    setEditId(c.id);
    setForm({ nombre: c.nombre, nivel: c.nivel, precio_base: c.precio_base });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este curso?")) return;
    try {
      await deleteCurso(id);
      showMsg("🗑️ Curso eliminado", "info");
      cargarCursos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al eliminar";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const resetForm = () => {
    setForm({ nombre: "", nivel: "", precio_base: "" });
    setEditId(null);
    setShowForm(false);
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  // Stats
  const stats = useMemo(() => ({
    total: cursos.length,
    inicial: cursos.filter(c => c.nivel === "Inicial").length,
    primaria: cursos.filter(c => c.nivel === "Primaria").length,
    secundaria: cursos.filter(c => c.nivel === "Secundaria").length,
  }), [cursos]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...cursos];
    if (nivelFilter) list = list.filter(c => c.nivel === nivelFilter);
    list.sort((a, b) => {
      let va, vb;
      if (sortField === "precio_base") {
        va = parseFloat(a.precio_base) || 0;
        vb = parseFloat(b.precio_base) || 0;
        return sortDir === "asc" ? va - vb : vb - va;
      }
      va = (a[sortField] || "").toString().toLowerCase();
      vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [cursos, nivelFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);
    return pages;
  };

  if (loading) {
    return (
      <div className="cursos-container">
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📘</div>
          <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 16 }}>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cursos-container">
      {/* HEADER */}
      <div className="cu-header">
        <div className="cu-header-left">
          <div className="cu-icon-box">📘</div>
          <div>
            <h1 className="cu-title">Gestión de Cursos</h1>
            <p className="cu-subtitle">{cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button className="btn-new" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Curso"}
        </button>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card total" onClick={() => setNivelFilter("")} style={{ cursor: "pointer" }}>
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card inicial" onClick={() => setNivelFilter("Inicial")} style={{ cursor: "pointer" }}>
          <span className="stat-icon">🌱</span>
          <div className="stat-info">
            <span className="stat-num">{stats.inicial}</span>
            <span className="stat-label">Inicial</span>
          </div>
        </div>
        <div className="stat-card primaria" onClick={() => setNivelFilter("Primaria")} style={{ cursor: "pointer" }}>
          <span className="stat-icon">📚</span>
          <div className="stat-info">
            <span className="stat-num">{stats.primaria}</span>
            <span className="stat-label">Primaria</span>
          </div>
        </div>
        <div className="stat-card secundaria" onClick={() => setNivelFilter("Secundaria")} style={{ cursor: "pointer" }}>
          <span className="stat-icon">🎓</span>
          <div className="stat-info">
            <span className="stat-num">{stats.secundaria}</span>
            <span className="stat-label">Secundaria</span>
          </div>
        </div>
      </div>

      {mensaje.text && <div className={`mensaje ${mensaje.type}`}>{mensaje.text}</div>}

      {/* FORMULARIO */}
      {showForm && (
        <div className="form-card">
          <h3 className="form-card-title">{editId ? "✏️ Editar Curso" : "➕ Nuevo Curso"}</h3>
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del curso *</label>
                <input name="nombre" placeholder="Ej: Matemáticas" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange} required>
                  <option value="">Seleccione nivel</option>
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Precio mensual (S/) *</label>
                <input name="precio_base" type="number" placeholder="0.00" value={form.precio_base} onChange={handleChange} step="0.01" min="0" required />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editId ? "💾 Actualizar" : "💾 Guardar"}</button>
              <button type="button" className="btn-cancel-form" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="cu-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="nivel-pills">
            <button className={`nivel-pill ${nivelFilter === "" ? "active" : ""}`} onClick={() => setNivelFilter("")}>Todos</button>
            {NIVELES.map(n => (
              <button key={n} className={`nivel-pill ${nivelFilter === n ? "active" : ""}`} onClick={() => setNivelFilter(n)}>{n}</button>
            ))}
          </div>
          <select className="per-page-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-card">
        <div className="table-top">
          <h3>📋 Lista de Cursos</h3>
          <span className="count-badge">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="sortable" onClick={() => toggleSort("nombre")}>Curso{sortIcon("nombre")}</th>
                <th className="sortable" onClick={() => toggleSort("nivel")}>Nivel{sortIcon("nivel")}</th>
                <th className="sortable" onClick={() => toggleSort("precio_base")}>Precio/Mes{sortIcon("precio_base")}</th>
                <th>Precio Anual</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon">🔎</div>
                      <p>{searchTerm || nivelFilter ? "No se encontraron resultados" : "No hay cursos registrados"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>{(page - 1) * perPage + i + 1}</td>
                    <td>
                      <div className="curso-cell">
                        <div className="curso-icon">{CURSO_ICONS[c.nivel] || "📘"}</div>
                        <span style={{ fontWeight: 700 }}>{c.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`nivel-badge ${c.nivel}`}>{c.nivel}</span>
                    </td>
                    <td>
                      <span className="precio-text">S/ {parseFloat(c.precio_base).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="precio-anual">S/ {(parseFloat(c.precio_base) * 12).toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-edit" onClick={() => editar(c)} title="Editar">✏️</button>
                        <button className="btn-delete" onClick={() => eliminar(c.id)} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Mostrando <span>{Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)}</span> de <span>{filtered.length}</span> cursos
            </div>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {getPageNumbers().map(n => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cursos;
