import { useState } from "react";
import { register } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError("❌ Las contraseñas no coinciden");
    }

    if (form.password.length < 6) {
      return setError("❌ La contraseña debe tener al menos 6 caracteres");
    }

    try {
      setLoading(true);
      await register({
        username: form.username,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("❌ Error al registrar usuario. El usuario puede ya existir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>📝 Registro</h1>
          <p>Crea tu cuenta para comenzar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              name="username"
              placeholder="Ingresa tu usuario"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
