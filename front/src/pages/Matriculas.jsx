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

  // Formatear fecha ISO → DD/MM/YYYY
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando matrículas...</p>
      </div>
    );
  }

  return (
    <div className="matriculas-page">
      <header className="matriculas-header">
        <h1>📝 Gestión de Matrículas</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nueva Matrícula"}
        </button>
      </header>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <div className="form-card">
          <h3>Nueva Matrícula</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Seleccione alumno *</label>
              <select name="alumno_id" value={form.alumno_id} onChange={handleChange} required>
                <option value="">-- Seleccionar alumno --</option>
                {alumnos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombres} {a.apellidos} - DNI {a.dni}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Seleccione curso *</label>
              <select name="curso_id" value={form.curso_id} onChange={handleChange} required>
                <option value="">-- Seleccionar curso --</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.nivel}) - S/ {c.precio_base}/mes
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Fecha de inicio *</label>
                <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
              </div>
              
              <div className="form-group">
                <label>Año *</label>
                <input type="number" name="anio" value={form.anio} onChange={handleChange} min="2020" max="2030" required />
              </div>
            </div>

            <div className="form-group">
              <label>Monto (opcional)</label>
              <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="Dejar vacío para usar precio del curso" step="0.01" min="0" />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">Guardar</button>
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="filtros-container">
        <input
          className="search"
          placeholder="🔍 Buscar por alumno o curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="filtro-estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="COMPLETADO">Completado</option>
        </select>
      </div>

      {/* Tabla Desktop */}
      <div className="table-wrapper">
        <table>
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
                <td colSpan="9" className="no-data">
                  No hay matrículas registradas
                </td>
              </tr>
            ) : (
              matriculas.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.nombres} {m.apellidos}</strong></td>
                  <td>{m.curso}</td>
                  <td>{m.anio}</td>
                  <td>{formatearFecha(m.fecha_inicio)}</td>
                  <td>S/ {Number(m.monto || 0).toFixed(2)}</td>
                  <td className="texto-verde">S/ {Number(m.total_pagado || 0).toFixed(2)}</td>
                  <td className={Number(m.saldo || 0) > 0 ? "texto-rojo" : ""}>
                    S/ {Number(m.saldo || 0).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge-estado badge-${(m.estado || 'ACTIVO').toLowerCase()}`}>
                      {m.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => eliminar(m.id)} title="Eliminar">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="cards">
        {matriculas.length === 0 ? (
          <div className="no-data-mobile">No hay matrículas registradas</div>
        ) : (
          matriculas.map((m) => (
            <div className="card" key={m.id}>
              <div className="card-header">
                <div>
                  <strong>{m.nombres} {m.apellidos}</strong>
                  <div className="curso-mobile">{m.curso}</div>
                </div>
                <button className="btn-delete-small" onClick={() => eliminar(m.id)}>
                  🗑️
                </button>
              </div>
              <div className="card-body">
                <span><strong>Año:</strong> {m.anio}</span>
                <span><strong>Inicio:</strong> {formatearFecha(m.fecha_inicio)}</span>
                <span><strong>Monto:</strong> S/ {Number(m.monto || 0).toFixed(2)}</span>
                <span className="texto-verde"><strong>Pagado:</strong> S/ {Number(m.total_pagado || 0).toFixed(2)}</span>
                <span className={Number(m.saldo || 0) > 0 ? "texto-rojo" : ""}>
                  <strong>Saldo:</strong> S/ {Number(m.saldo || 0).toFixed(2)}
                </span>
                <span>
                  <strong>Estado:</strong>
                  <span className={`badge-estado badge-${(m.estado || 'ACTIVO').toLowerCase()}`}>
                    {m.estado || 'ACTIVO'}
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
