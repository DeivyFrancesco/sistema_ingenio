import { useEffect, useState, useMemo } from "react";
import "./Apoderados.css";
import {
  getApoderados,
  createApoderado,
  updateApoderado,
  deleteApoderado,
  vincularAlumno,
  desvincularAlumno,
} from "../services/apoderados.service";
import { getAlumnos } from "../services/alumnos.service";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

const Apoderados = () => {
  const [apoderados, setApoderados] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [form, setForm] = useState({ nombres: "", telefono: "", alumno_id: "" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showVincular, setShowVincular] = useState(null);
  const [alumnoVincular, setAlumnoVincular] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombres");
  const [sortDir, setSortDir] = useState("asc");
  const [filterConAlumnos, setFilterConAlumnos] = useState("todos");
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const cargarDatos = async () => {
    try {
      setInitialLoad(true);
      const [resAp, resAl] = await Promise.all([getApoderados({}), getAlumnos()]);
      setApoderados(resAp.data.apoderados || resAp.data);
      setAlumnos(resAl.data.alumnos || resAl.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showMsg("Error al cargar datos", "error");
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, filterConAlumnos, sortField, sortDir]);

  const showMsg = (text, type = "success") => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: "", type: "" }), 3500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombres || (!editId && !form.alumno_id)) {
      showMsg("❌ Complete los campos obligatorios", "error");
      return;
    }
    try {
      if (editId) {
        await updateApoderado(editId, { nombres: form.nombres, telefono: form.telefono });
        showMsg("✅ Apoderado actualizado correctamente", "success");
      } else {
        await createApoderado(form);
        showMsg("✅ Apoderado registrado correctamente", "success");
      }
      resetForm();
      cargarDatos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al guardar apoderado";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const handleVincular = async (apoderadoId) => {
    if (!alumnoVincular) { showMsg("❌ Seleccione un alumno", "error"); return; }
    try {
      await vincularAlumno(apoderadoId, alumnoVincular);
      showMsg("✅ Alumno vinculado correctamente", "success");
      setShowVincular(null);
      setAlumnoVincular("");
      cargarDatos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al vincular";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const handleDesvincular = async (apoderadoId, alumnoId) => {
    if (!window.confirm("¿Desvincular este alumno del apoderado?")) return;
    try {
      await desvincularAlumno(apoderadoId, alumnoId);
      showMsg("✅ Alumno desvinculado", "info");
      cargarDatos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al desvincular";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const editar = (a) => {
    setEditId(a.id);
    setForm({ nombres: a.nombres, telefono: a.telefono || "", alumno_id: "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este apoderado? Se eliminarán todos sus vínculos.")) return;
    try {
      await deleteApoderado(id);
      showMsg("🗑️ Apoderado eliminado", "info");
      cargarDatos();
    } catch (error) {
      const msg = error.response?.data?.error || "Error al eliminar";
      showMsg(`❌ ${msg}`, "error");
    }
  };

  const resetForm = () => {
    setForm({ nombres: "", telefono: "", alumno_id: "" });
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

  const tieneAlumnos = (a) => a.alumnos && a.alumnos.length > 0 && a.alumnos[0]?.alumno_id;

  const filtered = useMemo(() => {
    let list = [...apoderados];

    // Filtro por búsqueda: apoderado O alumno vinculado
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter((a) => {
        const matchApoderado = (a.nombres || "").toLowerCase().includes(s) ||
                               (a.telefono || "").includes(s);
        const matchAlumno = (a.alumnos || []).some(
          (al) =>
            (al.alumno_nombres || "").toLowerCase().includes(s) ||
            (al.alumno_apellidos || "").toLowerCase().includes(s) ||
            (al.alumno_dni || "").includes(s)
        );
        return matchApoderado || matchAlumno;
      });
    }

    if (filterConAlumnos === "con") list = list.filter(tieneAlumnos);
    if (filterConAlumnos === "sin") list = list.filter(a => !tieneAlumnos(a));

    list.sort((a, b) => {
      let va = (a[sortField] || "").toString().toLowerCase();
      let vb = (b[sortField] || "").toString().toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [apoderados, searchTerm, filterConAlumnos, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getInitials = (nombres) => {
    const parts = (nombres || "").split(" ");
    return parts.slice(0, 2).map(p => p[0] || "").join("").toUpperCase();
  };

  const getPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) pages.push(i);
    return pages;
  };

  if (initialLoad) {
    return (
      <div className="apoderados-container">
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
          <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 16 }}>Cargando apoderados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apoderados-container">
      <div className="ap-header">
        <div className="ap-header-left">
          <div className="ap-icon-box">👨‍👩‍👧‍👦</div>
          <div>
            <h1 className="ap-title">Gestión de Apoderados</h1>
            <p className="ap-subtitle">{apoderados.length} apoderado{apoderados.length !== 1 ? "s" : ""} registrado{apoderados.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button className="btn-new" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo Apoderado"}
        </button>
      </div>

      {mensaje.text && <div className={`mensaje ${mensaje.type}`}>{mensaje.text}</div>}

      {/* FORMULARIO */}
      {showForm && (
        <div className="form-card">
          <h3 className="form-card-title">{editId ? "✏️ Editar Apoderado" : "➕ Nuevo Apoderado"}</h3>
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre completo *</label>
                <input name="nombres" placeholder="Ej: María García López" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" placeholder="987 654 321" value={form.telefono} onChange={handleChange} />
              </div>
              {!editId && (
                <div className="form-group">
                  <label>Alumno a cargo *</label>
                  <select name="alumno_id" value={form.alumno_id} onChange={handleChange} required>
                    <option value="">Seleccione un alumno</option>
                    {alumnos.map(a => (
                      <option key={a.id} value={a.id}>{a.nombres} {a.apellidos} — DNI {a.dni}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editId ? "💾 Actualizar" : "💾 Guardar"}</button>
              <button type="button" className="btn-cancel-form" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="ap-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por apoderado o alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="per-page-select" value={filterConAlumnos} onChange={(e) => setFilterConAlumnos(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="con">Con alumnos</option>
            <option value="sin">Sin alumnos</option>
          </select>
          <select className="per-page-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-card">
        <div className="table-top">
          <h3>📋 Lista de Apoderados</h3>
          <span className="count-badge">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="sortable" onClick={() => toggleSort("nombres")}>Apoderado{sortIcon("nombres")}</th>
                <th>Teléfono</th>
                <th>Alumnos a cargo</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">🔎</div>
                      <p>{searchTerm ? "No se encontraron resultados" : "No hay apoderados registrados"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>{(page - 1) * perPage + i + 1}</td>
                    <td>
                      <div className="apoderado-cell">
                        <div className="avatar">{getInitials(a.nombres)}</div>
                        <span className="ap-name">{a.nombres}</span>
                      </div>
                    </td>
                    <td>
                      {a.telefono
                        ? <span className="telefono-text">{a.telefono}</span>
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td>
                      {tieneAlumnos(a) ? (
                        <div className="alumnos-list">
                          {a.alumnos.filter(al => al.alumno_id).map((al, idx) => (
                            <div key={idx} className="alumno-tag">
                              <span>👤 {al.alumno_nombres} {al.alumno_apellidos}{al.alumno_dni ? ` · ${al.alumno_dni}` : ""}</span>
                              <button className="btn-desvincular" onClick={() => handleDesvincular(a.id, al.alumno_id)} title="Desvincular">✕</button>
                            </div>
                          ))}
                          <button className="vincular-btn" onClick={() => setShowVincular(showVincular === a.id ? null : a.id)}>
                            ＋ Vincular otro alumno
                          </button>
                          {showVincular === a.id && (
                            <div className="vincular-dropdown">
                              <select value={alumnoVincular} onChange={(e) => setAlumnoVincular(e.target.value)}>
                                <option value="">Seleccione alumno...</option>
                                {alumnos.map(al => (
                                  <option key={al.id} value={al.id}>{al.nombres} {al.apellidos} — {al.dni}</option>
                                ))}
                              </select>
                              <button className="btn-vincular-ok" onClick={() => handleVincular(a.id)}>Vincular</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="sin-alumnos">Sin alumnos vinculados</span>
                          <br />
                          <button className="vincular-btn" style={{ marginTop: 6 }} onClick={() => setShowVincular(showVincular === a.id ? null : a.id)}>
                            ＋ Vincular alumno
                          </button>
                          {showVincular === a.id && (
                            <div className="vincular-dropdown">
                              <select value={alumnoVincular} onChange={(e) => setAlumnoVincular(e.target.value)}>
                                <option value="">Seleccione alumno...</option>
                                {alumnos.map(al => (
                                  <option key={al.id} value={al.id}>{al.nombres} {al.apellidos} — {al.dni}</option>
                                ))}
                              </select>
                              <button className="btn-vincular-ok" onClick={() => handleVincular(a.id)}>Vincular</button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-edit" onClick={() => editar(a)} title="Editar">✏️</button>
                        <button className="btn-delete" onClick={() => eliminar(a.id)} title="Eliminar">🗑️</button>
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
              Mostrando <span>{Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)}</span> de <span>{filtered.length}</span> apoderados
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

export default Apoderados;
