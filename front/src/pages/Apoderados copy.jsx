import { useEffect, useState } from "react";
import "./Apoderados.css";
import {
  getApoderados,
  createApoderado,
  updateApoderado,
  deleteApoderado,
} from "../services/apoderados.service";
import { getAlumnos } from "../services/alumnos.service";

const Apoderados = () => {
  const [apoderados, setApoderados] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [form, setForm] = useState({
    nombres: "",
    telefono: "",
    alumno_id: "",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resApoderados, resAlumnos] = await Promise.all([
        getApoderados(),
        getAlumnos(),
      ]);
      setApoderados(resApoderados.data);
      setAlumnos(resAlumnos.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.nombres || (!editId && !form.alumno_id)) {
      setMensaje("❌ Complete los campos obligatorios");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      if (editId) {
        await updateApoderado(editId, {
          nombres: form.nombres,
          telefono: form.telefono,
        });
        setMensaje("✅ Apoderado actualizado correctamente");
      } else {
        await createApoderado(form);
        setMensaje("✅ Apoderado registrado correctamente");
      }

      resetForm();
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar apoderado");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const editar = (a) => {
    setEditId(a.id);
    setForm({
      nombres: a.nombres,
      telefono: a.telefono || "",
      alumno_id: a.alumno_id,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este apoderado?")) return;

    try {
      await deleteApoderado(id);
      setMensaje("🗑️ Apoderado eliminado");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setForm({ nombres: "", telefono: "", alumno_id: "" });
    setEditId(null);
    setShowForm(false);
  };

  const apoderadosFiltrados = apoderados.filter(
    (a) =>
      a.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alumno_nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alumno_apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p style={{ padding: "20px" }}>Cargando apoderados...</p>;
  }

  return (
    <div className="apoderados-container">
      <h1>👨‍👩‍👧‍👦 Gestión de Apoderados</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancelar" : "Nuevo Apoderado"}
      </button>

      {showForm && (
        <form onSubmit={guardar} className="form">
          <input
            name="nombres"
            placeholder="Nombre del apoderado"
            value={form.nombres}
            onChange={handleChange}
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
          />

          {!editId && (
            <select
              name="alumno_id"
              value={form.alumno_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombres} {a.apellidos} - DNI {a.dni}
                </option>
              ))}
            </select>
          )}

          <button type="submit">
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Buscar apoderado o alumno..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "10px" }}
      />

      <table border="1" cellPadding="8" style={{ marginTop: "15px" }}>
        <thead>
          <tr>
            <th>Apoderado</th>
            <th>Teléfono</th>
            <th>Alumno</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {apoderadosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="4">No hay apoderados</td>
            </tr>
          ) : (
            apoderadosFiltrados.map((a) => (
              <tr key={a.id}>
                <td>{a.nombres}</td>
                <td>{a.telefono || "-"}</td>
                <td>
                  {a.alumno_nombres} {a.alumno_apellidos}
                </td>
                <td>
                  <button onClick={() => editar(a)}>✏️</button>
                  <button onClick={() => eliminar(a.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Apoderados;
