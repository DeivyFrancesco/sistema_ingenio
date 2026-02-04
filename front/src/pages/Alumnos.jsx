import { useEffect, useState } from "react";
import "./Alumnos.css";
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  deleteAlumno,
} from "../services/alumnos.service";

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    grado: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      // Usar búsqueda del backend
      const params = searchTerm ? { buscar: searchTerm } : {};
      const res = await getAlumnos(params);
      
      // Manejar respuesta con estructura { total, alumnos }
      setAlumnos(res.data.alumnos || res.data);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, [searchTerm]); // Recargar cuando cambie la búsqueda

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAlumno(editId, form);
        setMensaje("✅ Alumno actualizado correctamente");
      } else {
        await createAlumno(form);
        setMensaje("✅ Alumno registrado correctamente");
      }
      resetForm();
      setSearchTerm(""); // Limpiar búsqueda para mostrar todos
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al guardar alumno";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleEdit = (alumno) => {
    setForm({
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      dni: alumno.dni,
      telefono: alumno.telefono || "",
      grado: alumno.grado || "",
    });
    setEditId(alumno.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este alumno?")) {
      try {
        await deleteAlumno(id);
        setMensaje("🗑️ Alumno eliminado");
        cargarAlumnos();
        setTimeout(() => setMensaje(""), 3000);
      } catch (error) {
        console.error(error);
        const errorMsg = error.response?.data?.error || "Error al eliminar";
        setMensaje(`❌ ${errorMsg}`);
        setTimeout(() => setMensaje(""), 3000);
      }
    }
  };

  const resetForm = () => {
    setForm({
      nombres: "",
      apellidos: "",
      dni: "",
      telefono: "",
      grado: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Cargando alumnos...</p>;
  }

  return (
  <div className="alumnos-container">
    <div className="alumnos-wrapper">

      <div className="header">
        <div className="header-left">
          <div className="icon-box">🎓</div>
          <div>
            <h1 className="title">Alumnos</h1>
            <p className="subtitle">Gestión de estudiantes</p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nuevo Alumno"}
        </button>
      </div>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombres</label>
              <input name="nombres" value={form.nombres} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>DNI</label>
              <input name="dni" value={form.dni} onChange={handleChange} maxLength="8" required />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Grado</label>
              <input name="grado" value={form.grado} onChange={handleChange} />
            </div>
          </div>

          <div className="form-buttons">
            <button className="btn-success" type="submit">
              {editId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Buscar por nombre, apellido o DNI"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Alumno</th>
                <th>Grado</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No hay resultados
                  </td>
                </tr>
              ) : (
                alumnos.map((a) => (
                  <tr key={a.id}>
                    <td className="dni-cell">{a.dni}</td>
                    <td className="alumno-cell">
                      <div className="avatar">
                        {a.nombres[0]}{a.apellidos[0]}
                      </div>
                      {a.nombres} {a.apellidos}
                    </td>
                    <td><span className="badge">{a.grado || "-"}</span></td>
                    <td>{a.telefono || "-"}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(a)}>✏️</button>
                      <button className="btn-delete" onClick={() => handleDelete(a.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
);
export default Alumnos;