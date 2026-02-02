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

  const [form, setForm] = useState({
    matricula_id: "",
    periodo: "",
    monto: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
  });

  const cargarDatos = async () => {
    try {
      const resMens =
        vista === "pendientes"
          ? await getMensualidadesPendientes()
          : await getMensualidades();

      setMensualidades(resMens.data);

      const resMat = await getMatriculas();
      setMatriculas(resMat.data.matriculas || resMat.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
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
      setMensaje("⚠ Complete todos los campos");
      return;
    }

    try {
      await createMensualidad(form);
      setMensaje("✅ Mensualidad creada correctamente");
      setShowForm(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al crear mensualidad");
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
    await deleteMensualidad(id);
    cargarDatos();
  };

  const getEstado = (m) => {
    if (Number(m.saldo) <= 0) return "PAGADO";
    if (Number(m.pagado) > 0) return "PAGO PARCIAL";
    return "PENDIENTE";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const [year, month, day] = fecha.split("-");
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return `${day} ${meses[parseInt(month) - 1]} ${year}`;
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
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al actualizar fecha");
    }
  };

  const handleCancelarEdicion = () => {
    setEditingId(null);
  };

  const mensualidadesFiltradas = mensualidades.filter((m) => {
    const nombreCompleto = `${m.nombres} ${m.apellidos}`.toLowerCase();
    return nombreCompleto.includes(filtroAlumno.toLowerCase());
  });

  return (
    <div className="mensualidades-container">
      <h1>📅 Gestión de Mensualidades</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <div className="barra-superior">
        <button
          className="btn-cancelar"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nueva mensualidad"}
        </button>

        <input
          type="text"
          className="filtro-alumno"
          placeholder="FILTRAR POR ALUMNO"
          value={filtroAlumno}
          onChange={(e) => setFiltroAlumno(e.target.value)}
        />

        <div className="filtros">
          <button
            className={vista === "todas" ? "activo" : ""}
            onClick={() => setVista("todas")}
          >
            Todas
          </button>
          <button
            className={vista === "pendientes" ? "activo" : ""}
            onClick={() => setVista("pendientes")}
          >
            Pendientes
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <label>Seleccione alumno / curso</label>
          <select
            name="matricula_id"
            value={form.matricula_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione alumno / curso</option>
            {matriculas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos} – {m.curso}
              </option>
            ))}
          </select>

          <label>Fecha de inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
          />

          <label>Periodo (ej: 2026-01)</label>
          <input
            type="text"
            name="periodo"
            placeholder="Periodo (ej: 2026-01)"
            value={form.periodo}
            onChange={handleChange}
            required
          />

          <label>Monto mensual</label>
          <input
            type="number"
            name="monto"
            placeholder="Monto mensual"
            value={form.monto}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />

          <label>Fecha de vencimiento (dd/mm/aaaa)</label>
          <input
            type="date"
            name="fecha_vencimiento"
            value={form.fecha_vencimiento}
            onChange={handleChange}
            required
          />
          <small className="fecha-nota">CAMBIALE A FORMATO DIA/HORA FECHA</small>

          <button onClick={guardar} className="btn-guardar">
            Guardar Mensualidad
          </button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ALUMNO</th>
            <th>CURSO</th>
            <th>PERIODO</th>
            <th>MONTO</th>
            <th>PAGADO</th>
            <th>SALDO</th>
            <th>VENCE</th>
            <th>VENCE SALDO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {mensualidadesFiltradas.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No hay mensualidades
              </td>
            </tr>
          ) : (
            mensualidadesFiltradas.map((m) => (
              <tr key={m.id}>
                <td>{m.nombres} {m.apellidos}</td>
                <td>{m.curso}</td>
                <td>{m.periodo}</td>
                <td>S/ {Number(m.monto).toFixed(2)}</td>
                <td>S/ {Number(m.pagado).toFixed(2)}</td>
                <td className={m.saldo > 0 ? "saldo" : ""}>
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
                <td>
                  {formatearFechaCompleta(m.fecha_limite_saldo)}
                </td>
                <td>
                  <span className={`estado ${getEstado(m).toLowerCase().replace(" ", "-")}`}>
                    {getEstado(m)}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminar(m.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}