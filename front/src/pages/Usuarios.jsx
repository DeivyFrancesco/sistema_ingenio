import { useEffect, useState } from "react";
import api from "../api/api";
import "./Usuarios.css";

const ROLES = ["admin", "secretaria", "profesor"];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mensaje,  setMensaje]  = useState(null);

  /* form nuevo usuario */
  const [form, setForm] = useState({ username: "", password: "", rol: "secretaria" });
  const [mostrarForm, setMostrarForm] = useState(false);

  /* edición inline */
  const [editId,   setEditId]   = useState(null);
  const [editData, setEditData] = useState({ rol: "", estado: true, password: "" });

  /* usuario logueado (para no dejarlo eliminarse) */
  const payload = (() => {
    try {
      const t = localStorage.getItem("token");
      return JSON.parse(atob(t.split(".")[1]));
    } catch { return {}; }
  })();

  const mostrar = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch {
      mostrar("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /* ── CREAR ── */
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await api.post("/usuarios", form);
      mostrar("Usuario creado correctamente");
      setForm({ username: "", password: "", rol: "secretaria" });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      mostrar(err.response?.data?.message || "Error al crear usuario", "error");
    }
  };

  /* ── GUARDAR EDICIÓN ── */
  const handleGuardar = async (id) => {
    try {
      await api.put(`/usuarios/${id}`, editData);
      mostrar("Usuario actualizado correctamente");
      setEditId(null);
      cargar();
    } catch {
      mostrar("Error al actualizar usuario", "error");
    }
  };

  /* ── ELIMINAR ── */
  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      mostrar("Usuario eliminado");
      cargar();
    } catch (err) {
      mostrar(err.response?.data?.message || "Error al eliminar", "error");
    }
  };

  const rolColor = (rol) => {
    if (rol === "admin")      return "badge-admin";
    if (rol === "secretaria") return "badge-secretaria";
    if (rol === "profesor")   return "badge-profesor";
    return "badge-default";
  };

  return (
    <div className="usu-page">

      {/* HEADER */}
      <div className="usu-header">
        <div className="usu-header-left">
          <span className="usu-header-icon">👥</span>
          <div>
            <h1>Gestión de Usuarios</h1>
            <p className="usu-sub">
              {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button className="usu-btn-nuevo" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "✕ Cancelar" : "+ Nuevo Usuario"}
        </button>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className={`usu-mensaje usu-mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {/* FORM NUEVO USUARIO */}
      {mostrarForm && (
        <div className="usu-form-card">
          <h2 className="usu-form-titulo">➕ Crear Nuevo Usuario</h2>
          <form onSubmit={handleCrear} className="usu-form-grid">
            <div className="usu-field">
              <label>Usuario *</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Nombre de usuario"
                required
              />
            </div>
            <div className="usu-field">
              <label>Contraseña *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Contraseña"
                required
              />
            </div>
            <div className="usu-field">
              <label>Rol *</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="usu-field usu-field-action">
              <button type="submit" className="usu-btn-guardar">💾 Crear Usuario</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA */}
      {loading ? (
        <div className="usu-loading">
          <div className="usu-spinner" />
          <span>Cargando usuarios…</span>
        </div>
      ) : (
        <div className="usu-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={6} className="usu-empty">Sin usuarios registrados</td></tr>
              ) : (
                usuarios.map((u, i) => (
                  <tr key={u.id} className={u.id === payload.id ? "usu-row-yo" : ""}>
                    <td className="usu-num">{i + 1}</td>
                    <td className="usu-username">
                      {u.username}
                      {u.id === payload.id && <span className="usu-yo-tag"> (tú)</span>}
                    </td>

                    {editId === u.id ? (
                      <>
                        <td>
                          <select
                            className="usu-select-inline"
                            value={editData.rol}
                            onChange={(e) => setEditData({ ...editData, rol: e.target.value })}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="usu-select-inline"
                            value={editData.estado}
                            onChange={(e) => setEditData({ ...editData, estado: e.target.value === "true" })}
                          >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="usu-input-inline"
                            type="password"
                            placeholder="Nueva contraseña (opcional)"
                            value={editData.password}
                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                          />
                        </td>
                        <td>
                          <div className="usu-acciones">
                            <button className="usu-btn-ok"     onClick={() => handleGuardar(u.id)}>✓ Guardar</button>
                            <button className="usu-btn-cancel" onClick={() => setEditId(null)}>✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><span className={`usu-badge ${rolColor(u.rol)}`}>{u.rol}</span></td>
                        <td>
                          <span className={`usu-estado ${u.estado ? "estado-activo" : "estado-inactivo"}`}>
                            {u.estado ? "● Activo" : "● Inactivo"}
                          </span>
                        </td>
                        <td className="usu-fecha">
                          {new Date(u.creado_en).toLocaleDateString("es-PE", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        <td>
                          <div className="usu-acciones">
                            <button
                              className="usu-btn-editar"
                              onClick={() => {
                                setEditId(u.id);
                                setEditData({ rol: u.rol, estado: u.estado, password: "" });
                              }}
                            >✏️ Editar</button>
                            {u.id !== payload.id && (
                              <button className="usu-btn-eliminar" onClick={() => handleEliminar(u.id)}>
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
