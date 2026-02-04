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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando apoderados...</p>
      </div>
    );
  }

  return (
    <div className="apoderados-page">
      <header className="apoderados-header">
        <h1>👨‍👩‍👧‍👦 Gestión de Apoderados</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nuevo Apoderado"}
        </button>
      </header>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editId ? "Editar Apoderado" : "Nuevo Apoderado"}</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Nombre completo del apoderado *</label>
              <input
                name="nombres"
                placeholder="Nombre completo"
                value={form.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            {!editId && (
              <div className="form-group">
                <label>Seleccione alumno *</label>
                <select
                  name="alumno_id"
                  value={form.alumno_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Seleccionar alumno --</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombres} {a.apellidos} - DNI {a.dni}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

      <input
        className="search"
        type="text"
        placeholder="🔍 Buscar apoderado..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabla Desktop */}
      <div className="table-wrapper">
        <table>
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
                <td colSpan="4" className="no-data">
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
                      <div className="alumnos-list">
                        {a.alumnos.map((alumno, idx) => (
                          alumno.alumno_id ? (
                            <div key={idx} className="alumno-item">
                              <span>
                                {alumno.alumno_nombres} {alumno.alumno_apellidos}
                                {alumno.alumno_dni && ` (DNI: ${alumno.alumno_dni})`}
                              </span>
                              <button
                                className="btn-desvincular"
                                onClick={() => handleDesvincular(a.id, alumno.alumno_id)}
                                title="Desvincular"
                              >
                                ✖️
                              </button>
                            </div>
                          ) : null
                        ))}
                        <button
                          className="btn-vincular-otro"
                          onClick={() => setShowVincular(showVincular === a.id ? null : a.id)}
                        >
                          ➕ Vincular otro alumno
                        </button>
                        
                        {showVincular === a.id && (
                          <div className="vincular-form">
                            <select
                              value={alumnoVincular}
                              onChange={(e) => setAlumnoVincular(e.target.value)}
                            >
                              <option value="">Seleccione alumno</option>
                              {alumnos.map((al) => (
                                <option key={al.id} value={al.id}>
                                  {al.nombres} {al.apellidos} - DNI {al.dni}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn-vincular-submit"
                              onClick={() => handleVincular(a.id)}
                            >
                              Vincular
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="sin-alumnos">Sin alumnos vinculados</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => editar(a)} title="Editar">✏️</button>
                    <button className="btn-delete" onClick={() => eliminar(a.id)} title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="cards">
        {apoderados.length === 0 ? (
          <div className="no-data-mobile">
            {searchTerm ? "No se encontraron resultados" : "No hay apoderados registrados"}
          </div>
        ) : (
          apoderados.map((a) => (
            <div className="card" key={a.id}>
              <div className="card-header">
                <strong>{a.nombres}</strong>
                <div className="card-actions">
                  <button className="btn-edit-small" onClick={() => editar(a)}>✏️</button>
                  <button className="btn-delete-small" onClick={() => eliminar(a.id)}>🗑️</button>
                </div>
              </div>
              <div className="card-body">
                <span><strong>📞 Teléfono:</strong> {a.telefono || "-"}</span>
                
                <div className="card-alumnos">
                  <strong>Alumnos a cargo:</strong>
                  {a.alumnos && a.alumnos.length > 0 && a.alumnos[0].alumno_id ? (
                    <div className="alumnos-list-mobile">
                      {a.alumnos.map((alumno, idx) => (
                        alumno.alumno_id ? (
                          <div key={idx} className="alumno-item-mobile">
                            <span>
                              • {alumno.alumno_nombres} {alumno.alumno_apellidos}
                              {alumno.alumno_dni && ` (DNI: ${alumno.alumno_dni})`}
                            </span>
                            <button
                              className="btn-desvincular-small"
                              onClick={() => handleDesvincular(a.id, alumno.alumno_id)}
                            >
                              ✖️
                            </button>
                          </div>
                        ) : null
                      ))}
                      <button
                        className="btn-vincular-mobile"
                        onClick={() => setShowVincular(showVincular === a.id ? null : a.id)}
                      >
                        ➕ Vincular otro
                      </button>
                      
                      {showVincular === a.id && (
                        <div className="vincular-form-mobile">
                          <select
                            value={alumnoVincular}
                            onChange={(e) => setAlumnoVincular(e.target.value)}
                          >
                            <option value="">Seleccione alumno</option>
                            {alumnos.map((al) => (
                              <option key={al.id} value={al.id}>
                                {al.nombres} {al.apellidos} - DNI {al.dni}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => handleVincular(a.id)}>
                            Vincular
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="sin-alumnos">Sin alumnos vinculados</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Apoderados;
