import { useEffect, useState } from "react";
import "./Cursos.css";
import {
  getCursos,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../services/cursos.service";

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    nivel: "",
    precio_base: "",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [nivel, setNivel] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.buscar = searchTerm;
      if (nivel) params.nivel = nivel;

      const res = await getCursos(params);
      setCursos(res.data.cursos || res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [searchTerm, nivel]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.nivel || !form.precio_base) {
      setMensaje("❌ Complete todos los campos");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      if (editId) {
        await updateCurso(editId, form);
        setMensaje("✅ Curso actualizado correctamente");
      } else {
        await createCurso(form);
        setMensaje("✅ Curso registrado correctamente");
      }

      resetForm();
      setSearchTerm("");
      setNivel("");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al guardar curso";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const editar = (c) => {
    setEditId(c.id);
    setForm({
      nombre: c.nombre,
      nivel: c.nivel,
      precio_base: c.precio_base,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este curso?")) return;

    try {
      await deleteCurso(id);
      setMensaje("🗑️ Curso eliminado");
      cargarCursos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al eliminar";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetForm = () => {
    setForm({ nombre: "", nivel: "", precio_base: "" });
    setEditId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="cursos-page">
      <header className="cursos-header">
        <h1>📘 Gestión de Cursos</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nuevo Curso"}
        </button>
      </header>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editId ? "Editar Curso" : "Nuevo Curso"}</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Nombre del curso *</label>
              <input
                name="nombre"
                placeholder="Ej: Matemáticas Avanzadas"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Nivel *</label>
              <select
                name="nivel"
                value={form.nivel}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione nivel</option>
                <option value="Inicial">Inicial</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>

            <div className="form-group">
              <label>Precio mensual (S/) *</label>
              <input
                name="precio_base"
                type="number"
                placeholder="Ej: 150.00"
                value={form.precio_base}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editId ? "Actualizar" : "Guardar"}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filtros-container">
        <input
          className="search"
          type="text"
          placeholder="🔍 Buscar curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="filtro-nivel"
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
        >
          <option value="">Todos los niveles</option>
          <option value="Inicial">Inicial</option>
          <option value="Primaria">Primaria</option>
          <option value="Secundaria">Secundaria</option>
        </select>
      </div>

      {/* Tabla Desktop */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Nivel</th>
              <th>Precio Mensual</th>
              <th>Precio Anual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  {searchTerm || nivel ? "No se encontraron resultados" : "No hay cursos registrados"}
                </td>
              </tr>
            ) : (
              cursos.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>
                    <span className={`badge-nivel badge-${c.nivel.toLowerCase()}`}>
                      {c.nivel}
                    </span>
                  </td>
                  <td>S/ {parseFloat(c.precio_base).toFixed(2)}</td>
                  <td>S/ {(parseFloat(c.precio_base) * 12).toFixed(2)}</td>
                  <td>
                    <button className="btn-edit" onClick={() => editar(c)} title="Editar">✏️</button>
                    <button className="btn-delete" onClick={() => eliminar(c.id)} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="cards">
        {cursos.length === 0 ? (
          <div className="no-data-mobile">
            {searchTerm || nivel ? "No se encontraron resultados" : "No hay cursos registrados"}
          </div>
        ) : (
          cursos.map((c) => (
            <div className="card" key={c.id}>
              <div className="card-header">
                <strong>{c.nombre}</strong>
                <div className="card-actions">
                  <button className="btn-edit-small" onClick={() => editar(c)}>✏️</button>
                  <button className="btn-delete-small" onClick={() => eliminar(c.id)}>🗑️</button>
                </div>
              </div>
              <div className="card-body">
                <span>
                  <strong>Nivel:</strong> 
                  <span className={`badge-nivel badge-${c.nivel.toLowerCase()}`}>
                    {c.nivel}
                  </span>
                </span>
                <span><strong>Precio Mensual:</strong> S/ {parseFloat(c.precio_base).toFixed(2)}</span>
                <span><strong>Precio Anual:</strong> S/ {(parseFloat(c.precio_base) * 12).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cursos;
