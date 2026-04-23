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
import Register          from "./pages/Register";
import Asistencias       from "./pages/Asistencias";
import ReporteAsistencia from "./pages/ReporteAsistencia";
import Prospectos        from "./pages/Prospectos";
import Reportes          from "./pages/Reportes";   // 🆕

/* LANDING PAGE */
import ZtrilceAcademy    from "./pages/ZtrilceAcademy";

import "./App.css";

/* Obtener rol del token */
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

  const home = rol === "visitante" ? "/reporte-asistencia" : "/alumnos";

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      {isAuth && (
        <aside className="sidebar">

          {/* Logo */}
          <div className="sidebar-logo-area">
            <div className="logo">
              <div className="logo-icon">🎓</div>
              <span className="logo-text">Ingenio</span>
            </div>
            <span className="logo-sub">Sistema de Gestión</span>

            {rol && (
              <div className="rol-badge" style={{ marginTop: 14 }}>
                {rol === "admin"
                  ? "👑 Administrador"
                  : rol === "visitante"
                  ? "👁️ Visitante"
                  : "👤 Usuario"}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="menu">
            {rol === "visitante" ? (
              <NavLink to="/reporte-asistencia" className="menu-link">
                📊 Reporte Asistencia
              </NavLink>
            ) : (
              <>
                <span className="menu-section-label">Principal</span>
                <NavLink to="/alumnos"    className="menu-link">👨‍🎓 Alumnos</NavLink>
                <NavLink to="/apoderados" className="menu-link">👨‍👩‍👧 Apoderados</NavLink>
                <NavLink to="/cursos"     className="menu-link">📘 Cursos</NavLink>
                <NavLink to="/matriculas" className="menu-link">📝 Matrículas</NavLink>
                <NavLink to="/prospectos" className="menu-link">🌟 Prospectos</NavLink>

                {rol === "admin" && (
                  <>
                    <div className="menu-divider" />
                    <span className="menu-section-label">Administración</span>
                    <NavLink to="/asistencias"        className="menu-link">📋 Asistencias</NavLink>
                    <NavLink to="/reporte-asistencia" className="menu-link">📊 Reporte Asistencia</NavLink>
                    <NavLink to="/mensualidades"      className="menu-link">📆 Mensualidades</NavLink>
                    <NavLink to="/pagos"              className="menu-link">💰 Pagos</NavLink>
                    <NavLink to="/reportes"           className="menu-link">📈 Reportes</NavLink>
                    <NavLink to="/usuarios"           className="menu-link">👥 Usuarios</NavLink>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Footer / Logout */}
          <div className="sidebar-footer">
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                setIsAuth(false);
              }}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </aside>
      )}

      {/* CONTENIDO */}
      <main className="content">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route
            path="/"
            element={
              isAuth
                ? <Navigate to={home} />
                : <ZtrilceAcademy setIsAuth={setIsAuth} />
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route
            path="/register"
            element={isAuth ? <Navigate to={home} /> : <Register />}
          />

          {/* RUTAS PRIVADAS */}
          {isAuth ? (
            <>
              <Route path="/reporte-asistencia" element={<ReporteAsistencia />} />

              {rol !== "visitante" && (
                <>
                  <Route path="/alumnos"    element={<Alumnos />} />
                  <Route path="/apoderados" element={<Apoderados />} />
                  <Route path="/cursos"     element={<Cursos />} />
                  <Route path="/matriculas" element={<Matriculas />} />
                  <Route path="/prospectos" element={<Prospectos />} />

                  {rol === "admin" && (
                    <>
                      <Route path="/asistencias"   element={<Asistencias />} />
                      <Route path="/mensualidades" element={<Mensualidades />} />
                      <Route path="/pagos"         element={<Pagos />} />
                      <Route path="/reportes"      element={<Reportes />} />  {/* 🆕 */}
                      <Route path="/usuarios"      element={<Usuarios />} />
                    </>
                  )}
                </>
              )}

              <Route path="/reporte-alumno" element={<Navigate to="/reporte-asistencia" />} />
              <Route path="*" element={<Navigate to={home} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
