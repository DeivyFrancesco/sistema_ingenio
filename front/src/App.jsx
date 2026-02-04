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

  return (
    <Router>
      <div className="app-layout">
        {isAuth && (
          <>
            {/* BOTÓN MOBILE */}
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <h2 className="logo">🎓 Ingenio</h2>

              <nav className="menu">
                <NavLink to="/alumnos" className="menu-link" onClick={() => setSidebarOpen(false)}>👨‍🎓 Alumnos</NavLink>
                <NavLink to="/apoderados" className="menu-link" onClick={() => setSidebarOpen(false)}>👨‍👩‍👧 Apoderados</NavLink>
                <NavLink to="/cursos" className="menu-link" onClick={() => setSidebarOpen(false)}>📘 Cursos</NavLink>
                <NavLink to="/matriculas" className="menu-link" onClick={() => setSidebarOpen(false)}>📝 Matrículas</NavLink>
                <NavLink to="/mensualidades" className="menu-link" onClick={() => setSidebarOpen(false)}>📆 Mensualidades</NavLink>
                <NavLink to="/pagos" className="menu-link" onClick={() => setSidebarOpen(false)}>💰 Pagos</NavLink>
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
          </>
        )}

        <main className="content">
          <Routes>
            <Route
              path="/login"
              element={
                isAuth ? <Navigate to="/alumnos" /> : <Login setIsAuth={setIsAuth} />
              }
            />
            <Route
              path="/register"
              element={isAuth ? <Navigate to="/alumnos" /> : <Register />}
            />

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
