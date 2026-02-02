import { useEffect, useState } from "react";
import "./Pagos.css";
import {
  getPagos,
  createPago,
} from "../services/pagos.service";
import { getMensualidadesPendientes } from "../services/mensualidades.service";

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
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

  const cargar = async () => {
    const [resPagos, resMens] = await Promise.all([
      getPagos(),
      getMensualidadesPendientes(),
    ]);

    setPagos(resPagos.data);
    setMensualidades(resMens.data);
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
      setMensaje("⚠ Complete los campos obligatorios");
      return;
    }

    try {
      const saldoRestante =
        Number(mensualidadSel.saldo) - Number(form.monto);

      if (saldoRestante > 0 && !form.fecha_limite_saldo) {
        setMensaje("⚠️ Debe ingresar fecha límite del saldo");
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
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar pago");
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

  return (
    <div className="pagos-container">
      <h1>💰 Gestión de Pagos</h1>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      <button
        className="btn-cancelar"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancelar" : "Nuevo Pago"}
      </button>

      {showForm && (
        <div className="form-card">
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

          {mensualidadSel && (
            <div className="info-mensualidad">
              <p><strong>Periodo:</strong> {mensualidadSel.periodo}</p>
              <p><strong>Vence:</strong> {mensualidadSel.fecha_vencimiento}</p>
              <p className="saldo-disponible">
                Saldo disponible: S/ {Number(mensualidadSel.saldo).toFixed(2)}
              </p>
            </div>
          )}

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

          <label>Fecha del pago *</label>
          <input
            type="date"
            name="fecha_pago"
            value={form.fecha_pago}
            onChange={handleChange}
            required
          />

          {mensualidadSel &&
            Number(form.monto) > 0 &&
            Number(form.monto) < Number(mensualidadSel.saldo) && (
              <>
                <label>Fecha límite para el saldo restante *</label>
                <input
                  type="date"
                  name="fecha_limite_saldo"
                  value={form.fecha_limite_saldo}
                  onChange={handleChange}
                  required
                />
              </>
            )}

          <button onClick={guardar} className="btn-guardar">
            💾 Guardar pago
          </button>
        </div>
      )}

      <h2 className="historial-titulo">📋 Historial de Pagos Registrados</h2>

      <table>
        <thead>
          <tr>
            <th>ALUMNO</th>
            <th>CURSO</th>
            <th>PERIODO</th>
            <th>MONTO PAGADO</th>
            <th>FECHA PAGO</th>
            <th>FECHA LÍMITE SALDO</th>
          </tr>
        </thead>
        <tbody>
          {pagos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
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
  );
};

export default Pagos;