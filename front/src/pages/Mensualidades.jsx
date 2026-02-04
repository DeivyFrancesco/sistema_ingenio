import { useEffect, useState } from "react";
import "./Mensualidades.css";
import {
  getMensualidades,
  getMensualidadesPendientes,
  createMensualidad,
  deleteMensualidad,
  updateMensualidad,
} from "../services/mensualidades.service";
import { getMatriculas } from "../services/matriculas.service";

export default function Mensualidades() {
  const [mensualidades, setMensualidades] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [vista, setVista] = useState("todas");
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    matricula_id: "",
    periodo: "",
    monto: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resMens =
        vista === "pendientes"
          ? await getMensualidadesPendientes()
          : await getMensualidades();

      setMensualidades(resMens.data);

      const resMat = await getMatriculas();
      setMatriculas(resMat.data.matriculas || resMat.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "fecha_inicio" && value) {
      const f = new Date(value);
      const sugerido = `${f.getFullYear()}-${String(
        f.getMonth() + 1
      ).padStart(2, "0")}`;

      setForm((prev) => ({
        ...prev,
        periodo: prev.periodo || sugerido,
      }));
    }
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (
      !form.matricula_id ||
      !form.periodo ||
      !form.monto ||
      !form.fecha_vencimiento
    ) {
      setMensaje("⚠️ Complete todos los campos");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      await createMensualidad(form);
      setMensaje("✅ Mensualidad creada correctamente");
      setShowForm(false);
      resetForm();
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al crear mensualidad");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      matricula_id: "",
      periodo: "",
      monto: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_vencimiento: "",
    });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar mensualidad?")) return;
    
    try {
      await deleteMensualidad(id);
      setMensaje("🗑️ Mensualidad eliminada");
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al eliminar");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const getEstado = (m) => {
    if (Number(m.saldo) <= 0) return "PAGADO";
    if (Number(m.pagado) > 0) return "PAGO PARCIAL";
    return "PENDIENTE";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return "-";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleEditar = (m) => {
    setEditingId(m.id);
  };

  const handleGuardarEdicion = async (id, nuevaFecha) => {
    try {
      await updateMensualidad(id, { fecha_vencimiento: nuevaFecha });
      setMensaje("✅ Fecha actualizada correctamente");
      setEditingId(null);
      cargarDatos();
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al actualizar fecha");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleCancelarEdicion = () => {
    setEditingId(null);
  };

  const mensualidadesFiltradas = mensualidades.filter((m) => {
    const nombreCompleto = `${m.nombres} ${m.apellidos}`.toLowerCase();
    return nombreCompleto.includes(filtroAlumno.toLowerCase());
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando mensualidades...</p>
      </div>
    );
  }

  return (
    <div className="mensualidades-page">
      <header className="mensualidades-header">
        <h1>📅 Gestión de Mensualidades</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nueva Mensualidad"}
        </button>
      </header>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <div className="form-card">
          <h3>Nueva Mensualidad</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Seleccione alumno / curso *</label>
              <select
                name="matricula_id"
                value={form.matricula_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccione alumno / curso --</option>
                {matriculas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres} {m.apellidos} — {m.curso}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Fecha de inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Periodo (ej: 2026-01) *</label>
                <input
                  type="text"
                  name="periodo"
                  placeholder="2026-01"
                  value={form.periodo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Monto mensual (S/) *</label>
                <input
                  type="number"
                  name="monto"
                  placeholder="150.00"
                  value={form.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de vencimiento *</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={form.fecha_vencimiento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">Guardar Mensualidad</button>
              <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filtros-container">
        <input
          type="text"
          className="search"
          placeholder="🔍 Filtrar por alumno..."
          value={filtroAlumno}
          onChange={(e) => setFiltroAlumno(e.target.value)}
        />

        <div className="vista-botones">
          <button
            className={`vista-btn ${vista === "todas" ? "activo" : ""}`}
            onClick={() => setVista("todas")}
          >
            Todas
          </button>
          <button
            className={`vista-btn ${vista === "pendientes" ? "activo" : ""}`}
            onClick={() => setVista("pendientes")}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Curso</th>
              <th>Periodo</th>
              <th>Monto</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Vence</th>
              <th>Vence Saldo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensualidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  No hay mensualidades
                </td>
              </tr>
            ) : (
              mensualidadesFiltradas.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.nombres} {m.apellidos}</strong></td>
                  <td>{m.curso}</td>
                  <td>{m.periodo}</td>
                  <td>S/ {Number(m.monto).toFixed(2)}</td>
                  <td className="texto-verde">S/ {Number(m.pagado).toFixed(2)}</td>
                  <td className={m.saldo > 0 ? "texto-rojo" : ""}>
                    S/ {Number(m.saldo).toFixed(2)}
                  </td>
                  <td>
                    {editingId === m.id ? (
                      <div className="edicion-fecha">
                        <input
                          type="date"
                          defaultValue={m.fecha_vencimiento}
                          onBlur={(e) => handleGuardarEdicion(m.id, e.target.value)}
                          autoFocus
                        />
                        <button 
                          className="btn-cancelar-edicion"
                          onClick={handleCancelarEdicion}
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <span className="fecha-display">
                        {formatearFecha(m.fecha_vencimiento)}
                      </span>
                    )}
                  </td>
                  <td className="fecha-limite">
                    {formatearFechaCompleta(m.fecha_limite_saldo)}
                  </td>
                  <td>
                    <span className={`badge-estado badge-${getEstado(m).toLowerCase().replace(" ", "-")}`}>
                      {getEstado(m)}
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
        {mensualidadesFiltradas.length === 0 ? (
          <div className="no-data-mobile">No hay mensualidades</div>
        ) : (
          mensualidadesFiltradas.map((m) => (
            <div className="card" key={m.id}>
              <div className="card-header">
                <div>
                  <strong>{m.nombres} {m.apellidos}</strong>
                  <div className="curso-mobile">{m.curso} - {m.periodo}</div>
                </div>
                <button className="btn-delete-small" onClick={() => eliminar(m.id)}>
                  🗑️
                </button>
              </div>
              <div className="card-body">
                <span><strong>Monto:</strong> S/ {Number(m.monto).toFixed(2)}</span>
                <span className="texto-verde"><strong>Pagado:</strong> S/ {Number(m.pagado).toFixed(2)}</span>
                <span className={m.saldo > 0 ? "texto-rojo" : ""}>
                  <strong>Saldo:</strong> S/ {Number(m.saldo).toFixed(2)}
                </span>
                <span><strong>Vence:</strong> {formatearFecha(m.fecha_vencimiento)}</span>
                <span className="fecha-limite">
                  <strong>Vence Saldo:</strong> {formatearFechaCompleta(m.fecha_limite_saldo)}
                </span>
                <span>
                  <strong>Estado:</strong>
                  <span className={`badge-estado badge-${getEstado(m).toLowerCase().replace(" ", "-")}`}>
                    {getEstado(m)}
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
