const pool = require("../db/connection");

/**
 * OBTENER ALUMNOS MOROSOS
 */
const alumnosMorosos = async() => {
    const result = await pool.query(`
    SELECT DISTINCT
      a.id,
      a.nombres,
      a.apellidos,
      a.dni,
      a.telefono,
      COUNT(men.id) AS mensualidades_vencidas,
      SUM(c.precio_base) AS deuda_total
    FROM alumnos a
    JOIN matriculas m ON m.alumno_id = a.id
    JOIN cursos c ON c.id = m.curso_id
    JOIN mensualidades men ON men.matricula_id = m.id
    WHERE men.estado = 'VENCIDO'
    GROUP BY a.id, a.nombres, a.apellidos, a.dni, a.telefono
    ORDER BY mensualidades_vencidas DESC
  `);

    return result.rows;
};

/**
 * INGRESOS POR MES/AÑO
 */
const ingresosPorPeriodo = async(anio, mes = null) => {
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
 * ESTADÍSTICAS GENERALES
 */
const estadisticasGenerales = async() => {
    const alumnos = await pool.query("SELECT COUNT(*) as total FROM alumnos");
    const cursos = await pool.query("SELECT COUNT(*) as total FROM cursos");
    const matriculasActivas = await pool.query(
        "SELECT COUNT(*) as total FROM matriculas WHERE estado = 'ACTIVO'"
    );
    const mensualidadesPendientes = await pool.query(
        "SELECT COUNT(*) as total FROM mensualidades WHERE estado = 'PENDIENTE'"
    );
    const mensualidadesVencidas = await pool.query(
        "SELECT COUNT(*) as total FROM mensualidades WHERE estado = 'VENCIDO'"
    );
    const ingresosDelMes = await pool.query(
        `SELECT COALESCE(SUM(monto), 0) as total 
     FROM pagos 
     WHERE EXTRACT(MONTH FROM fecha_pago) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    return {
        total_alumnos: parseInt(alumnos.rows[0].total),
        total_cursos: parseInt(cursos.rows[0].total),
        matriculas_activas: parseInt(matriculasActivas.rows[0].total),
        mensualidades_pendientes: parseInt(mensualidadesPendientes.rows[0].total),
        mensualidades_vencidas: parseInt(mensualidadesVencidas.rows[0].total),
        ingresos_mes_actual: parseFloat(ingresosDelMes.rows[0].total),
    };
};

module.exports = {
    alumnosMorosos,
    ingresosPorPeriodo,
    estadisticasGenerales,
};