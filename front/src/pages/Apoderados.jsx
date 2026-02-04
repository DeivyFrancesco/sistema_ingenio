import { useEffect, useState } from "react";
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
  const [showVincular, setShowVincular] = useState(null);
  const [alumnoVincular, setAlumnoVincular] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { buscar: searchTerm } : {};
      
      const [resApoderados, resAlumnos] = await Promise.all([
        getApoderados(params),
        getAlumnos(),
      ]);
      
      setApoderados(resApoderados.data.apoderados || resApoderados.data);
      setAlumnos(resAlumnos.data.alumnos || resAlumnos.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [searchTerm]);

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
      setSearchTerm("");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al guardar apoderado";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleVincular = async (apoderadoId) => {
    if (!alumnoVincular) {
      setMensaje("❌ Seleccione un alumno");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      await vincularAlumno(apoderadoId, alumnoVincular);
      setMensaje("✅ Alumno vinculado correctamente");
      setShowVincular(null);
      setAlumnoVincular("");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al vincular";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleDesvincular = async (apoderadoId, alumnoId) => {
    if (!window.confirm("¿Desvincular este alumno del apoderado?")) return;

    try {
      await desvincularAlumno(apoderadoId, alumnoId);
      setMensaje("✅ Alumno desvinculado");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al desvincular";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const editar = (a) => {
    setEditId(a.id);
    setForm({
      nombres: a.nombres,
      telefono: a.telefono || "",
      alumno_id: "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este apoderado? (Se eliminarán todos sus vínculos)")) return;

    try {
      await deleteApoderado(id);
      setMensaje("🗑️ Apoderado eliminado");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Error al eliminar";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetForm = () => {
    setForm({ nombres: "", telefono: "", alumno_id: "" });
    setEditId(null);
    setShowForm(false);
  };

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
            placeholder="Nombre completo del apoderado"
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
        placeholder="🔍 Buscar apoderado..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "10px", width: "100%", padding: "8px" }}
      />

      <table border="1" cellPadding="8" style={{ marginTop: "15px", width: "100%" }}>
        <thead>
          <tr>
            <th>Apoderado</th>
            <th>Teléfono</th>
            <th>Alumnos a cargo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {apoderados.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                {searchTerm ? "No se encontraron resultados" : "No hay apoderados registrados"}
              </td>
            </tr>
          ) : (
            apoderados.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.nombres}</strong></td>
                <td>{a.telefono || "-"}</td>
                <td>
                  {a.alumnos && a.alumnos.length > 0 && a.alumnos[0].alumno_id ? (
                    <div>
                      {a.alumnos.map((alumno, idx) => (
                        alumno.alumno_id ? (
                          <div key={idx} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>
                              {alumno.alumno_nombres} {alumno.alumno_apellidos}
                              {alumno.alumno_dni && ` (DNI: ${alumno.alumno_dni})`}
                            </span>
                            <button
                              onClick={() => handleDesvincular(a.id, alumno.alumno_id)}
                              style={{ marginLeft: "10px", fontSize: "12px", padding: "2px 6px" }}
                              title="Desvincular"
                            >
                              ✖️
                            </button>
                          </div>
                        ) : null
                      ))}
                      <button
                        onClick={() => setShowVincular(showVincular === a.id ? null : a.id)}
                        style={{ marginTop: "5px", fontSize: "12px" }}
                      >
                        ➕ Vincular otro alumno
                      </button>
                      
                      {showVincular === a.id && (
                        <div style={{ marginTop: "10px" }}>
                          <select
                            value={alumnoVincular}
                            onChange={(e) => setAlumnoVincular(e.target.value)}
                            style={{ padding: "5px", width: "100%" }}
                          >
                            <option value="">Seleccione alumno</option>
                            {alumnos.map((al) => (
                              <option key={al.id} value={al.id}>
                                {al.nombres} {al.apellidos} - DNI {al.dni}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleVincular(a.id)}
                            style={{ marginTop: "5px", width: "100%" }}
                          >
                            Vincular
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: "#999" }}>Sin alumnos vinculados</span>
                  )}
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