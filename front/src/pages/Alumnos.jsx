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

  return (
    <div className="alumnos-page">
      <header className="alumnos-header">
        <h1>🎓 Alumnos</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo"}
        </button>
      </header>

      <input
        className="search"
        placeholder="Buscar alumno..."
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map(a => (
              <tr key={a.id}>
                <td>{a.dni}</td>
                <td>{a.nombres} {a.apellidos}</td>
                <td>{a.grado || "-"}</td>
                <td>{a.telefono || "-"}</td>
                <td>
                  <button onClick={() => setEditId(a.id)}>✏️</button>
                  <button onClick={() => deleteAlumno(a.id).then(cargar)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS MOBILE */}
      <div className="cards">
        {alumnos.map(a => (
          <div className="card" key={a.id}>
            <strong>{a.nombres} {a.apellidos}</strong>
            <span>DNI: {a.dni}</span>
            <span>Grado: {a.grado || "-"}</span>
            <span>📞 {a.telefono || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alumnos;
