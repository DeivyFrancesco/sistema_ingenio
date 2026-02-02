import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Alumnos from "./pages/Alumnos";
import Apoderados from "./pages/Apoderados";
import Cursos from "./pages/Cursos";
import Pagos from "./pages/Pagos";
import Matriculas from "./pages/Matriculas";
import Mensualidades from "./pages/Mensualidades";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="logo">🎓 Ingenio</h2>

          <nav className="menu">
            <NavLink to="/alumnos" className="menu-link">
              👨‍🎓 Alumnos
            </NavLink>
            <NavLink to="/apoderados" className="menu-link">
              👨‍👩‍👧 Apoderados
            </NavLink>
            <NavLink to="/cursos" className="menu-link">
              📘 Cursos
            </NavLink>
            <NavLink to="/matriculas" className="menu-link">
              📝 Matrículas
            </NavLink>
            <NavLink to="/mensualidades" className="menu-link">
              📆 Mensualidades
            </NavLink>
            <NavLink to="/pagos" className="menu-link">
              💰 Pagos
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Alumnos />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/apoderados" element={<Apoderados />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/mensualidades" element={<Mensualidades />} />
            <Route path="/pagos" element={<Pagos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;