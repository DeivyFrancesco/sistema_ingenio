import { useEffect, useState } from "react";
import "./Matriculas.css";
import {
  getMatriculas,
  createMatricula,
  updateMatricula,
  deleteMatricula,
} from "../services/matriculas.service";
import { getAlumnos } from "../services/alumnos.service";
import { getCursos } from "../services/cursos.service";

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState({
    alumno_id: "",
    curso_id: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    anio: new Date().getFullYear(),
    monto: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 FORMATEAR FECHA ISO → DD/MM/YYYY
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const params = {};
      if (searchTerm) params.buscar = searchTerm;
      if (estadoFiltro) params.estado = estadoFiltro;

      const [resMatriculas, resAlumnos, resCursos] = await Promise.all([
        getMatriculas(params),
        getAlumnos(),
        getCursos(),
      ]);

      setMatriculas(resMatriculas.data.matriculas || resMatriculas.data);
      setAlumnos(resAlumnos.data.alumnos || resAlumnos.data);
      setCursos(resCursos.data.cursos || resCursos.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [searchTerm, estadoFiltro]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.alumno_id || !form.curso_id || !form.anio || !form.fecha_inicio) {
      setMensaje("❌ Complete todos los campos obligatorios");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      await createMatricula(form);
      setMensaje("✅ Matrícula registrada correctamente");
      resetForm();
      setSearchTerm("");
      setEstadoFiltro("");
      setTimeout(() => setMensaje(""), 5000);
      cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al registrar matrícula");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

    try {
      await updateMatricula(id, { estado: nuevoEstado });
      setMensaje(`✅ Estado actualizado a ${nuevoEstado}`);
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al actualizar estado");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta matrícula?")) return;

    try {
      await deleteMatricula(id);
      setMensaje("🗑️ Matrícula eliminada");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al eliminar matrícula");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      alumno_id: "",
      curso_id: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      anio: new Date().getFullYear(),
      monto: "",
    });
    setShowForm(false);
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Cargando matrículas...</p>;
  }

  return (
    <div className="matriculas-container">
      <h1>📝 Gestión de Matrículas</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancelar" : "Nueva Matrícula"}
      </button>

      {showForm && (
        <form onSubmit={guardar} className="form">
          <select name="alumno_id" value={form.alumno_id} onChange={handleChange} required>
            <option value="">Seleccione alumno</option>
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombres} {a.apellidos} - DNI {a.dni}
              </option>
            ))}
          </select>

          <select name="curso_id" value={form.curso_id} onChange={handleChange} required>
            <option value="">Seleccione curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.nivel}) - S/ {c.precio_base}/mes
              </option>
            ))}
          </select>

          <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
          <input type="number" name="anio" value={form.anio} onChange={handleChange} min="2020" max="2030" required />
          <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="Monto (opcional)" step="0.01" min="0" />

          <button type="submit">Guardar</button>
        </form>
      )}

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "15px" }}>
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Curso</th>
            <th>Año</th>
            <th>Fecha Inicio</th>
            <th>Monto</th>
            <th>Pagado</th>
            <th>Saldo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matriculas.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                No hay matrículas registradas
              </td>
            </tr>
          ) : (
            matriculas.map((m) => (
              <tr key={m.id}>
                <td>{m.nombres} {m.apellidos}</td>
                <td>{m.curso}</td>
                <td>{m.anio}</td>
                <td>{formatearFecha(m.fecha_inicio)}</td>
                <td>S/ {Number(m.monto || 0).toFixed(2)}</td>
                <td>S/ {Number(m.total_pagado || 0).toFixed(2)}</td>
                <td>S/ {Number(m.saldo || 0).toFixed(2)}</td>
                <td>{m.estado || 'ACTIVO'}</td>
                <td>
                  <button onClick={() => eliminar(m.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}