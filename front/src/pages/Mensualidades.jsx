import React, { useEffect, useState } from "react";
import "./Mensualidades.css";
import {
  getMensualidades,
  createMensualidad,
  updateMensualidad,
  deleteMensualidad,
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

/* Contador visual de días hasta fecha_inicio */
const ContadorDias = ({ fechaInicio, estado }) => {
  if (estado === "PAGADO") return <span className="contador-pagado">✓</span>;

  const dias = diasHasta(fechaInicio);
  if (dias === null) return <span className="contador-sin">—</span>;

  if (dias < 0) {
    return (
      <div className="contador-wrap contador-wrap-vencido">
        <span className="contador-numero">{Math.abs(dias)}</span>
        <span className="contador-label">días pasados</span>
      </div>
    );
  }
  if (dias === 0) {
    return (
      <div className="contador-wrap contador-wrap-hoy">
        <span className="contador-hoy">¡HOY!</span>
      </div>
    );
  }
  if (dias <= 3) {
    return (
      <div className="contador-wrap contador-wrap-urgente">
        <span className="contador-numero">{dias}</span>
        <span className="contador-label">día{dias > 1 ? "s" : ""}</span>
      </div>
    );
  }
  if (dias <= 15) {
    return (
      <div className="contador-wrap contador-wrap-pronto">
        <span className="contador-numero">{dias}</span>
        <span className="contador-label">días</span>
      </div>
    );
  }
  return (
    <div className="contador-wrap contador-wrap-normal">
      <span className="contador-numero">{dias}</span>
      <span className="contador-label">días</span>
    </div>
  );
};

const calcEstado = (m) => {
  const saldo = parseFloat(m.saldo);
  const pagado = parseFloat(m.pagado || 0);
  if (saldo <= 0) return "PAGADO";
  if (yaVencio(m.fecha_vencimiento)) return "VENCIDO";
  if (pagado > 0 && saldo > 0) return "PARCIAL";
  if (m.por_vencer) return "POR_VENCER";
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

/* CONTADOR ESTADOS */
const contarEstados = (data) => {
  const counts = { TODAS: data.length, PAGADO: 0, VENCIDO: 0, PARCIAL: 0, POR_VENCER: 0, PENDIENTE: 0 };
  data.forEach((m) => { const e = calcEstado(m); counts[e]++; });
  return counts;
};

/* ── IMPRIMIR MENSUALIDAD EN PDF ── */
const imprimirMensualidad = (m, estado) => {
  const estadoLabel = {
    PAGADO:    "✓ Pagado",
    VENCIDO:   "✗ Vencido",
    PARCIAL:   "◑ Pago parcial",
    POR_VENCER:"⚠ Por vencer",
    PENDIENTE: "● Pendiente",
  }[estado] || estado;

  const estadoColor = {
    PAGADO:    "#059669",
    VENCIDO:   "#dc2626",
    PARCIAL:   "#ea580c",
    POR_VENCER:"#ca8a04",
    PENDIENTE: "#d97706",
  }[estado] || "#374151";

  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Mensualidad — ${m.nombres} ${m.apellidos}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: #f3f4f6;
      display: flex; justify-content: center; align-items: flex-start;
      min-height: 100vh; padding: 32px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .voucher {
      background: #fff;
      width: 560px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.12);
      overflow: hidden;
    }

    /* CABECERA */
    .voucher-header {
      background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
      padding: 28px 32px 24px;
      color: #fff;
    }
    .voucher-logo {
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; opacity: .7; margin-bottom: 10px;
    }
    .voucher-titulo {
      font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1;
    }
    .voucher-sub {
      font-size: 13px; opacity: .75; margin-top: 4px;
    }
    .voucher-emisión {
      font-size: 11px; opacity: .6; margin-top: 14px; font-weight: 600;
      letter-spacing: 0.3px;
    }

    /* BADGE ESTADO */
    .badge-wrap { padding: 16px 32px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; border-radius: 99px;
      font-size: 13px; font-weight: 700;
      background: color-mix(in srgb, ${estadoColor} 12%, #fff);
      color: ${estadoColor};
      border: 1.5px solid color-mix(in srgb, ${estadoColor} 35%, #fff);
    }

    /* SECCIONES */
    .seccion { padding: 22px 32px; border-bottom: 1px solid #e5e7eb; }
    .seccion:last-child { border-bottom: none; }
    .seccion-titulo {
      font-size: 10px; font-weight: 800; letter-spacing: 1.2px;
      text-transform: uppercase; color: #9ca3af; margin-bottom: 14px;
    }

    /* GRID DE DATOS */
    .datos-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    .dato { display: flex; flex-direction: column; gap: 3px; }
    .dato.full { grid-column: 1 / -1; }
    .dato-label {
      font-size: 11px; font-weight: 700; color: #9ca3af;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .dato-valor {
      font-size: 15px; font-weight: 600; color: #111827;
    }
    .dato-valor.grande {
      font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px;
    }
    .dato-valor.verde  { color: #059669; }
    .dato-valor.rojo   { color: #dc2626; }
    .dato-valor.gris   { color: #9ca3af; }

    /* MONTOS */
    .montos-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;
      border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;
    }
    .monto-item {
      padding: 14px 16px;
      border-right: 1px solid #e5e7eb;
      display: flex; flex-direction: column; gap: 4px;
    }
    .monto-item:last-child { border-right: none; }
    .monto-label { font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 0.8px; text-transform: uppercase; }
    .monto-valor { font-size: 18px; font-weight: 800; color: #111827; }
    .monto-valor.verde { color: #059669; }
    .monto-valor.rojo  { color: #dc2626; }
    .monto-valor.gris  { color: #9ca3af; }

    /* FOOTER */
    .voucher-footer {
      background: #f9fafb; padding: 16px 32px;
      text-align: center; font-size: 11px; color: #9ca3af; font-weight: 500;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .voucher { box-shadow: none; border-radius: 0; width: 100%; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="voucher">

    <div class="voucher-header">
      <div class="voucher-logo">Comprobante de mensualidad</div>
      <div class="voucher-titulo">${m.nombres} ${m.apellidos}</div>
      <div class="voucher-sub">${m.curso}</div>
      <div class="voucher-emisión">Emitido el ${fechaEmision}</div>
    </div>

    <div class="badge-wrap">
      <span class="badge">${estadoLabel}</span>
    </div>

    <!-- DATOS DEL ALUMNO -->
    <div class="seccion">
      <div class="seccion-titulo">Datos del alumno</div>
      <div class="datos-grid">
        <div class="dato full">
          <span class="dato-label">Alumno</span>
          <span class="dato-valor">${m.nombres} ${m.apellidos}</span>
        </div>
        <div class="dato full">
          <span class="dato-label">Apoderado</span>
          <span class="dato-valor">${m.apoderado || "—"}</span>
        </div>
        <div class="dato full">
          <span class="dato-label">Curso</span>
          <span class="dato-valor">${m.curso}</span>
        </div>
      </div>
    </div>

    <!-- FECHAS -->
    <div class="seccion">
      <div class="seccion-titulo">Período de pago</div>
      <div class="datos-grid">
        <div class="dato">
          <span class="dato-label">Fecha de inicio</span>
          <span class="dato-valor">${formatFecha(m.fecha_inicio)}</span>
        </div>
        <div class="dato">
          <span class="dato-label">Fecha de vencimiento</span>
          <span class="dato-valor">${formatFecha(m.fecha_vencimiento)}</span>
        </div>
        <div class="dato">
          <span class="dato-label">Período</span>
          <span class="dato-valor">${m.periodo || "—"}</span>
        </div>
        ${m.fecha_primer_pago ? `
        <div class="dato">
          <span class="dato-label">Fecha de pago</span>
          <span class="dato-valor">${formatFecha(m.fecha_primer_pago)}</span>
        </div>` : ""}
      </div>
    </div>

    <!-- MONTOS -->
    <div class="seccion">
      <div class="seccion-titulo">Resumen de pagos</div>
      <div class="montos-grid">
        <div class="monto-item">
          <span class="monto-label">Monto total</span>
          <span class="monto-valor">${formatMonto(m.monto)}</span>
        </div>
        <div class="monto-item">
          <span class="monto-label">Pagado</span>
          <span class="monto-valor verde">${formatMonto(m.pagado)}</span>
        </div>
        <div class="monto-item">
          <span class="monto-label">Saldo</span>
          <span class="monto-valor ${parseFloat(m.saldo) <= 0 ? "gris" : "rojo"}">${formatMonto(m.saldo)}</span>
        </div>
      </div>
    </div>

    <div class="voucher-footer">
      Documento generado automáticamente — Solo informativo
    </div>
  </div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=660,height=860");
  ventana.document.write(html);
  ventana.document.close();
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
      <td colSpan="11">
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

/* ── FORM EDITAR INLINE ── */
const FormEditarInline = ({ mensualidad, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    periodo:           mensualidad.periodo || "",
    monto:             mensualidad.monto || "",
    fecha_inicio:      mensualidad.fecha_inicio?.slice(0, 10) || "",
    fecha_vencimiento: mensualidad.fecha_vencimiento?.slice(0, 10) || "",
  });

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
    await updateMensualidad(mensualidad.id, form);
    onSuccess();
  };

  return (
    <tr className="fila-form-pago">
      <td colSpan="11">
        <form className="form-pago-inline" onSubmit={guardar}>
          <div className="fpi-titulo">
            <span>✏️ Editar mensualidad —</span>
            <span className="fpi-alumno">{mensualidad.nombres} {mensualidad.apellidos}</span>
            <span className="fpi-periodo">{mensualidad.curso}</span>
          </div>
          <div className="fpi-grid">
            <div className="fpi-group">
              <label>Fecha de inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="fpi-group">
              <label>Fecha de vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={form.fecha_vencimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="fpi-group">
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
            <div className="fpi-group">
              <label>Monto (S/)</label>
              <input
                type="number"
                name="monto"
                value={form.monto}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="fpi-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button className="btn-guardar">Guardar cambios</button>
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
  const [editActivo, setEditActivo] = useState(null);

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

  const handleEliminar = async (m) => {
    const confirmar = window.confirm(
      `¿Eliminar la mensualidad de ${m.nombres} ${m.apellidos} (${m.periodo})?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;
    await deleteMensualidad(m.id);
    cargar();
  };

  const handleAbrirEditar = (id) => {
    setPagoActivo(null);   // cierra pago si estaba abierto
    setEditActivo((prev) => (prev === id ? null : id));
  };

  const handleAbrirPago = (id) => {
    setEditActivo(null);   // cierra editar si estaba abierto
    setPagoActivo((prev) => (prev === id ? null : id));
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
              <th>Apoderado</th>
              <th>Curso</th>
              <th>Fecha inicio</th>
              <th>Fecha vencimiento</th>
              <th>Faltan</th>
              <th>Monto</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mensualidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  No se encontraron mensualidades
                </td>
              </tr>
            ) : (
            mensualidadesFiltradas.map((m) => {
              const estado = calcEstado(m);
              return (
                <React.Fragment key={m.id}>
                  <tr>
                    <td>{m.nombres} {m.apellidos}</td>
                    <td className="td-apoderado">{m.apoderado || <span className="sin-dato">—</span>}</td>
                    <td>{m.curso}</td>
                    <td className="td-fecha">{formatFecha(m.fecha_inicio)}</td>
                    <td className="td-fecha">{formatFecha(m.fecha_vencimiento)}</td>
                    <td className="td-contador">
                      <ContadorDias fechaInicio={m.fecha_inicio} estado={estado} />
                    </td>
                    <td>{formatMonto(m.monto)}</td>
                    <td>{formatMonto(m.pagado)}</td>
                    <td>{formatMonto(m.saldo)}</td>
                    <td><BadgeEstado estado={estado} /></td>
                    <td>
                      <div className="acciones">
                        {estado !== "PAGADO" && (
                          <button
                            className={`btn-pagar${pagoActivo === m.id ? " btn-pagar-activo" : ""}`}
                            onClick={() => handleAbrirPago(m.id)}
                          >
                            💵 Pagar
                          </button>
                        )}
                        <button
                          className="btn-imprimir"
                          title="Imprimir / Guardar PDF"
                          onClick={() => imprimirMensualidad(m, estado)}
                        >
                          🖨️ PDF
                        </button>
                        <button
                          className={`btn-editar${editActivo === m.id ? " btn-editar-activo" : ""}`}
                          title="Editar mensualidad"
                          onClick={() => handleAbrirEditar(m.id)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-eliminar"
                          title="Eliminar mensualidad"
                          onClick={() => handleEliminar(m)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>

                  {pagoActivo === m.id && (
                    <FormPagoInline
                      mensualidad={m}
                      onClose={() => setPagoActivo(null)}
                      onSuccess={() => { setPagoActivo(null); cargar(); }}
                    />
                  )}

                  {editActivo === m.id && (
                    <FormEditarInline
                      mensualidad={m}
                      onClose={() => setEditActivo(null)}
                      onSuccess={() => { setEditActivo(null); cargar(); }}
                    />
                  )}
                </React.Fragment>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
