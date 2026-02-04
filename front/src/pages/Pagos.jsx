import { useEffect, useState } from "react";
import "./Pagos.css";
import {
  getPagos,
  createPago,
} from "../services/pagos.service";
import { getMensualidadesPendientes } from "../services/mensualidades.service";

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [mensualidades, setMensualidades] = useState([]);
  const [mensualidadSel, setMensualidadSel] = useState(null);

  const [form, setForm] = useState({
    mensualidad_id: "",
    monto: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    fecha_limite_saldo: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const [resPagos, resMens] = await Promise.all([
        getPagos(),
        getMensualidadesPendientes(),
      ]);

      setPagos(resPagos.data);
      setMensualidades(resMens.data);
      
      // Filtrar pagos pendientes (aquellos que tienen fecha_limite_saldo)
      const pendientes = resPagos.data.filter(p => p.fecha_limite_saldo);
      setPagosPendientes(pendientes);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "mensualidad_id") {
      const m = mensualidades.find(
        (x) => x.id === Number(value)
      );
      setMensualidadSel(m || null);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.mensualidad_id || !form.monto) {
      setMensaje("⚠️ Complete los campos obligatorios");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    try {
      const saldoRestante =
        Number(mensualidadSel.saldo) - Number(form.monto);

      if (saldoRestante > 0 && !form.fecha_limite_saldo) {
        setMensaje("⚠️ Debe ingresar fecha límite del saldo");
        setTimeout(() => setMensaje(""), 3000);
        return;
      }

      await createPago(form);

      if (saldoRestante > 0) {
        setMensaje(`⚠️ Aún debe S/ ${saldoRestante.toFixed(2)}`);
      } else {
        setMensaje("✅ Pago registrado correctamente");
      }

      resetForm();
      cargar();
      setTimeout(() => setMensaje(""), 5000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar pago");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      mensualidad_id: "",
      monto: "",
      fecha_pago: new Date().toISOString().split("T")[0],
      fecha_limite_saldo: "",
    });
    setMensualidadSel(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className="pagos-page">
      <header className="pagos-header">
        <h1>💰 Gestión de Pagos</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "➕ Nuevo Pago"}
        </button>
      </header>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {showForm && (
        <div className="form-card">
          <h3>Registrar Nuevo Pago</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label>Seleccione mensualidad *</label>
              <select
                name="mensualidad_id"
                value={form.mensualidad_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccionar mensualidad --</option>
                {mensualidades.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres} {m.apellidos} — {m.curso} ({m.periodo})
                  </option>
                ))}
              </select>
            </div>

            {mensualidadSel && (
              <div className="info-mensualidad">
                <p><strong>Periodo:</strong> {mensualidadSel.periodo}</p>
                <p><strong>Vence:</strong> {mensualidadSel.fecha_vencimiento}</p>
                <p className="saldo-disponible">
                  Saldo disponible: S/ {Number(mensualidadSel.saldo).toFixed(2)}
                </p>
              </div>
            )}

            <div className="form-group">
              <label>Monto a pagar (S/) *</label>
              <input
                type="number"
                name="monto"
                placeholder="Ej: 150.00"
                value={form.monto}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha del pago *</label>
              <input
                type="date"
                name="fecha_pago"
                value={form.fecha_pago}
                onChange={handleChange}
                required
              />
            </div>

            {mensualidadSel &&
              Number(form.monto) > 0 &&
              Number(form.monto) < Number(mensualidadSel.saldo) && (
                <div className="form-group">
                  <label>Fecha límite para el saldo restante *</label>
                  <input
                    type="date"
                    name="fecha_limite_saldo"
                    value={form.fecha_limite_saldo}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

            <button type="submit" className="btn-guardar">
              💾 Guardar pago
            </button>
          </form>
        </div>
      )}

      {pagosPendientes.length > 0 && (
        <div className="pagos-pendientes-box">
          <h3>⚠️ Pagos Pendientes - Fechas límite próximas</h3>
          
          {/* Tabla Desktop */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Periodo</th>
                  <th>Monto Pagado</th>
                  <th>Fecha Pago</th>
                  <th>Fecha Límite Saldo</th>
                </tr>
              </thead>
              <tbody>
                {pagosPendientes.map((p) => (
                  <tr key={p.id} className="pago-pendiente-row">
                    <td>{p.nombres} {p.apellidos}</td>
                    <td>{p.curso}</td>
                    <td>{p.periodo}</td>
                    <td>S/ {Number(p.monto).toFixed(2)}</td>
                    <td>{p.fecha_pago}</td>
                    <td className="fecha-limite-destacada">{p.fecha_limite_saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="cards">
            {pagosPendientes.map((p) => (
              <div className="card pago-pendiente-card" key={p.id}>
                <div className="card-header">
                  <strong>{p.nombres} {p.apellidos}</strong>
                  <span className="badge-pendiente">Pendiente</span>
                </div>
                <div className="card-body">
                  <span><strong>Curso:</strong> {p.curso}</span>
                  <span><strong>Periodo:</strong> {p.periodo}</span>
                  <span><strong>Monto Pagado:</strong> S/ {Number(p.monto).toFixed(2)}</span>
                  <span><strong>Fecha Pago:</strong> {p.fecha_pago}</span>
                  <span className="fecha-limite-destacada">
                    <strong>⏰ Límite Saldo:</strong> {p.fecha_limite_saldo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="historial-titulo">📋 Historial de Pagos Registrados</h2>

      {/* Tabla Desktop */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Curso</th>
              <th>Periodo</th>
              <th>Monto Pagado</th>
              <th>Fecha Pago</th>
              <th>Fecha Límite Saldo</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No hay pagos registrados
                </td>
              </tr>
            ) : (
              pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombres} {p.apellidos}</td>
                  <td>{p.curso}</td>
                  <td>{p.periodo}</td>
                  <td>S/ {Number(p.monto).toFixed(2)}</td>
                  <td>{p.fecha_pago}</td>
                  <td>{p.fecha_limite_saldo || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="cards">
        {pagos.length === 0 ? (
          <div className="no-data-mobile">No hay pagos registrados</div>
        ) : (
          pagos.map((p) => (
            <div className="card" key={p.id}>
              <div className="card-header">
                <strong>{p.nombres} {p.apellidos}</strong>
              </div>
              <div className="card-body">
                <span><strong>Curso:</strong> {p.curso}</span>
                <span><strong>Periodo:</strong> {p.periodo}</span>
                <span><strong>Monto:</strong> S/ {Number(p.monto).toFixed(2)}</span>
                <span><strong>Fecha Pago:</strong> {p.fecha_pago}</span>
                <span><strong>Límite Saldo:</strong> {p.fecha_limite_saldo || "-"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Pagos;
