import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ReporteAlumno.css";

// Helpers
const ESTADOS = {
    presente:    { label: "Presente",    color: "#10b981", bg: "#d1fae5", text: "#065f46" },
    tarde:       { label: "Tarde",       color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
    ausente:     { label: "Ausente",     color: "#ef4444", bg: "#fee2e2", text: "#7f1d1d" },
    justificado: { label: "Justificado", color: "#8b5cf6", bg: "#ede9fe", text: "#4c1d95" },
};

const fmtFecha = (str) => {
    if (!str) return "—";
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
};

const fmtHora = (t) => {
    if (!t) return "—";
    return String(t).slice(0, 5);
};

// Export Excel
const exportExcel = (alumno, registros, rango) => {
    const resumen = Object.keys(ESTADOS).reduce((acc, k) => {
        acc[ESTADOS[k].label] = registros.filter(r => r.estado === k).length;
        return acc;
    }, {});

    const data = registros.map((r, i) => ({
        "#":            i + 1,
        Fecha:          fmtFecha(r.fecha),
        Curso:          r.curso_nombre || "—",
        Estado:         ESTADOS[r.estado]?.label || r.estado,
        "Hora Ingreso": fmtHora(r.hora_ingreso),
        Nota:           r.nota || "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Detalle");

    const resumenData = [
        { Concepto: "Alumno",   Valor: `${alumno.apellidos}, ${alumno.nombres}` },
        { Concepto: "DNI",      Valor: alumno.dni },
        { Concepto: "Período",  Valor: `${rango.desde} al ${rango.hasta}` },
        { Concepto: "Total días registrados", Valor: registros.length },
        ...Object.keys(ESTADOS).map(k => ({
            Concepto: ESTADOS[k].label,
            Valor: resumen[ESTADOS[k].label],
        })),
        { Concepto: "% Asistencia", Valor: registros.length
            ? `${Math.round((resumen.Presente / registros.length) * 100)}%`
            : "—"
        },
    ];
    const wsR = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsR, "Resumen");

    XLSX.writeFile(wb, `reporte_${alumno.apellidos}_${rango.desde}_${rango.hasta}.xlsx`);
};

// Export PDF
const exportPDF = (alumno, registros, rango) => {
    const doc = new jsPDF();
    const total = registros.length;
    const presente = registros.filter(r => r.estado === "presente").length;

    doc.setFillColor(14, 116, 144);
    doc.rect(0, 0, 220, 38, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Asistencias", 14, 16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Alumno: ${alumno.apellidos}, ${alumno.nombres}  |  DNI: ${alumno.dni}`, 14, 25);
    doc.text(`Período: ${rango.desde} al ${rango.hasta}`, 14, 32);

    doc.setTextColor(30, 41, 59);
    let x = 14;
    const statsY = 46;
    const statItems = [
        { label: "Total", val: total,     col: [100,116,139] },
        { label: "Presentes", val: presente, col: [16,185,129] },
        { label: "Tarde", val: registros.filter(r=>r.estado==="tarde").length, col: [245,158,11] },
        { label: "Ausentes", val: registros.filter(r=>r.estado==="ausente").length, col: [239,68,68] },
        { label: "Justificados", val: registros.filter(r=>r.estado==="justificado").length, col: [139,92,246] },
        { label: "% Asistencia", val: total ? `${Math.round((presente/total)*100)}%` : "—", col: [14,116,144] },
    ];
    statItems.forEach(s => {
        doc.setFillColor(...s.col);
        doc.roundedRect(x, statsY, 30, 18, 3, 3, "F");
        doc.setTextColor(255,255,255);
        doc.setFontSize(13);
        doc.setFont("helvetica","bold");
        doc.text(String(s.val), x+15, statsY+10, { align: "center" });
        doc.setFontSize(7);
        doc.setFont("helvetica","normal");
        doc.text(s.label, x+15, statsY+16, { align: "center" });
        x += 33;
    });

    autoTable(doc, {
        startY: statsY + 26,
        head: [["#", "Fecha", "Curso", "Estado", "Hora", "Nota"]],
        body: registros.map((r, i) => [
            i + 1,
            fmtFecha(r.fecha),
            r.curso_nombre || "—",
            ESTADOS[r.estado]?.label || r.estado,
            fmtHora(r.hora_ingreso),
            r.nota || "",
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [14, 116, 144], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        didParseCell(data) {
            if (data.section === "body" && data.column.index === 3) {
                const estado = registros[data.row.index]?.estado;
                if (estado === "presente")    data.cell.styles.textColor = [6,95,70];
                if (estado === "ausente")     data.cell.styles.textColor = [127,29,29];
                if (estado === "tarde")       data.cell.styles.textColor = [146,64,14];
                if (estado === "justificado") data.cell.styles.textColor = [76,29,149];
            }
        },
        foot: [[
            "", "", "",
            `Total: ${total}`,
            `P:${presente} A:${registros.filter(r=>r.estado==="ausente").length}`,
            "",
        ]],
        footStyles: { fillColor: [241,245,249], textColor: [30,41,59], fontStyle: "bold" },
    });

    doc.save(`reporte_${alumno.apellidos}_${rango.desde}_${rango.hasta}.pdf`);
};

// Componente principal
const ReporteAlumno = () => {
    const hoy    = new Date().toISOString().slice(0, 10);
    const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const [busq, setBusq]                   = useState("");
    const [buscando, setBuscando]           = useState(false);
    const [resultados, setResultados]       = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [alumno, setAlumno]               = useState(null);
    const [desde, setDesde]                 = useState(hace30);
    const [hasta, setHasta]                 = useState(hoy);
    const [registros, setRegistros]         = useState([]);
    const [cargando, setCargando]           = useState(false);
    const [error, setError]                 = useState("");
    const [filtroEstado, setFiltroEstado]   = useState("todos");

    const timerRef = useRef(null);
    const wrapRef  = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Buscar alumno con debounce
    const buscarAlumno = useCallback((q) => {
        setBusq(q);
        setDropdownVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!q) {
            setAlumno(null);
            setRegistros([]);
            setResultados([]);
            return;
        }
        if (q.length < 2) { setResultados([]); return; }

        timerRef.current = setTimeout(async () => {
            setBuscando(true);
            try {
                const res  = await fetch(`/api/asistencias/alumnos/buscar?q=${encodeURIComponent(q)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const lista = Array.isArray(data) ? data : [];
                setResultados(lista);
                setDropdownVisible(lista.length > 0);
            } catch (err) {
                console.error("Error en búsqueda:", err);
                setResultados([]);
            } finally {
                setBuscando(false);
            }
        }, 350);
    }, []);

    // Seleccionar alumno del dropdown
    const seleccionarAlumno = async (a) => {
        setAlumno(a);
        setResultados([]);
        setDropdownVisible(false);
        setBusq(`${a.apellidos}, ${a.nombres}`);
        await cargarRegistros(a.alumno_id);
    };

    // Cargar registros de asistencia del alumno
    const cargarRegistros = async (alumno_id) => {
        setCargando(true);
        setError("");
        setRegistros([]);
        try {
            const res  = await fetch(`/api/asistencias/alumno/${alumno_id}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status} - ${text}`);
            }
            const data = await res.json();
            setRegistros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar registros:", err);
            setError(`Error al cargar registros: ${err.message}`);
        } finally {
            setCargando(false);
        }
    };

    const handleFiltrar = () => {
        if (alumno) cargarRegistros(alumno.alumno_id);
    };

    // Filtrar en frontend por rango de fechas + estado
    const registrosFiltrados = useMemo(() => {
        return registros.filter(r => {
            const fechaStr = r.fecha ? String(r.fecha).slice(0, 10) : "";
            const enRango  = fechaStr >= desde && fechaStr <= hasta;
            const porEstado = filtroEstado === "todos" || r.estado === filtroEstado;
            return enRango && porEstado;
        });
    }, [registros, desde, hasta, filtroEstado]);

    const stats = useMemo(() => ({
        total:       registrosFiltrados.length,
        presente:    registrosFiltrados.filter(r => r.estado === "presente").length,
        tarde:       registrosFiltrados.filter(r => r.estado === "tarde").length,
        ausente:     registrosFiltrados.filter(r => r.estado === "ausente").length,
        justificado: registrosFiltrados.filter(r => r.estado === "justificado").length,
        pct: registrosFiltrados.length
            ? Math.round(
                (registrosFiltrados.filter(r => r.estado === "presente").length /
                 registrosFiltrados.length) * 100
              )
            : 0,
    }), [registrosFiltrados]);

    const limpiar = () => {
        setBusq("");
        setAlumno(null);
        setRegistros([]);
        setResultados([]);
        setDropdownVisible(false);
        setError("");
    };

    return (
        <div className="ra-container">
            {/* Header */}
            <div className="ra-header">
                <div className="ra-header-left">
                    <div className="ra-icon-box">📊</div>
                    <div>
                        <h1 className="ra-title">Reporte por Alumno</h1>
                        <p className="ra-subtitle">Historial de asistencias en un rango de fechas</p>
                    </div>
                </div>
                {alumno && (
                    <div className="ra-export-btns">
                        <button
                            className="btn-exp btn-xlsx"
                            onClick={() => exportExcel(alumno, registrosFiltrados, { desde, hasta })}
                            disabled={registrosFiltrados.length === 0}
                        >
                            📊 Excel
                        </button>
                        <button
                            className="btn-exp btn-pdf"
                            onClick={() => exportPDF(alumno, registrosFiltrados, { desde, hasta })}
                            disabled={registrosFiltrados.length === 0}
                        >
                            📄 PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Panel de filtros */}
            <div className="ra-filters-card">
                <div className="ra-filters-grid">
                    {/* Buscador con dropdown */}
                    <div className="ra-filter-group ra-search-group">
                        <label>Alumno</label>
                        <div className="ra-search-wrap" ref={wrapRef}>
                            <span className="ra-search-icon">{buscando ? "⏳" : "🔍"}</span>
                            <input
                                type="text"
                                className="ra-search-input"
                                placeholder="Buscar por nombre o DNI..."
                                value={busq}
                                onChange={e => buscarAlumno(e.target.value)}
                                onFocus={() => resultados.length > 0 && setDropdownVisible(true)}
                                autoComplete="off"
                            />
                            {busq && (
                                <button className="ra-search-clear" onClick={limpiar}>✕</button>
                            )}

                            {dropdownVisible && resultados.length > 0 && (
                                <div className="ra-dropdown">
                                    {resultados.map((r, i) => (
                                        <div
                                            key={`${r.alumno_id}-${i}`}
                                            className="ra-dropdown-item"
                                            onMouseDown={e => { e.preventDefault(); seleccionarAlumno(r); }}
                                        >
                                            <span className="ra-drop-nombre">
                                                {r.apellidos}, {r.nombres}
                                            </span>
                                            <span className="ra-drop-meta">
                                                DNI: {r.dni}
                                                {r.curso_nombre ? ` · ${r.curso_nombre}` : " · Sin curso asignado"}
                                                {r.grado ? ` (${r.grado})` : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!buscando && busq.length >= 2 && resultados.length === 0 && !alumno && (
                                <div className="ra-dropdown">
                                    <div className="ra-dropdown-empty">
                                        No se encontró ningún alumno con "{busq}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desde */}
                    <div className="ra-filter-group">
                        <label>Desde</label>
                        <input
                            type="date"
                            value={desde}
                            onChange={e => setDesde(e.target.value)}
                            className="ra-date-input"
                        />
                    </div>

                    {/* Hasta */}
                    <div className="ra-filter-group">
                        <label>Hasta</label>
                        <input
                            type="date"
                            value={hasta}
                            onChange={e => setHasta(e.target.value)}
                            className="ra-date-input"
                        />
                    </div>

                    {/* Botón filtrar */}
                    <div className="ra-filter-group ra-filter-btn-group">
                        <label>&nbsp;</label>
                        <button
                            className="btn-filtrar"
                            onClick={handleFiltrar}
                            disabled={!alumno || cargando}
                        >
                            {cargando ? "Cargando..." : "🔎 Aplicar filtro"}
                        </button>
                    </div>
                </div>

                {/* Accesos rápidos de rango */}
                <div className="ra-quick-ranges">
                    <span className="ra-quick-label">Rápido:</span>
                    {[
                        { label: "Esta semana",     days: 7   },
                        { label: "Este mes",        days: 30  },
                        { label: "Últimos 3 meses", days: 90  },
                        { label: "Este año",        days: 365 },
                    ].map(q => (
                        <button key={q.days} className="btn-quick" onClick={() => {
                            const d = new Date(Date.now() - q.days * 86400000).toISOString().slice(0, 10);
                            setDesde(d);
                            setHasta(hoy);
                        }}>
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tarjeta del alumno seleccionado */}
            {alumno && (
                <div className="ra-alumno-card">
                    <div className="ra-alumno-avatar">
                        {alumno.nombres?.[0]}{alumno.apellidos?.[0]}
                    </div>
                    <div className="ra-alumno-info">
                        <h2>{alumno.apellidos}, {alumno.nombres}</h2>
                        <p>
                            DNI: <strong>{alumno.dni}</strong>
                            {alumno.curso_nombre && <> · Curso: <strong>{alumno.curso_nombre}</strong></>}
                            {alumno.grado && <> · Grado: <strong>{alumno.grado}</strong></>}
                        </p>
                    </div>
                    <div className="ra-pct-ring">
                        <svg viewBox="0 0 36 36" className="pct-svg">
                            <path className="pct-track"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="pct-fill"
                                strokeDasharray={`${stats.pct}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="pct-label">
                            <span className="pct-num">{stats.pct}%</span>
                            <span className="pct-sub">Asistencia</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats bar */}
            {alumno && !cargando && registros.length >= 0 && (
                <div className="ra-stats-bar">
                    {[
                        { key: "todos",       label: "Total",        val: stats.total,       cls: "stat-total" },
                        { key: "presente",    label: "Presentes",    val: stats.presente,    cls: "stat-presente" },
                        { key: "tarde",       label: "Tarde",        val: stats.tarde,       cls: "stat-tarde" },
                        { key: "ausente",     label: "Ausentes",     val: stats.ausente,     cls: "stat-ausente" },
                        { key: "justificado", label: "Justificados", val: stats.justificado, cls: "stat-just" },
                    ].map(s => (
                        <div
                            key={s.key}
                            className={`ra-stat-pill ${s.cls} ${filtroEstado === s.key ? "pill-active" : ""}`}
                            onClick={() => setFiltroEstado(s.key)}
                            title={`Filtrar por ${s.label}`}
                        >
                            <span className="stat-num">{s.val}</span>
                            <span className="stat-lbl">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabla de registros */}
            <div className="ra-table-card">
                {!alumno ? (
                    <div className="ra-empty">
                        <div className="ra-empty-icon">🔍</div>
                        <p>Busca un alumno para ver su historial de asistencias</p>
                    </div>
                ) : cargando ? (
                    <div className="ra-loading">
                        <div className="ra-spinner" />
                        <p>Cargando registros...</p>
                    </div>
                ) : error ? (
                    <div className="ra-empty">
                        <div className="ra-empty-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="btn-quick" style={{ marginTop: 12 }} onClick={handleFiltrar}>
                            Reintentar
                        </button>
                    </div>
                ) : registrosFiltrados.length === 0 ? (
                    <div className="ra-empty">
                        <div className="ra-empty-icon">📭</div>
                        <p>
                            {registros.length === 0
                                ? "Este alumno no tiene asistencias registradas aún"
                                : "No hay registros en el período seleccionado"}
                        </p>
                        {filtroEstado !== "todos" && (
                            <button
                                className="btn-quick"
                                style={{ marginTop: 12 }}
                                onClick={() => setFiltroEstado("todos")}
                            >
                                Ver todos los estados
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="ra-table-header">
                            <h3>
                                📋 Historial de asistencias
                                <span className="ra-periodo-badge">
                                    {fmtFecha(desde)} → {fmtFecha(hasta)}
                                </span>
                            </h3>
                            {filtroEstado !== "todos" && (
                                <span className="ra-filtro-activo">
                                    Filtrando: {ESTADOS[filtroEstado]?.label}
                                    <button onClick={() => setFiltroEstado("todos")}>✕</button>
                                </span>
                            )}
                        </div>
                        <div className="ra-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Fecha</th>
                                        <th>Curso</th>
                                        <th>Estado</th>
                                        <th>Hora Ingreso</th>
                                        <th>Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrosFiltrados.map((r, i) => {
                                        const est = ESTADOS[r.estado] || {};
                                        return (
                                            <tr key={r.id || i} className={`ra-row-${r.estado}`}>
                                                <td className="td-num">{i + 1}</td>
                                                <td className="td-fecha">{fmtFecha(r.fecha)}</td>
                                                <td className="td-curso">{r.curso_nombre || "—"}</td>
                                                <td>
                                                    <span
                                                        className="ra-badge"
                                                        style={{ background: est.bg, color: est.text }}
                                                    >
                                                        {est.label || r.estado}
                                                    </span>
                                                </td>
                                                <td className="td-hora">{fmtHora(r.hora_ingreso)}</td>
                                                <td className="td-nota">
                                                    {r.nota || <span className="sin-nota">—</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="ra-tfoot">
                                        <td colSpan={3}>
                                            <strong>Total: {registrosFiltrados.length} registros</strong>
                                        </td>
                                        <td colSpan={3}>
                                            P: {stats.presente} · T: {stats.tarde} · A: {stats.ausente} · J: {stats.justificado}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReporteAlumno;