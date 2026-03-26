import { useState } from "react";
import { register } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }
    setLoading(true);
    try {
      await register({ username: form.username, password: form.password });
      navigate("/login");
    } catch (err) {
      setError("Error al registrar. El usuario ya existe o hubo un problema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title">Ingenio</h1>
          <p className="auth-subtitle">Sistema de Gestión Académica</p>
        </div>

        <h2 className="auth-heading">Crear Cuenta</h2>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Usuario</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                className="auth-input"
                name="username"
                placeholder="Elige un nombre de usuario"
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Crea una contraseña"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirmar Contraseña</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                name="confirmPassword"
                type={showPass ? "text" : "password"}
                placeholder="Repite la contraseña"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
