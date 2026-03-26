import { useEffect, useState } from "react";
import "./Mensualidades.css";
import {
  getMensualidades,
  createMensualidad,
} from "../services/mensualidades.service";
import { createPago } from "../services/pagos.service";
import { getMatriculas } from "../services/matriculas.service";

/* HELPERS */
const hoy = () => new Date().toISOString().slice(0, 10);

const formatFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const formatMonto = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;
const yaVencio = (f) => !!f && f.slice(0, 10) < hoy();

/* Días hasta una fecha (negativo = ya pasó) */
const diasHasta = (f) => {
  if (!f) return null;
  const hoyDate = new Date(hoy());
  const fecha = new Date(f.slice(0, 10));
  return Math.round((fecha - hoyDate) / (1000 * 60 * 60 * 24));
};

/* Pagos son ADELANTADOS: alertamos según fecha_inicio */
const UMBRAL_AVISO = 15; // días antes de la fecha de inicio para avisar

const calcEstado = (m) => {
  const saldo = parseFloat(m.saldo);
  const pagado = parseFloat(m.pagado || 0);
  if (saldo <= 0) return "PAGADO";
  if (yaVencio(m.fecha_vencimiento)) return "VENCIDO";
  if (pagado > 0 && saldo > 0) return "PARCIAL";
  const dias = diasHasta(m.fecha_inicio);
  if (dias !== null && dias <= UMBRAL_AVISO) return "POR_VENCER";
  return "PENDIENTE";
};

const BADGE_MAP = {
  PAGADO:    ["badge-pagado",    "✓ Pagado"],
  VENCIDO:   ["badge-vencido",   "✗ Vencido"],
  PARCIAL:   ["badge-parcial",   "◑ Parcial"],
  POR_VENCER:["badge-por-vencer","⚠ Por vencer"],
  PENDIENTE: ["badge-pendiente", "● Pendiente"],
};

const BadgeEstado = ({ estado }) => {
  const [cls, label] = BADGE_MAP[estado] || BADGE_MAP.PENDIENTE;
  return <span className={`badge-estado ${cls}`}>{label}</span>;
};

/* ALERTA DE COBROS PRÓXIMOS (basada en fecha_inicio — pagos adelantados) */
const AlertaVencimientos = ({ mensualidades }) => {
  const porCobrar = mensualidades
    .filter((m) => {
      const saldo = parseFloat(m.saldo);
      if (saldo <= 0) return false;
      const dias = diasHasta(m.fecha_inicio);
      return dias !== null && dias >= 0 && dias <= UMBRAL_AVISO;
    })
    .sort((a, b) => diasHasta(a.fecha_inicio) - diasHasta(b.fecha_inicio));

  const vencidas = mensualidades.filter((m) => {
    const saldo = parseFloat(m.saldo);
    return saldo > 0 && yaVencio(m.fecha_vencimiento);
  });

  if (porCobrar.length === 0 && vencidas.length === 0) return null;

  return (
    <div className="alerta-panel">
      {vencidas.length > 0 && (
        <div className="alerta-seccion alerta-vencidas">
          <div className="alerta-titulo">
            <span className="alerta-icon">🚨</span>
            <strong>{vencidas.length} mensualidad{vencidas.length > 1 ? "es" : ""} vencida{vencidas.length > 1 ? "s" : ""} sin pagar</strong>
          </div>
          <div className="alerta-lista">
            {vencidas.map((m) => (
              <div key={m.id} className="alerta-item alerta-item-vencida">
                <span className="alerta-alumno">👤 {m.nombres} {m.apellidos}</span>
                <span className="alerta-curso">{m.curso}</span>
                <span className="alerta-fecha">Venció: {formatFecha(m.fecha_vencimiento)}</span>
                <span className="alerta-monto">{formatMonto(m.saldo)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {porCobrar.length > 0 && (
        <div className="alerta-seccion alerta-proximas">
          <div className="alerta-titulo">
            <span className="alerta-icon">⏰</span>
            <strong>{porCobrar.length} cobro{porCobrar.length > 1 ? "s" : ""} por realizar — periodo inicia en menos de {UMBRAL_AVISO} días</strong>
          </div>
          <div className="alerta-lista">
            {porCobrar.map((m) => {
              const dias = diasHasta(m.fecha_inicio);
              return (
                <div key={m.id} className={`alerta-item ${dias <= 3 ? "alerta-item-urgente" : "alerta-item-pronto"}`}>
                  <span className="alerta-alumno">👤 {m.nombres} {m.apellidos}</span>
                  <span className="alerta-curso">{m.curso}</span>
                  <span className="alerta-fecha">Inicia: {formatFecha(m.fecha_inicio)}</span>
                  <span className="alerta-dias">
                    {dias === 0 ? "¡Hoy!" : dias === 1 ? "Mañana" : `En ${dias} días`}
                  </span>
                  <span className="alerta-monto">{formatMonto(m.saldo)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* CONTADOR ESTADOS */
const contarEstados = (data) => {
  const counts = { TODAS: data.length, PAGADO: 0, VENCIDO: 0, PARCIAL: 0, POR_VENCER: 0, PENDIENTE: 0 };
  data.forEach((m) => { const e = calcEstado(m); counts[e]++; });
  return counts;
};

/* FORM PAGO INLINE */
const FormPagoInline = ({ mensualidad, onClose, onSuccess }) => {
  const saldo = parseFloat(mensualidad.saldo);
  const [monto, setMonto] = useState(saldo);
  const [fecha, setFecha] = useState(hoy());

  const guardar = async (e) => {
    e.preventDefault();
    await createPago({ mensualidad_id: mensualidad.id, monto, fecha_pago: fecha });
    onSuccess();
  };

  return (
    <tr className="fila-form-pago">
      <td colSpan="9">
        <form className="form-pago-inline" onSubmit={guardar}>
          <div className="fpi-titulo">
            <span>Registrar pago —</span>
            <span className="fpi-alumno">{mensualidad.nombres} {mensualidad.apellidos}</span>
            <span className="fpi-periodo">{mensualidad.periodo}</span>
            <span className="fpi-saldo">Saldo: {formatMonto(saldo)}</span>
          </div>
          <div className="fpi-grid">
            <div className="fpi-group">
              <label>Monto a pagar (S/)</label>
              <input
                type="number"
                value={monto}
                min="0.01"
                step="0.01"
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
            <div className="fpi-group">
              <label>Fecha de pago</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="fpi-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button className="btn-guardar">Guardar pago</button>
          </div>
        </form>
      </td>
    </tr>
  );
};

/* COMPONENTE PRINCIPAL */
export default function Mensualidades() {
  const [mensualidades, setMensualidades] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [pagoActivo, setPagoActivo] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroMes, setFiltroMes] = useState("");

  const [form, setForm] = useState({
    matricula_id: "",
    periodo: "",
    monto: "",
    fecha_inicio: hoy(),
    fecha_vencimiento: "",
  });

  const cargar = async () => {
    const [resMens, resMat] = await Promise.all([getMensualidades(), getMatriculas()]);
    setMensualidades(resMens.data || []);
    setMatriculas(resMat.data || []);
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "fecha_inicio") {
      const d = new Date(value);
      const periodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      setForm((p) => ({ ...p, [name]: value, periodo }));
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    await createMensualidad(form);
    setShowForm(false);
    setForm({ matricula_id: "", periodo: "", monto: "", fecha_inicio: hoy(), fecha_vencimiento: "" });
    cargar();
  };

  const counts = contarEstados(mensualidades);

  const mensualidadesFiltradas = mensualidades.filter((m) => {
    const estado = calcEstado(m);
    if (filtroEstado !== "TODAS" && estado !== filtroEstado) return false;
    if (filtroMes) {
      const mes = new Date(m.fecha_inicio).getMonth() + 1;
      if (mes !== parseInt(filtroMes)) return false;
    }
    return true;
  });

  return (
    <div className="mens-page">
      {/* HEADER */}
      <div className="mens-header">
        <h1>Mensualidades</h1>
        <button className="btn-nuevo" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cerrar" : "+ Nueva Mensualidad"}
        </button>
      </div>

      {/* ALERTAS */}
      <AlertaVencimientos mensualidades={mensualidades} />

      {/* FORM NUEVA MENSUALIDAD */}
      {showForm && (
        <div className="form-card">
          <h2 className="form-titulo">Nueva Mensualidad</h2>
          <form onSubmit={guardar}>
            <div className="form-grid">

              {/* Alumno — ocupa todo el ancho */}
              <div className="form-group full-width">
                <label>Alumno</label>
                <select name="matricula_id" value={form.matricula_id} onChange={handleChange} required>
                  <option value="">Seleccione alumno…</option>
                  {matriculas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos} — {m.curso}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de inicio */}
              <div className="form-group">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fecha de vencimiento */}
              <div className="form-group">
                <label>Fecha de vencimiento</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={form.fecha_vencimiento}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Periodo (se autocompleta con fecha inicio) */}
              <div className="form-group">
                <label>Periodo</label>
                <input
                  type="text"
                  name="periodo"
                  value={form.periodo}
                  onChange={handleChange}
                  placeholder="Ej: 2026-03"
                  required
                />
              </div>

              {/* Monto */}
              <div className="form-group">
                <label>Monto (S/)</label>
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button className="btn-guardar">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS */}
      <div className="filtro-bar">
        <div className="filtro-tabs">
          {["TODAS","PAGADO","VENCIDO","PARCIAL","POR_VENCER","PENDIENTE"].map((f) => (
            <button
              key={f}
              className={`filtro-tab filtro-tab-${f.toLowerCase().replace("_","-")} ${filtroEstado === f ? "activo" : ""}`}
              onClick={() => setFiltroEstado(f)}
            >
              {f === "TODAS" ? "Todas" : f.replace("_"," ")}
              <span className="tab-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        <select
          className="filtro-input"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
        >
          <option value="">Todos los meses</option>
          {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((mes, i) => (
            <option key={i+1} value={i+1}>{mes}</option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Curso</th>
              <th>Fecha inicio</th>
              <th>Fecha vencimiento</th>
              <th>Monto</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensualidadesFiltradas.map((m) => {
              const estado = calcEstado(m);
              return (
                <>
                  <tr key={m.id}>
                    <td>{m.nombres} {m.apellidos}</td>
                    <td>{m.curso}</td>
                    <td>
                      <div className="fecha-cell">
                        <span>{formatFecha(m.fecha_inicio)}</span>
                        {estado !== "PAGADO" && (() => {
                          const dias = diasHasta(m.fecha_inicio);
                          if (dias === null) return null;
                          if (dias < 0)  return <span className="dias-badge dias-vencido">Pasó hace {Math.abs(dias)}d</span>;
                          if (dias === 0) return <span className="dias-badge dias-hoy">¡Hoy!</span>;
                          if (dias <= 3)  return <span className="dias-badge dias-urgente">⚠ {dias}d</span>;
                          if (dias <= UMBRAL_AVISO) return <span className="dias-badge dias-pronto">⏰ {dias}d</span>;
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="td-fecha">{formatFecha(m.fecha_vencimiento)}</td>
                    <td>{formatMonto(m.monto)}</td>
                    <td>{formatMonto(m.pagado)}</td>
                    <td>{formatMonto(m.saldo)}</td>
                    <td><BadgeEstado estado={estado} /></td>
                    <td>
                      {estado !== "PAGADO" && (
                        <button className="btn-pagar" onClick={() => setPagoActivo(m.id)}>
                          💵 Pagar
                        </button>
                      )}
                    </td>
                  </tr>

                  {pagoActivo === m.id && (
                    <FormPagoInline
                      mensualidad={m}
                      onClose={() => setPagoActivo(null)}
                      onSuccess={() => { setPagoActivo(null); cargar(); }}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
