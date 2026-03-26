import { useEffect, useState, useMemo } from "react";
import "./Matriculas.css";
import {
  getMatriculas,
  createMatricula,
  updateMatricula,
  deleteMatricula,
} from "../services/matriculas.service";
import { getAlumnos } from "../services/alumnos.service";
import { getCursos }  from "../services/cursos.service";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const hoy = () => new Date().toISOString().slice(0, 10);
const formatFecha = (f) => {
  if (!f) return "—";
  const [y, m, d] = f.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};
const formatMonto  = (v) => `S/ ${parseFloat(v || 0).toFixed(2)}`;
const ITEMS_X_PAG  = 10;

/* ─────────────────────────────────────────
   BADGE ESTADO
───────────────────────────────────────── */
const BadgeEstado = ({ estado }) => {
  const map = {
    ACTIVO:   ["badge-activo",   "● Activo"],
    INACTIVO: ["badge-inactivo", "○ Inactivo"],
    RETIRADO: ["badge-retirado", "✗ Retirado"],
  };
  const [cls, label] = map[estado] || map.ACTIVO;
  return <span className={`badge-estado-mat ${cls}`}>{label}</span>;
};

/* ─────────────────────────────────────────
   TOGGLE ACTIVO / INACTIVO
───────────────────────────────────────── */
const ToggleEstado = ({ estado, onChange, disabled }) => {
  const activo = (estado || "ACTIVO") === "ACTIVO";
  return (
    <button
      className={`toggle-btn${activo ? " toggle-on" : " toggle-off"}`}
      onClick={onChange}
      disabled={disabled}
      title={activo ? "Desactivar" : "Activar"}
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-text">{activo ? "Activo" : "Inactivo"}</span>
    </button>
  );
};

/* ─────────────────────────────────────────
   FORM EDICIÓN INLINE
───────────────────────────────────────── */
const FormEdicion = ({ matricula, onGuardar, onCancelar }) => {
  const [monto,       setMonto]       = useState(matricula.monto       || "");
  const [fechaInicio, setFechaInicio] = useState(matricula.fecha_inicio?.slice(0,10) || hoy());
  const [estado,      setEstado]      = useState(matricula.estado      || "ACTIVO");
  const [guardando,   setGuardando]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateMatricula(matricula.id, { monto, fecha_inicio: fechaInicio, estado });
      onGuardar();
    } catch {
      onGuardar("error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <tr className="fila-edicion">
      <td colSpan={8}>
        <div className="form-edicion-inline">
          <div className="fei-cabecera">
            <span className="fei-titulo">
              ✏️ Editando — <strong>{matricula.nombres} {matricula.apellidos}</strong>
            </span>
            <span className="fei-curso">{matricula.curso}</span>
          </div>
          <form onSubmit={submit} className="fei-grid">

            <div className="fei-group">
              <label>Monto mensual *</label>
              <input
                type="number" value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="0.01" min="0" placeholder="0.00" required autoFocus
              />
            </div>

            <div className="fei-group">
              <label>Fecha de inicio *</label>
              <input
                type="date" value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)} required
              />
            </div>

            <div className="fei-group">
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="RETIRADO">Retirado</option>
              </select>
            </div>

            <div className="fei-actions">
              <button type="button" className="btn-cancelar" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar" disabled={guardando}>
                {guardando ? "Guardando…" : "💾 Guardar cambios"}
              </button>
            </div>

          </form>
        </div>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
const FORM_VACIO = {
  alumno_id: "", curso_id: "",
  fecha_inicio: hoy(), anio: new Date().getFullYear(), monto: "",
};

export default function Matriculas() {
  const [matriculas,     setMatriculas]     = useState([]);
  const [alumnos,        setAlumnos]        = useState([]);
  const [cursos,         setCursos]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [mensaje,        setMensaje]        = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [form,           setForm]           = useState(FORM_VACIO);
  const [editId,         setEditId]         = useState(null);
  const [toggleCargando, setToggleCargando] = useState(null);
  const [recienEditado,  setRecienEditado]  = useState(null);

  /* filtros */
  const [buscar,       setBuscar]       = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroAnio,   setFiltroAnio]   = useState("");

  /* paginación */
  const [pagina, setPagina] = useState(1);

  /* ── mensajes ── */
  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  /* ── carga ── */
  const cargar = async () => {
    setLoading(true);
    try {
      const [resMat, resA, resC] = await Promise.all([
        getMatriculas(), getAlumnos(), getCursos(),
      ]);
      setMatriculas(resMat.data.matriculas || resMat.data || []);
      setAlumnos(resA.data.alumnos || resA.data || []);
      setCursos(resC.data.cursos   || resC.data  || []);
    } catch {
      mostrarMensaje("Error al cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /* ── nueva matrícula ── */
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.alumno_id || !form.curso_id || !form.fecha_inicio) {
      mostrarMensaje("Complete todos los campos obligatorios", "warn"); return;
    }
    try {
      await createMatricula(form);
      mostrarMensaje("Matrícula registrada correctamente");
      setShowForm(false); setForm(FORM_VACIO); cargar();
    } catch { mostrarMensaje("Error al registrar", "error"); }
  };

  /* ── toggle rápido activo/inactivo ── */
  const toggleEstado = async (m) => {
    const nuevo = (m.estado || "ACTIVO") === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setToggleCargando(m.id);
    try {
      await updateMatricula(m.id, { estado: nuevo });
      /* actualizar en local sin recargar todo */
      setMatriculas((prev) =>
        prev.map((x) => x.id === m.id ? { ...x, estado: nuevo } : x)
      );
    } catch {
      mostrarMensaje("Error al cambiar estado", "error");
    } finally {
      setToggleCargando(null);
    }
  };

  /* ── edición guardada ── */
  const onEdicionGuardada = (resultado) => {
    if (resultado === "error") {
      mostrarMensaje("Error al actualizar la matrícula", "error");
    } else {
      mostrarMensaje("Matrícula actualizada correctamente");
      /* highlight temporal de la fila editada */
      setRecienEditado(editId);
      setTimeout(() => setRecienEditado(null), 5000);
    }
    setEditId(null);
    cargar();
  };

  /* ── eliminar ── */
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta matrícula? Se eliminarán también sus mensualidades y pagos.")) return;
    try {
      await deleteMatricula(id);
      mostrarMensaje("Matrícula eliminada");
      cargar();
    } catch { mostrarMensaje("Error al eliminar", "error"); }
  };

  /* ── filtros ── */
  const anios = useMemo(() => {
    const s = new Set(matriculas.map((m) => m.anio).filter(Boolean));
    return [...s].sort().reverse();
  }, [matriculas]);

  const filtradas = useMemo(() => matriculas.filter((m) => {
    const n = `${m.nombres} ${m.apellidos}`.toLowerCase();
    const ok1 = !buscar || n.includes(buscar.toLowerCase()) || (m.curso||"").toLowerCase().includes(buscar.toLowerCase());
    const ok2 = filtroEstado === "TODAS" || (m.estado || "ACTIVO") === filtroEstado;
    const ok3 = !filtroAnio || String(m.anio) === filtroAnio;
    return ok1 && ok2 && ok3;
  }), [matriculas, buscar, filtroEstado, filtroAnio]);

  const contadores = useMemo(() => {
    const c = {};
    matriculas.forEach((m) => { const e = m.estado || "ACTIVO"; c[e] = (c[e]||0)+1; });
    return c;
  }, [matriculas]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITEMS_X_PAG));
  const paginaSeg    = Math.min(pagina, totalPaginas);
  const inicio       = (paginaSeg - 1) * ITEMS_X_PAG;
  const paginadas    = filtradas.slice(inicio, inicio + ITEMS_X_PAG);

  useEffect(() => { setPagina(1); }, [buscar, filtroEstado, filtroAnio]);

  const hayFiltros = buscar || filtroEstado !== "TODAS" || filtroAnio;
  const cursoSel   = cursos.find((c) => String(c.id) === String(form.curso_id));

  const FILTROS = [
    { key: "TODAS",   label: "Todas",     count: matriculas.length },
    { key: "ACTIVO",  label: "Activas",   count: contadores.ACTIVO   || 0 },
    { key: "INACTIVO",label: "Inactivas", count: contadores.INACTIVO || 0 },
    { key: "RETIRADO",label: "Retirados", count: contadores.RETIRADO || 0 },
  ];

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="mat-page">

      {/* HEADER */}
      <div className="mat-header">
        <div className="header-titulo">
          <span className="header-icon">📝</span>
          <div>
            <h1>Matrículas</h1>
            <p className="header-sub">
              <span className="sub-activos">{contadores.ACTIVO || 0} activa{(contadores.ACTIVO||0)!==1?"s":""}</span>
              {(contadores.RETIRADO||0) > 0 && (
                <> · <span className="sub-retirados">{contadores.RETIRADO} retirado{contadores.RETIRADO>1?"s":""}</span></>
              )}
            </p>
          </div>
        </div>
        <button className="btn-nuevo" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ Cerrar" : "+ Nueva Matrícula"}
        </button>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className={`mat-mensaje mat-mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {/* FORM NUEVA MATRÍCULA */}
      {showForm && (
        <div className="form-card">
          <h2 className="form-titulo">📋 Nueva Matrícula</h2>
          <form onSubmit={guardar}>
            <div className="form-grid">

              <div className="form-group full-width">
                <label>Alumno *</label>
                <select name="alumno_id" value={form.alumno_id} onChange={handleChange} required>
                  <option value="">— Seleccione alumno —</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombres} {a.apellidos} — DNI {a.dni}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Curso *</label>
                <select name="curso_id" value={form.curso_id} onChange={handleChange} required>
                  <option value="">— Seleccione curso —</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.nivel}) — S/ {c.precio_base}/mes
                    </option>
                  ))}
                </select>
              </div>

              {cursoSel && (
                <div className="info-curso full-width">
                  <span className="info-label">Precio base</span>
                  <span className="info-precio">S/ {parseFloat(cursoSel.precio_base).toFixed(2)} / mes</span>
                  <span className="info-hint">Cambia el monto abajo si el alumno tiene tarifa diferente.</span>
                </div>
              )}

              <div className="form-group">
                <label>Fecha de inicio *</label>
                <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Año *</label>
                <input type="number" name="anio" value={form.anio} onChange={handleChange} min="2020" max="2035" required />
              </div>

              <div className="form-group full-width">
                <label>
                  Monto mensual
                  {cursoSel && <span className="label-hint"> (precio base: S/ {parseFloat(cursoSel.precio_base).toFixed(2)})</span>}
                </label>
                <input
                  type="number" name="monto" value={form.monto} onChange={handleChange}
                  step="0.01" min="0"
                  placeholder={cursoSel ? parseFloat(cursoSel.precio_base).toFixed(2) : "0.00"}
                />
              </div>

            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={() => { setShowForm(false); setForm(FORM_VACIO); }}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">✓ Registrar Matrícula</button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS */}
      <div className="filtros-card">
        <div className="filtros-fila">
          <div className="filtro-tabs">
            {FILTROS.map((f) => (
              <button
                key={f.key}
                className={`filtro-tab filtro-tab-${f.key.toLowerCase()}${filtroEstado === f.key ? " activo" : ""}`}
                onClick={() => setFiltroEstado(f.key)}
              >
                {f.label}
                {f.count > 0 && <span className="tab-count">{f.count}</span>}
              </button>
            ))}
          </div>

          <div className="filtros-derecha">
            <select className="filtro-select" value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
              <option value="">Todos los años</option>
              {anios.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>

            <div className="filtro-input-wrap">
              <span className="filtro-icon">🔍</span>
              <input
                className="filtro-input"
                placeholder="Buscar alumno o curso…"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
              {buscar && <button className="filtro-clear" onClick={() => setBuscar("")}>✕</button>}
            </div>

            {hayFiltros && (
              <button className="btn-limpiar" onClick={() => { setBuscar(""); setFiltroEstado("TODAS"); setFiltroAnio(""); }}>
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="filtros-resumen">
          Mostrando <strong>{filtradas.length}</strong> de {matriculas.length} matrículas
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" /><span className="loading-text">Cargando matrículas…</span>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Año</th>
                  <th>Fecha inicio</th>
                  <th>Monto/mes</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginadas.length === 0 ? (
                  <tr><td colSpan={8} className="no-data">Sin matrículas para este filtro</td></tr>
                ) : (
                  paginadas.map((m, i) => [

                    /* ── FILA PRINCIPAL ── */
                    <tr
                      key={`m-${m.id}`}
                      className={[
                        `fila-estado-${(m.estado||"ACTIVO").toLowerCase()}`,
                        recienEditado === m.id ? "fila-recien-editada" : "",
                        editId === m.id ? "fila-en-edicion" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      <td className="td-num-row">{inicio + i + 1}</td>
                      <td className="td-alumno">
                        {m.nombres} {m.apellidos}
                        {recienEditado === m.id && (
                          <span className="chip-editado">✓ editado</span>
                        )}
                      </td>
                      <td>{m.curso}</td>
                      <td className="td-anio">{m.anio}</td>
                      <td className="td-fecha">{formatFecha(m.fecha_inicio)}</td>
                      <td className="td-monto">{formatMonto(m.monto)}</td>
                      <td>
                        <ToggleEstado
                          estado={m.estado}
                          onChange={() => toggleEstado(m)}
                          disabled={toggleCargando === m.id}
                        />
                      </td>
                      <td>
                        <div className="acciones">
                          <button
                            className={`btn-editar${editId === m.id ? " btn-editar-activo" : ""}`}
                            onClick={() => setEditId(editId === m.id ? null : m.id)}
                          >
                            {editId === m.id ? "✕" : "✏️ Editar"}
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminar(m.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>,

                    /* ── FORM EDICIÓN INLINE ── */
                    editId === m.id && (
                      <FormEdicion
                        key={`edit-${m.id}`}
                        matricula={m}
                        onGuardar={onEdicionGuardada}
                        onCancelar={() => setEditId(null)}
                      />
                    ),
                  ])
                )}
              </tbody>
            </table>
          </div>

          {/* CARDS mobile */}
          <div className="cards">
            {paginadas.length === 0 ? (
              <div className="no-data-mobile">Sin matrículas para este filtro</div>
            ) : (
              paginadas.map((m) => (
                <div key={m.id} className={[
                  `card card-${(m.estado||"ACTIVO").toLowerCase()}`,
                  recienEditado === m.id ? "card-recien-editada" : "",
                ].filter(Boolean).join(" ")}>
                  <div className="card-header">
                    <div>
                      <strong>{m.nombres} {m.apellidos}</strong>
                      {recienEditado === m.id && <span className="chip-editado">✓ editado</span>}
                      <div className="card-sub">{m.curso} · {m.anio}</div>
                    </div>
                    <BadgeEstado estado={m.estado || "ACTIVO"} />
                  </div>
                  <div className="card-body">
                    <span>📅 Inicio: {formatFecha(m.fecha_inicio)}</span>
                    <span>💰 Monto: <strong>{formatMonto(m.monto)}</strong></span>
                    <ToggleEstado
                      estado={m.estado}
                      onChange={() => toggleEstado(m)}
                      disabled={toggleCargando === m.id}
                    />
                    <div className="acciones">
                      <button
                        className={`btn-editar${editId === m.id ? " btn-editar-activo" : ""}`}
                        onClick={() => setEditId(editId === m.id ? null : m.id)}
                      >
                        {editId === m.id ? "✕ Cancelar" : "✏️ Editar"}
                      </button>
                      <button className="btn-eliminar" onClick={() => eliminar(m.id)}>🗑️</button>
                    </div>
                    {editId === m.id && (
                      <FormEdicion
                        matricula={m}
                        onGuardar={onEdicionGuardada}
                        onCancelar={() => setEditId(null)}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button className="pag-btn" onClick={() => setPagina(1)} disabled={paginaSeg===1}>«</button>
              <button className="pag-btn" onClick={() => setPagina((p)=>Math.max(1,p-1))} disabled={paginaSeg===1}>‹</button>
              {Array.from({length:totalPaginas},(_,i)=>i+1)
                .filter((n)=>n===1||n===totalPaginas||Math.abs(n-paginaSeg)<=1)
                .reduce((acc,n,idx,arr)=>{ if(idx>0&&n-arr[idx-1]>1)acc.push("..."); acc.push(n); return acc; },[])
                .map((n,i)=> n==="..."
                  ? <span key={`d${i}`} className="pag-dots">…</span>
                  : <button key={n} className={`pag-btn${n===paginaSeg?" pag-activo":""}`} onClick={()=>setPagina(n)}>{n}</button>
                )}
              <button className="pag-btn" onClick={() => setPagina((p)=>Math.min(totalPaginas,p+1))} disabled={paginaSeg===totalPaginas}>›</button>
              <button className="pag-btn" onClick={() => setPagina(totalPaginas)} disabled={paginaSeg===totalPaginas}>»</button>
              <span className="pag-info">{inicio+1}–{Math.min(inicio+ITEMS_X_PAG,filtradas.length)} de {filtradas.length}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
