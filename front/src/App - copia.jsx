import {
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

/* PÁGINAS */
import Alumnos           from "./pages/Alumnos";
import Apoderados        from "./pages/Apoderados";
import Cursos            from "./pages/Cursos";
import Pagos             from "./pages/Pagos";
import Matriculas        from "./pages/Matriculas";
import Mensualidades     from "./pages/Mensualidades";
import Usuarios          from "./pages/Usuarios";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Asistencias       from "./pages/Asistencias";
import ReporteAsistencia from "./pages/ReporteAsistencia";
import Reportes          from "./pages/Reportes";
import Prospectos        from "./pages/Prospectos";

import "./App.css";

/* 🔹 Obtener rol del token */
const getRol = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).rol;
  } catch {
    return null;
  }
};

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const rol = getRol();

  // 👇 AGREGADO: home según rol
  const home = rol === "visitante" ? "/reporte-asistencia" : "/alumnos";

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      {isAuth && (
        <aside className="sidebar">
          <h2 className="logo">🎓 Ingenio</h2>

          {/* Badge de rol */}
          {rol && (
            <p className="rol-badge">
              {rol === "admin"      ? "👑 Administrador"
             : rol === "visitante" ? "👁️ Visitante"
             : "👤 Usuario"}
            </p>
          )}

          <nav className="menu">

            {/* 👇 AGREGADO: visitante solo ve reporte */}
            {rol === "visitante" ? (
              <NavLink to="/reporte-asistencia" className="menu-link">📊 Reporte Asistencia</NavLink>
            ) : (
              <>
                <NavLink to="/alumnos"    className="menu-link">👨‍🎓 Alumnos</NavLink>
                <NavLink to="/apoderados" className="menu-link">👨‍👩‍👧 Apoderados</NavLink>
                <NavLink to="/cursos"     className="menu-link">📘 Cursos</NavLink>
                <NavLink to="/matriculas" className="menu-link">📝 Matrículas</NavLink>
                <NavLink to="/reportes"   className="menu-link">📊 Reportes</NavLink>
                <NavLink to="/prospectos" className="menu-link">🌟 Prospectos</NavLink>

                {/* 🔒 SOLO ADMIN */}
                {rol === "admin" && (
                  <>
                    <div className="menu-divider" />
                    <NavLink to="/asistencias"        className="menu-link">📋 Asistencias</NavLink>
                    <NavLink to="/reporte-asistencia" className="menu-link">📊 Reporte Asistencia</NavLink>
                    <NavLink to="/mensualidades"      className="menu-link">📆 Mensualidades</NavLink>
                    <NavLink to="/pagos"              className="menu-link">💰 Pagos</NavLink>
                    <NavLink to="/usuarios"           className="menu-link">👥 Usuarios</NavLink>
                  </>
                )}
              </>
            )}
          </nav>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setIsAuth(false);
            }}
          >
            🚪 Cerrar sesión
          </button>
        </aside>
      )}

      {/* CONTENIDO */}
      <main className="content">
        <Routes>
          {/* PÚBLICAS */}
          <Route path="/login"    element={isAuth ? <Navigate to={home} /> : <Login setIsAuth={setIsAuth} />} />
          <Route path="/register" element={isAuth ? <Navigate to={home} /> : <Register />} />

          {/* PRIVADAS */}
          {isAuth ? (
            <>
              <Route path="/" element={<Navigate to={home} />} />

              {/* 👇 AGREGADO: ruta reporte accesible para todos los roles */}
              <Route path="/reporte-asistencia" element={<ReporteAsistencia />} />
              <Route path="/reportes" element={<Reportes />} />

              {/* Solo no-visitantes ven el resto */}
              {rol !== "visitante" && (
                <>
                  <Route path="/alumnos"    element={<Alumnos />} />
                  <Route path="/apoderados" element={<Apoderados />} />
                  <Route path="/cursos"     element={<Cursos />} />
                  <Route path="/matriculas" element={<Matriculas />} />
                  <Route path="/prospectos" element={<Prospectos />} />

                  {/* 🔒 SOLO ADMIN */}
                  {rol === "admin" && (
                    <>
                      <Route path="/asistencias"        element={<Asistencias />} />
                      <Route path="/mensualidades"      element={<Mensualidades />} />
                      <Route path="/pagos"              element={<Pagos />} />
                      <Route path="/usuarios"           element={<Usuarios />} />
                    </>
                  )}
                </>
              )}

              {/* Ruta antigua por si alguien tiene guardada la URL */}
              <Route path="/reporte-alumno" element={<Navigate to="/reporte-asistencia" />} />

              {/* 👇 AGREGADO: cualquier ruta inválida → home del rol */}
              <Route path="*" element={<Navigate to={home} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
