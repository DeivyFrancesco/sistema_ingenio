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
    precio: "",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const res = await getCursos();
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.nivel || !form.precio) {
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
      cargarCursos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar curso");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const editar = (c) => {
    setEditId(c.id);
    setForm({
      nombre: c.nombre,
      nivel: c.nivel,
      precio: c.precio,
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
    }
  };

  const resetForm = () => {
    setForm({ nombre: "", nivel: "", precio: "" });
    setEditId(null);
    setShowForm(false);
  };

  const cursosFiltrados = cursos.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nivel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <input
            name="nivel"
            placeholder="Nivel (Primaria / Secundaria / Pre)"
            value={form.nivel}
            onChange={handleChange}
            required
          />
          <input
            name="precio"
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Buscar curso o nivel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "10px" }}
      />

      <table border="1" cellPadding="8" style={{ marginTop: "15px" }}>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Nivel</th>
            <th>Precio (S/)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="4">No hay cursos</td>
            </tr>
          ) : (
            cursosFiltrados.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.nivel}</td>
                <td>{c.precio}</td>
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
