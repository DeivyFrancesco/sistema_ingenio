import { useEffect, useState } from "react";
import "./Alumnos.css";
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from "../services/alumnos.service";

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const cargar = async () => {
    const res = await getAlumnos(searchTerm ? { buscar: searchTerm } : {});
    setAlumnos(res.data.alumnos || res.data);
  };

  useEffect(() => { cargar(); }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAlumno(editId, form);
      } else {
        await createAlumno(form);
      }
      setForm({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
      setEditId(null);
      setShowForm(false);
      cargar();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleEdit = (alumno) => {
    setForm({
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      dni: alumno.dni,
      telefono: alumno.telefono || "",
      grado: alumno.grado || ""
    });
    setEditId(alumno.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este alumno?")) {
      try {
        await deleteAlumno(id);
        cargar();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="alumnos-page">
      <header className="alumnos-header">
        <h1>🎓 Alumnos</h1>
        <button className="btn-nuevo" onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setForm({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
            setEditId(null);
          }
        }}>
          {showForm ? "Cancelar" : "➕ Nuevo"}
        </button>
      </header>

      {showForm && (
        <form className="alumno-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Editar Alumno" : "Nuevo Alumno"}</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Nombres *"
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Apellidos *"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="DNI *"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <input
              type="text"
              placeholder="Grado"
              value={form.grado}
              onChange={(e) => setForm({ ...form, grado: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editId ? "Actualizar" : "Guardar"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => {
              setShowForm(false);
              setForm({ nombres: "", apellidos: "", dni: "", telefono: "", grado: "" });
              setEditId(null);
            }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <input
        className="search"
        placeholder="🔍 Buscar alumno..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* TABLA DESKTOP */}
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
            {alumnos.length > 0 ? (
              alumnos.map(a => (
                <tr key={a.id}>
                  <td data-label="DNI">{a.dni}</td>
                  <td data-label="Alumno">{a.nombres} {a.apellidos}</td>
                  <td data-label="Grado">{a.grado || "-"}</td>
                  <td data-label="Teléfono">{a.telefono || "-"}</td>
                  <td data-label="Acciones">
                    <button className="btn-edit" onClick={() => handleEdit(a)} title="Editar">
                      ✏️
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(a.id)} title="Eliminar">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No hay alumnos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARDS MOBILE */}
      <div className="cards">
        {alumnos.length > 0 ? (
          alumnos.map(a => (
            <div className="card" key={a.id}>
              <div className="card-header">
                <strong>{a.nombres} {a.apellidos}</strong>
                <div className="card-actions">
                  <button className="btn-edit-small" onClick={() => handleEdit(a)}>✏️</button>
                  <button className="btn-delete-small" onClick={() => handleDelete(a.id)}>🗑️</button>
                </div>
              </div>
              <div className="card-body">
                <span><strong>DNI:</strong> {a.dni}</span>
                <span><strong>Grado:</strong> {a.grado || "-"}</span>
                <span><strong>📞</strong> {a.telefono || "-"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-mobile">No hay alumnos registrados</div>
        )}
      </div>
    </div>
  );
};

export default Alumnos;
