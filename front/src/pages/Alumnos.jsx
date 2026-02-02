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
      <h1>🎓 Gestión de Alumnos</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancelar" : "Nuevo Alumno"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <input
            name="nombres"
            placeholder="Nombres"
            value={form.nombres}
            onChange={handleChange}
            required
          />
          <input
            name="apellidos"
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
          />
          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            maxLength="8"
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
          />
          <input
            name="grado"
            placeholder="Grado"
            value={form.grado}
            onChange={handleChange}
          />

          <button type="submit">
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="🔍 Buscar por nombre, apellido o DNI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "10px", width: "100%", padding: "8px" }}
      />

      <table border="1" cellPadding="8" style={{ marginTop: "15px", width: "100%" }}>
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
              <td colSpan="5" style={{ textAlign: "center" }}>
                {searchTerm ? "No se encontraron resultados" : "No hay alumnos registrados"}
              </td>
            </tr>
          ) : (
            alumnos.map((a) => (
              <tr key={a.id}>
                <td>{a.dni}</td>
                <td>
                  {a.nombres} {a.apellidos}
                </td>
                <td>{a.grado || "-"}</td>
                <td>{a.telefono || "-"}</td>
                <td>
                  <button onClick={() => handleEdit(a)}>✏️</button>
                  <button onClick={() => handleDelete(a.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Alumnos;