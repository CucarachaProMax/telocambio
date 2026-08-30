import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";

export default function NavBar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  async function salir() {
    await logout();
    navigate("/login");
  }

  function buscar(e) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(busqueda)}`);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="marca">
        🧸 Trueke
      </Link>

      <form onSubmit={buscar} className="navbar-buscador">
        <input
          placeholder="Buscar Labubu, figura, carta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      <div className="navbar-acciones">
        {usuario ? (
          <>
            <Link to="/subir">Subir item</Link>
            <Link to="/mensajes">Mensajes</Link>
            <Link to={`/perfil/${usuario.username}`}>{usuario.username}</Link>
            <button onClick={salir}>Salir</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}
