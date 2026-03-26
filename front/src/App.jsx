import {
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

/* PÁGINAS */
import Alumnos from "./pages/Alumnos";
import Apoderados from "./pages/Apoderados";
import Cursos from "./pages/Cursos";
import Pagos from "./pages/Pagos";
import Matriculas from "./pages/Matriculas";
import Mensualidades from "./pages/Mensualidades";
import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
  const [isAuth, setIsAuth] = useState(
    !!localStorage.getItem("token")
  );

  const rol = getRol(); // 👈 aquí está la magia

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      {isAuth && (
        <aside className="sidebar">
          <h2 className="logo">🎓 Ingenio</h2>

          <nav className="menu">
            <NavLink to="/alumnos" className="menu-link">👨‍🎓 Alumnos</NavLink>
            <NavLink to="/apoderados" className="menu-link">👨‍👩‍👧 Apoderados</NavLink>
            <NavLink to="/cursos" className="menu-link">📘 Cursos</NavLink>
            <NavLink to="/matriculas" className="menu-link">📝 Matrículas</NavLink>

            {/* 🔒 SOLO ADMIN */}
            {rol === "admin" && (
              <>
                <NavLink to="/mensualidades" className="menu-link">📆 Mensualidades</NavLink>
                <NavLink to="/pagos" className="menu-link">💰 Pagos</NavLink>
                <NavLink to="/usuarios" className="menu-link">👥 Usuarios</NavLink>
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

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isAuth ? <Navigate to="/alumnos" /> : <Login setIsAuth={setIsAuth} />
            }
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={
              isAuth ? <Navigate to="/alumnos" /> : <Register />
            }
          />

          {/* PRIVADAS */}
          {isAuth ? (
            <>
              <Route path="/" element={<Navigate to="/alumnos" />} />
              <Route path="/alumnos" element={<Alumnos />} />
              <Route path="/apoderados" element={<Apoderados />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/matriculas" element={<Matriculas />} />

              {/* 🔒 SOLO ADMIN */}
              {rol === "admin" && (
                <>
                  <Route path="/mensualidades" element={<Mensualidades />} />
                  <Route path="/pagos" element={<Pagos />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                </>
              )}
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