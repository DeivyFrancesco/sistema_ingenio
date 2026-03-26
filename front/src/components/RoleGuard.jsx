/**
 * RoleGuard.jsx
 * Protege rutas del frontend según el rol del JWT en localStorage.
 *
 * Uso en App.jsx:
 *   <RoleGuard roles={["admin"]}>
 *     <Mensualidades />
 *   </RoleGuard>
 */
import { Navigate } from "react-router-dom";

const getRolFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]))?.rol ?? null;
  } catch {
    return null;
  }
};

const RoleGuard = ({ roles = [], children }) => {
  const rol = getRolFromToken();

  if (!rol) return <Navigate to="/login" replace />;

  if (!roles.includes(rol)) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "60vh", gap: "12px", textAlign: "center",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        <span style={{ fontSize: "48px" }}>🚫</span>
        <h2 style={{ margin: 0, color: "#111827", fontSize: "22px" }}>
          Acceso restringido
        </h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          No tienes permisos para ver esta sección.<br />
          Contacta al administrador si crees que es un error.
        </p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
