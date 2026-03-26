import { useEffect, useState, useMemo } from "react";
import "./Pagos.css";
import { getPagos, updatePago, deletePago } from "../services/pagos.service";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const formatFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const formatMonto = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;

const ITEMS_POR_PAGINA = 10;

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
const Pagos = () => {
  const [pagos,        setPagos]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mensaje,      setMensaje]      = useState(null);

  /* filtros */
  const [buscarAlumno, setBuscarAlumno] = useState("");
  const [filtroPeriodo,setFiltroPeriodo]= useState("");
  const [filtroMes,    setFiltroMes]    = useState("");

  /* paginación */
  const [pagina,       setPagina]       = useState(1);

  /* edición */
  const [editId,       setEditId]       = useState(null);
  const [editForm,     setEditForm]     = useState({ monto: "", fecha_pago: "" });

  /* ── mensajes ── */
  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  /* ── carga ── */
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getPagos();
      setPagos(res.data || []);
    } catch {
      mostrarMensaje("Error al cargar los pagos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /* ── períodos únicos para el select ── */
  const periodos = useMemo(() => {
    const set = new Set(pagos.map((p) => p.periodo).filter(Boolean));
    return [...set].sort().reverse();
  }, [pagos]);

  /* ── meses únicos ── */
  const meses = useMemo(() => {
    const set = new Set(
      pagos
        .map((p) => p.fecha_pago?.slice(0, 7))
        .filter(Boolean)
    );
    return [...set].sort().reverse();
  }, [pagos]);

  /* ── filtrado ── */
  const filtrados = useMemo(() => {
    return pagos.filter((p) => {
      const nombre = `${p.nombres} ${p.apellidos}`.toLowerCase();
      const coincideNombre  = !buscarAlumno  || nombre.includes(buscarAlumno.toLowerCase());
      const coincidePeriodo = !filtroPeriodo || p.periodo === filtroPeriodo;
      const coincideMes     = !filtroMes     || p.fecha_pago?.startsWith(filtroMes);
      return coincideNombre && coincidePeriodo && coincideMes;
    });
  }, [pagos, buscarAlumno, filtroPeriodo, filtroMes]);

  /* ── totales del filtro actual ── */
  const totalFiltrado = useMemo(
    () => filtrados.reduce((s, p) => s + parseFloat(p.monto || 0), 0),
    [filtrados]
  );

  /* ── paginación ── */
  const totalPaginas  = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaSegura  = Math.min(pagina, totalPaginas);
  const inicio        = (paginaSegura - 1) * ITEMS_POR_PAGINA;
  const paginados     = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

  /* resetear a página 1 cuando cambia un filtro */
  useEffect(() => { setPagina(1); }, [buscarAlumno, filtroPeriodo, filtroMes]);

  /* ── editar ── */
  const abrirEditar = (p) => {
    setEditId(p.id);
    setEditForm({ monto: p.monto, fecha_pago: p.fecha_pago?.slice(0, 10) || "" });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await updatePago(editId, editForm);
      mostrarMensaje("Pago actualizado correctamente");
      setEditId(null);
      cargar();
    } catch {
      mostrarMensaje("Error al actualizar el pago", "error");
    }
  };

  /* ── eliminar ── */
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return;
    try {
      await deletePago(id);
      mostrarMensaje("Pago eliminado");
      cargar();
    } catch {
      mostrarMensaje("Error al eliminar el pago", "error");
    }
  };

  /* ── limpiar filtros ── */
  const limpiarFiltros = () => {
    setBuscarAlumno("");
    setFiltroPeriodo("");
    setFiltroMes("");
  };

  const hayFiltros = buscarAlumno || filtroPeriodo || filtroMes;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="pagos-page">

      {/* ── HEADER ── */}
      <div className="pagos-header">
        <div className="header-titulo">
          <span className="header-icon">🧾</span>
          <div>
            <h1>Historial de Cobros</h1>
            <p className="header-sub">
              {pagos.length} transacciones registradas ·{" "}
              <strong>{formatMonto(pagos.reduce((s, p) => s + parseFloat(p.monto || 0), 0))}</strong> total cobrado
            </p>
          </div>
        </div>
      </div>

      {/* ── MENSAJE ── */}
      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {/* ── FORM EDICIÓN ── */}
      {editId && (
        <div className="form-card">
          <h2 className="form-titulo">✏️ Corregir Pago</h2>
          <form onSubmit={guardarEdicion}>
            <div className="form-grid">
              <div className="form-group">
                <label>Monto *</label>
                <input
                  type="number"
                  value={editForm.monto}
                  onChange={(e) => setEditForm((p) => ({ ...p, monto: e.target.value }))}
                  min="0.01" step="0.01" required autoFocus
                />
              </div>
              <div className="form-group">
                <label>Fecha del pago *</label>
                <input
                  type="date"
                  value={editForm.fecha_pago}
                  onChange={(e) => setEditForm((p) => ({ ...p, fecha_pago: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => setEditId(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">
                💾 Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── BARRA DE FILTROS ── */}
      <div className="filtros-card">
        <div className="filtros-titulo">
          <span>🔎 Filtros</span>
          {hayFiltros && (
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        <div className="filtros-grid">

          {/* Buscar alumno */}
          <div className="filtro-group">
            <label>Buscar alumno</label>
            <div className="filtro-input-wrap">
              <span className="filtro-icon">🔍</span>
              <input
                className="filtro-input"
                placeholder="Nombre o apellido…"
                value={buscarAlumno}
                onChange={(e) => setBuscarAlumno(e.target.value)}
              />
              {buscarAlumno && (
                <button className="filtro-clear" onClick={() => setBuscarAlumno("")}>✕</button>
              )}
            </div>
          </div>

          {/* Período */}
          <div className="filtro-group">
            <label>Período</label>
            <select
              className="filtro-select"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
            >
              <option value="">Todos los períodos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Mes de pago */}
          <div className="filtro-group">
            <label>Mes de cobro</label>
            <select
              className="filtro-select"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            >
              <option value="">Todos los meses</option>
              {meses.map((m) => {
                const [y, mo] = m.split("-");
                const nombres = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
                return (
                  <option key={m} value={m}>
                    {nombres[parseInt(mo) - 1]} {y}
                  </option>
                );
              })}
            </select>
          </div>

        </div>

        {/* Resumen del filtro */}
        <div className="filtros-resumen">
          <span>
            Mostrando <strong>{filtrados.length}</strong> de {pagos.length} cobros
          </span>
          {hayFiltros && (
            <span className="resumen-total">
              Total filtrado: <strong>{formatMonto(totalFiltrado)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── TABLA / LOADING ── */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span className="loading-text">Cargando historial…</span>
        </div>
      ) : (
        <>
          {/* TABLA desktop */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Período</th>
                  <th>Monto cobrado</th>
                  <th>Fecha de cobro</th>
                  <th>Saldo que quedó</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">
                      Sin cobros para los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  paginados.map((p, i) => (
                    <tr key={p.id}>
                      <td className="td-num-row">{inicio + i + 1}</td>
                      <td className="td-alumno">{p.nombres} {p.apellidos}</td>
                      <td>{p.curso}</td>
                      <td><span className="badge-periodo">{p.periodo}</span></td>
                      <td className="td-monto">{formatMonto(p.monto)}</td>
                      <td className="td-fecha">{formatFecha(p.fecha_pago)}</td>
                      <td>
                        {parseFloat(p.saldo_mensualidad) > 0 ? (
                          <span className="saldo-pendiente">
                            {formatMonto(p.saldo_mensualidad)} pendiente
                          </span>
                        ) : (
                          <span className="saldo-cero">✓ Saldado</span>
                        )}
                      </td>
                      <td>
                        <div className="acciones">
                          <button className="btn-editar" onClick={() => abrirEditar(p)}>
                            ✏️ Editar
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminar(p.id)}>
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Pie de tabla con total de la página */}
              {paginados.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} className="tfoot-label">
                      Total página {paginaSegura}
                    </td>
                    <td className="tfoot-monto">
                      {formatMonto(paginados.reduce((s, p) => s + parseFloat(p.monto || 0), 0))}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* CARDS mobile */}
          <div className="cards">
            {paginados.length === 0 ? (
              <div className="no-data-mobile">Sin cobros para los filtros seleccionados</div>
            ) : (
              paginados.map((p, i) => (
                <div key={p.id} className="card">
                  <div className="card-header">
                    <strong>{p.nombres} {p.apellidos}</strong>
                    <span className="badge-periodo">{p.periodo}</span>
                  </div>
                  <div className="card-body">
                    <span>📚 {p.curso}</span>
                    <span>💵 Cobrado: <strong className="td-monto">{formatMonto(p.monto)}</strong> el {formatFecha(p.fecha_pago)}</span>
                    <span>
                      {parseFloat(p.saldo_mensualidad) > 0
                        ? <span className="saldo-pendiente">⚠ Saldo pendiente: {formatMonto(p.saldo_mensualidad)}</span>
                        : <span className="saldo-cero">✓ Mensualidad saldada</span>
                      }
                    </span>
                    <div className="acciones">
                      <button className="btn-editar" onClick={() => abrirEditar(p)}>✏️ Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminar(p.id)}>🗑️ Eliminar</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── PAGINACIÓN ── */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                className="pag-btn"
                onClick={() => setPagina(1)}
                disabled={paginaSegura === 1}
              >«</button>
              <button
                className="pag-btn"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaSegura === 1}
              >‹</button>

              {/* números de página */}
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - paginaSegura) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "..." ? (
                    <span key={`dots-${i}`} className="pag-dots">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`pag-btn${n === paginaSegura ? " pag-activo" : ""}`}
                      onClick={() => setPagina(n)}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                className="pag-btn"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaSegura === totalPaginas}
              >›</button>
              <button
                className="pag-btn"
                onClick={() => setPagina(totalPaginas)}
                disabled={paginaSegura === totalPaginas}
              >»</button>

              <span className="pag-info">
                {inicio + 1}–{Math.min(inicio + ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Pagos;
