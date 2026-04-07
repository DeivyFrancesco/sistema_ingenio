import { useRef } from "react";

/* ─── DATOS DE LA ACADEMIA ─── */
const ACADEMIA = {
  nombre: "ZTRILCE",
  direccion: "Jr. Revilla Pérez 319-325 - Cajamarca",
  ruc: "",
  telefono: "",
};

/* ─── HELPERS ─── */
const formatFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const formatMonto = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const fechaEnLetras = () => {
  const d = new Date();
  return `${d.getDate()} de ${MESES[d.getMonth()]} del ${d.getFullYear()}`;
};

/* ─── ESTILOS ─── */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 24px 60px rgba(0,0,0,.25)",
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#4338ca",
    borderRadius: "12px 12px 0 0",
  },
  modalBarTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    margin: 0,
  },
  btnClose: {
    background: "rgba(255,255,255,.18)",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  recibo: {
    padding: "28px 32px 24px",
  },
  encabezado: {
    textAlign: "center",
    marginBottom: 20,
    borderBottom: "2px solid #4338ca",
    paddingBottom: 16,
  },
  academiaNombre: {
    fontSize: 20,
    fontWeight: 800,
    color: "#1e1b4b",
    letterSpacing: -0.5,
    margin: "0 0 4px",
  },
  academiaSub: {
    fontSize: 12,
    color: "#6b7280",
    margin: 0,
  },
  reciboTitulo: {
    textAlign: "center",
    margin: "16px 0 6px",
    fontSize: 15,
    fontWeight: 800,
    color: "#4338ca",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  reciboNum: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 18,
  },
  seccion: {
    background: "#f9fafb",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 12,
    border: "1px solid #e5e7eb",
  },
  seccionTitulo: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    fontSize: 13,
  },
  filaLabel: {
    color: "#6b7280",
    fontWeight: 500,
    minWidth: 120,
  },
  filaValor: {
    color: "#111827",
    fontWeight: 600,
    textAlign: "right",
  },
  montoBox: {
    background: "#4338ca",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  montoLabel: {
    color: "#c7d2fe",
    fontSize: 13,
    fontWeight: 600,
  },
  montoValor: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
  },
  saldoBox: {
    borderRadius: 8,
    padding: "10px 16px",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
  },
  firmaArea: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 14,
    borderTop: "1px dashed #e5e7eb",
  },
  firmaBloque: {
    textAlign: "center",
    width: "45%",
  },
  firmaLinea: {
    borderTop: "1px solid #374151",
    marginTop: 28,
    marginBottom: 4,
    fontSize: 11,
    color: "#6b7280",
  },
  btnArea: {
    display: "flex",
    gap: 10,
    padding: "0 32px 24px",
    justifyContent: "flex-end",
  },
  btnImprimir: {
    padding: "9px 20px",
    background: "#4338ca",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(67,56,202,.3)",
  },
  btnCerrar: {
    padding: "9px 20px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1.5px solid #e5e7eb",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
    fontSize: 11,
    color: "#9ca3af",
  },
};

/* ─── COMPONENTE ─── */
export default function ReciboPago({ data, onClose, numeroRecibo }) {
  const reciboRef = useRef(null);

  if (!data) return null;

  const saldoRestante = parseFloat(data.saldo_mensualidad ?? 0);
  const saldoPagado = parseFloat(data.monto);
  const saldoAnterior = saldoRestante + saldoPagado;

  const apoderado =
    data.apoderado_nombres && data.apoderado_apellidos
      ? `${data.apoderado_nombres} ${data.apoderado_apellidos}`
      : "—";

  const imprimir = () => {
    const contenido = reciboRef.current.innerHTML;
    const ventana = window.open("", "_blank", "width=620,height=800");
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Recibo de Pago – ${data.nombres} ${data.apellidos}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              padding: 32px;
              color: #111827;
              background: #fff;
            }
            @page { size: A5 landscape; margin: 15mm; }
          </style>
        </head>
        <body>
          ${contenido}
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 600);
  };

  const numRecibo = numeroRecibo
    ? String(numeroRecibo).padStart(6, "0")
    : String(data.id ?? "------").padStart(6, "0");

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.modal}>
        {/* Barra del modal */}
        <div style={styles.modalBar}>
          <p style={styles.modalBarTitle}>🧾 Vista previa del recibo</p>
          <button style={styles.btnClose} onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>

        {/* Contenido imprimible */}
        <div ref={reciboRef} style={styles.recibo}>
          {/* Encabezado */}
          <div style={styles.encabezado}>
            <h1 style={styles.academiaNombre}>{ACADEMIA.nombre}</h1>
            <p style={styles.academiaSub}>{ACADEMIA.direccion}</p>
            {ACADEMIA.ruc && (
              <p style={styles.academiaSub}>RUC: {ACADEMIA.ruc}</p>
            )}
            {ACADEMIA.telefono && (
              <p style={styles.academiaSub}>Tel: {ACADEMIA.telefono}</p>
            )}
          </div>

          {/* Título */}
          <p style={styles.reciboTitulo}>Recibo de Pago</p>
          <p style={styles.reciboNum}>N° {numRecibo}</p>

          {/* Datos del Alumno */}
          <div style={styles.seccion}>
            <p style={styles.seccionTitulo}>Datos del Alumno</p>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Alumno</span>
              <span style={styles.filaValor}>
                {data.nombres} {data.apellidos}
              </span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Apoderado</span>
              <span style={styles.filaValor}>{apoderado}</span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Curso</span>
              <span style={styles.filaValor}>{data.curso}</span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Período</span>
              <span style={styles.filaValor}>{data.periodo}</span>
            </div>
          </div>

          {/* Detalle de Mensualidad */}
          <div style={styles.seccion}>
            <p style={styles.seccionTitulo}>Detalle de Mensualidad</p>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Fecha inicio</span>
              <span style={styles.filaValor}>
                {formatFecha(data.fecha_inicio)}
              </span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Fecha vencimiento</span>
              <span style={styles.filaValor}>
                {formatFecha(data.fecha_vencimiento)}
              </span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Monto mensualidad</span>
              <span style={styles.filaValor}>
                {formatMonto(data.monto_total)}
              </span>
            </div>
            <div style={styles.fila}>
              <span style={styles.filaLabel}>Saldo anterior</span>
              <span style={styles.filaValor}>{formatMonto(saldoAnterior)}</span>
            </div>
          </div>

          {/* Monto cobrado */}
          <div style={styles.montoBox}>
            <span style={styles.montoLabel}>Monto cobrado</span>
            <span style={styles.montoValor}>{formatMonto(data.monto)}</span>
          </div>

          {/* Saldo restante */}
          <div
            style={{
              ...styles.saldoBox,
              background: saldoRestante > 0 ? "#fff7ed" : "#d1fae5",
              border: `1px solid ${
                saldoRestante > 0 ? "#fed7aa" : "#6ee7b7"
              }`,
            }}
          >
            <span
              style={{
                color: saldoRestante > 0 ? "#ea580c" : "#059669",
                fontWeight: 600,
              }}
            >
              {saldoRestante > 0
                ? "⚠ Saldo pendiente"
                : "✓ Mensualidad saldada"}
            </span>
            <span
              style={{
                color: saldoRestante > 0 ? "#ea580c" : "#059669",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {formatMonto(saldoRestante)}
            </span>
          </div>

          {/* Fecha */}
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              textAlign: "right",
              marginBottom: 8,
            }}
          >
            Cajamarca, {fechaEnLetras()}
          </p>

          {/* Firmas */}
          <div style={styles.firmaArea}>
            <div style={styles.firmaBloque}>
              <div style={styles.firmaLinea}>Firma del Cajero</div>
            </div>
            <div style={styles.firmaBloque}>
              <div style={styles.firmaLinea}>Firma del Apoderado</div>
            </div>
          </div>

          {/* Pie de página */}
          <div style={styles.footer}>{ACADEMIA.direccion}</div>
        </div>

        {/* Botones */}
        <div style={styles.btnArea}>
          <button style={styles.btnCerrar} onClick={onClose}>
            Cerrar
          </button>
          <button style={styles.btnImprimir} onClick={imprimir}>
            🖨 Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}