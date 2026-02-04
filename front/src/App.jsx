import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import Alumnos from "./pages/Alumnos";
import Apoderados from "./pages/Apoderados";
import Cursos from "./pages/Cursos";
import Pagos from "./pages/Pagos";
import Matriculas from "./pages/Matriculas";
import Mensualidades from "./pages/Mensualidades";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para cerrar el sidebar al hacer click en un enlace (móvil)
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <Router>
      <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
        {isAuth && (
          <>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>

            {/* Overlay para cerrar el sidebar en móvil */}
            {sidebarOpen && (
              <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            <aside className="sidebar">
              <h2 className="logo">🎓</h2>

              <nav className="menu">
                <NavLink to="/alumnos" className="menu-link" onClick={closeSidebar}>
                  👨‍🎓 <span>Alumnos</span>
                </NavLink>
                <NavLink to="/apoderados" className="menu-link" onClick={closeSidebar}>
                  👨‍👩‍👧 <span>Apoderados</span>
                </NavLink>
                <NavLink to="/cursos" className="menu-link" onClick={closeSidebar}>
                  📘 <span>Cursos</span>
                </NavLink>
                <NavLink to="/matriculas" className="menu-link" onClick={closeSidebar}>
                  📝 <span>Matrículas</span>
                </NavLink>
                <NavLink to="/mensualidades" className="menu-link" onClick={closeSidebar}>
                  📆 <span>Mensualidades</span>
                </NavLink>
                <NavLink to="/pagos" className="menu-link" onClick={closeSidebar}>
                  💰 <span>Pagos</span>
                </NavLink>
              </nav>

              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsAuth(false);
                }}
              >
                🚪 <span>Cerrar sesión</span>
              </button>
            </aside>
          </>
        )}

        <main className="content">
          <Routes>
            <Route path="/login" element={isAuth ? <Navigate to="/alumnos" /> : <Login setIsAuth={setIsAuth} />} />
            <Route path="/register" element={isAuth ? <Navigate to="/alumnos" /> : <Register />} />

            {isAuth ? (
              <>
                <Route path="/" element={<Navigate to="/alumnos" />} />
                <Route path="/alumnos" element={<Alumnos />} />
                <Route path="/apoderados" element={<Apoderados />} />
                <Route path="/cursos" element={<Cursos />} />
                <Route path="/matriculas" element={<Matriculas />} />
                <Route path="/mensualidades" element={<Mensualidades />} />
                <Route path="/pagos" element={<Pagos />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
