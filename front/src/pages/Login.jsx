import { useState } from "react";
import { login } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = ({ setIsAuth }) => {
  const [form, setForm] = useState({ username: "", password: "" });
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
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      const token =
        res.data.token ||
        res.data.access_token ||
        res.data.accessToken ||
        res.data.jwt;

      if (!token) {
        setError("No se recibió token del servidor");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      setIsAuth(true);
      navigate("/alumnos");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
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

        <h2 className="auth-heading">Iniciar Sesión</h2>

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
                placeholder="Ingresa tu usuario"
                value={form.username}
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
                placeholder="Ingresa tu contraseña"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Ingresar"}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
