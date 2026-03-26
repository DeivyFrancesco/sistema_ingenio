import { useEffect, useState, useMemo } from "react";
import "./Alumnos.css";
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  deleteAlumno,
} from "../services/alumnos.service";

const GRADOS = ["Inicial", "1°", "2°", "3°", "4°", "5°", "6°", "Primaria", "Secundaria"];
const PER_PAGE_OPTIONS = [5, 10, 20, 50];

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [form, setForm] = useState({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradoFilter, setGradoFilter] = useState("");
  const [sortField, setSortField] = useState("apellidos");
  const [sortDir, setSortDir] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const cargarAlumnos = async (isSearch = false) => {
    try {
      if (isSearch) setSearching(true);
      else setInitialLoad(true);
      const params = searchTerm ? { buscar: searchTerm } : {};
      const res = await getAlumnos(params);
      setAlumnos(res.data.alumnos || res.data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      showMsg("Error al cargar alumnos", "error");
    } finally {
      setInitialLoad(false);
      setSearching(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarAlumnos(false);
  }, []);

  // Búsqueda con debounce — no desmonta el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarAlumnos(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [searchTerm, gradoFilter, sortField, sortDir]);

  const showMsg = (text, type = "success") => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: "", type: "" }), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAlumno(editId, form);
        showMsg("✅ Alumno actualizado correctamente", "success");
      } else {
        await createAlumno(form);
        showMsg("✅ Alumno registrado correctamente", "success");
      }
      resetForm();
      setSearchTerm("");
    } catch (error) {
      const msg = error.response?.data?.error || "Error al guardar alumno";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const handleEdit = (alumno) => {
    setForm({ nombres: alumno.nombres, apellidos: alumno.apellidos, dni: alumno.dni, telefono: alumno.telefono || "", grado: alumno.grado || "" });
    setEditId(alumno.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este alumno?")) return;
    try {
      await deleteAlumno(id);
      showMsg("🗑️ Alumno eliminado", "info");
      cargarAlumnos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al eliminar";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const resetForm = () => {
    setForm({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
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

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...alumnos];
    if (gradoFilter) list = list.filter(a => a.grado === gradoFilter);
    list.sort((a, b) => {
      let va = (a[sortField] || "").toString().toLowerCase();
      let vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [alumnos, gradoFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getInitials = (nombres, apellidos) => {
    return `${(nombres || "")[0] || ""}${(apellidos || "")[0] || ""}`.toUpperCase();
  };

  const getPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (initialLoad) {
    return (
      <div className="alumnos-container">
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 16 }}>Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alumnos-container">
      {/* HEADER */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-icon-box">🎓</div>
          <div>
            <h1 className="al-title">Gestión de Alumnos</h1>
            <p className="al-subtitle">{alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} registrado{alumnos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button className="btn-new" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Alumno"}
        </button>
      </div>

      {/* MENSAJE */}
      {mensaje.text && <div className={`mensaje ${mensaje.type}`}>{mensaje.text}</div>}

      {/* FORMULARIO */}
      {showForm && (
        <div className="form-card">
          <h3 className="form-card-title">
            {editId ? "✏️ Editar Alumno" : "➕ Nuevo Alumno"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombres *</label>
                <input name="nombres" placeholder="Ej: Juan Carlos" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos *</label>
                <input name="apellidos" placeholder="Ej: García López" value={form.apellidos} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>DNI</label>
                <input name="dni" placeholder="12345678" value={form.dni} onChange={handleChange} maxLength="8" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" placeholder="987 654 321" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Grado</label>
                <select name="grado" value={form.grado} onChange={handleChange}>
                  <option value="">Sin grado</option>
                  {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editId ? "💾 Actualizar" : "💾 Guardar"}
              </button>
              <button type="button" className="btn-cancel-form" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="al-toolbar">
        <div className="search-wrap">
          <span className="search-icon">{searching ? "⏳" : "🔍"}</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Grado:</span>
          <select className="filter-select" value={gradoFilter} onChange={(e) => setGradoFilter(e.target.value)}>
            <option value="">Todos</option>
            {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="per-page-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-card">
        <div className="table-top">
          <h3>📋 Lista de Alumnos</h3>
          <span className="count-badge">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="sortable" onClick={() => toggleSort("dni")}>DNI{sortIcon("dni")}</th>
                <th className="sortable" onClick={() => toggleSort("apellidos")}>Alumno{sortIcon("apellidos")}</th>
                <th className="sortable" onClick={() => toggleSort("grado")}>Grado{sortIcon("grado")}</th>
                <th>Teléfono</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon">🔎</div>
                      <p>{searchTerm || gradoFilter ? "No se encontraron resultados" : "No hay alumnos registrados"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>
                      {(page - 1) * perPage + i + 1}
                    </td>
                    <td><span className="dni-text">{a.dni}</span></td>
                    <td>
                      <div className="alumno-cell">
                        <div className="avatar">{getInitials(a.nombres, a.apellidos)}</div>
                        <div className="alumno-name">{a.nombres} {a.apellidos}</div>
                      </div>
                    </td>
                    <td>
                      {a.grado
                        ? <span className="grado-badge">{a.grado}</span>
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td style={{ color: "#64748b" }}>{a.telefono || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-edit" onClick={() => handleEdit(a)} title="Editar">✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(a.id)} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {filtered.length > 0 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Mostrando <span>{Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)}</span> de <span>{filtered.length}</span> alumnos
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

export default Alumnos;
