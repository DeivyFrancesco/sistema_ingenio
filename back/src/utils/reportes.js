const pool = require("../db/connection");

/**
 * MOROSOS (sin depender de estado)
 */
const alumnosMorosos = async () => {
    const result = await pool.query(`
        SELECT
          a.id,
          a.nombres,
          a.apellidos,
          a.dni,
          a.telefono,
          COUNT(men.id) AS mensualidades_vencidas,
          SUM(men.monto) AS deuda_total
        FROM alumnos a
        JOIN matriculas m ON m.alumno_id = a.id
        JOIN mensualidades men ON men.matricula_id = m.id
        WHERE a.activo = true
          AND m.estado = 'ACTIVO'
          AND men.estado != 'PAGADO'
          AND men.fecha_vencimiento < CURRENT_DATE
        GROUP BY a.id, a.nombres, a.apellidos, a.dni, a.telefono
        ORDER BY mensualidades_vencidas DESC
    `);

    return result.rows;
};

/**
 * INGRESOS POR PERIODO
 */
const ingresosPorPeriodo = async (anio, mes = null) => {
    let query = `
        SELECT 
          TO_CHAR(p.fecha_pago, 'YYYY-MM') AS periodo,
          COUNT(p.id) AS total_pagos,
          SUM(p.monto) AS total_ingresos
        FROM pagos p
        WHERE EXTRACT(YEAR FROM p.fecha_pago) = $1
    `;

    const params = [anio];

    if (mes) {
        query += ` AND EXTRACT(MONTH FROM p.fecha_pago) = $2`;
        params.push(mes);
    }

    query += `
        GROUP BY TO_CHAR(p.fecha_pago, 'YYYY-MM')
        ORDER BY periodo DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * ESTADISTICAS GENERALES (🔥 CORREGIDO CON FECHAS)
 */
const estadisticasGenerales = async () => {
    const alumnos = await pool.query(`
        SELECT COUNT(*) FROM alumnos WHERE activo = true
    `);

    const cursos = await pool.query(`
        SELECT COUNT(*) FROM cursos
    `);

    const matriculasActivas = await pool.query(`
        SELECT COUNT(*) 
        FROM matriculas m
        JOIN alumnos a ON a.id = m.alumno_id
        WHERE m.estado = 'ACTIVO' AND a.activo = true
    `);

    const mensualidadesPendientes = await pool.query(`
        SELECT COUNT(*) 
        FROM mensualidades men
        JOIN matriculas m ON m.id = men.matricula_id
        JOIN alumnos a ON a.id = m.alumno_id
        WHERE a.activo = true
          AND m.estado = 'ACTIVO'
          AND men.estado != 'PAGADO'
          AND men.fecha_vencimiento >= CURRENT_DATE
    `);

    const mensualidadesVencidas = await pool.query(`
        SELECT COUNT(*) 
        FROM mensualidades men
        JOIN matriculas m ON m.id = men.matricula_id
        JOIN alumnos a ON a.id = m.alumno_id
        WHERE a.activo = true
          AND m.estado = 'ACTIVO'
          AND men.estado != 'PAGADO'
          AND men.fecha_vencimiento < CURRENT_DATE
    `);

    const ingresosDelMes = await pool.query(`
        SELECT COALESCE(SUM(monto), 0) 
        FROM pagos 
        WHERE EXTRACT(MONTH FROM fecha_pago) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    return {
        total_alumnos: parseInt(alumnos.rows[0].count),
        total_cursos: parseInt(cursos.rows[0].count),
        matriculas_activas: parseInt(matriculasActivas.rows[0].count),
        mensualidades_pendientes: parseInt(mensualidadesPendientes.rows[0].count),
        mensualidades_vencidas: parseInt(mensualidadesVencidas.rows[0].count),
        ingresos_mes_actual: parseFloat(ingresosDelMes.rows[0].coalesce),
    };
};

/**
 * DASHBOARD (🔥 ADAPTADO A TU FRONTEND)
 */
const dashboardResumen = async () => {
    const stats = await estadisticasGenerales();
    const morosos = await alumnosMorosos();

    return {
        ...stats,
        alumnos_morosos: morosos.length
    };
};

module.exports = {
    alumnosMorosos,
    ingresosPorPeriodo,
    estadisticasGenerales,
    dashboardResumen,
};