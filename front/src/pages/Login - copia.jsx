import { useState } from "react";
import { login } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setIsAuth }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);

      setIsAuth(true);          // 🔥 CLAVE
      navigate("/alumnos");     // redirección inmediata
    } catch (err) {
      setError("❌ Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>🔐 Iniciar Sesión</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Ingresar</button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;
