import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import SelectorMapa from "../components/SelectorMapa";

export default function Login() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    ciudad: "",
    lat: null,
    lng: null,
  });
  const [error, setError] = useState("");
  const { login, registrar } = useAuth();
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError("");
    try {
      if (tab === "login") {
        await login(form.username, form.password);
      } else {
        if (!form.lat) {
          setError("Elige tu ubicación aproximada en el mapa.");
          return;
        }
        await registrar({
          username: form.username,
          email: form.email,
          password: form.password,
          ciudad: form.ciudad,
          latitud: form.lat,
          longitud: form.lng,
        });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360, margin: "40px auto" }}>
      <div className="tabs">
        <button className={tab === "login" ? "tab activa" : "tab"} onClick={() => setTab("login")}>
          Entrar
        </button>
        <button className={tab === "signup" ? "tab activa" : "tab"} onClick={() => setTab("signup")}>
          Crear cuenta
        </button>
      </div>

      <form onSubmit={enviar}>
        {tab === "signup" && (
          <>
            <label>Nombre de usuario</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </>
        )}

        {tab === "login" && (
          <>
            <label>Usuario</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </>
        )}

        <label>Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {tab === "signup" && (
          <>
            <label>Tu ubicación aproximada</label>
            <SelectorMapa
              lat={form.lat}
              lng={form.lng}
              pedirAlAbrir
              onSeleccionar={({ lat, lng, ciudad }) => setForm({ ...form, lat, lng, ciudad })}
            />
            {form.ciudad && <p className="subtitulo" style={{ margin: "6px 0 12px" }}>📍 {form.ciudad}</p>}
          </>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primario">
          {tab === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
