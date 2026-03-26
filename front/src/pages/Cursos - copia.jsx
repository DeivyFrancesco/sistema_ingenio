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
    return <p style={{ padding: "20px" }}>Cargando cursos...</p>;
  }

  return (
    <div className="cursos-container">
      <h1>📘 Gestión de Cursos</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancelar" : "Nuevo Curso"}
      </button>

      {showForm && (
        <form onSubmit={guardar} className="form">
          <input
            name="nombre"
            placeholder="Nombre del curso"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          
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

          <input
            name="precio_base"
            type="number"
            placeholder="Precio mensual"
            value={form.precio_base}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
          
          <button type="submit">
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <input
          type="text"
          placeholder="🔍 Buscar curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          style={{ padding: "8px", minWidth: "150px" }}
        >
          <option value="">Todos los niveles</option>
          <option value="Inicial">Inicial</option>
          <option value="Primaria">Primaria</option>
          <option value="Secundaria">Secundaria</option>
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ marginTop: "15px", width: "100%" }}>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Nivel</th>
            <th>Precio Mensual</th>
            <th>Precio Anual (12 meses)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                {searchTerm || nivel ? "No se encontraron resultados" : "No hay cursos registrados"}
              </td>
            </tr>
          ) : (
            cursos.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.nivel}</td>
                <td>S/ {parseFloat(c.precio_base).toFixed(2)}</td>
                <td>S/ {(parseFloat(c.precio_base) * 12).toFixed(2)}</td>
                <td>
                  <button onClick={() => editar(c)}>✏️</button>
                  <button onClick={() => eliminar(c.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Cursos;