import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { api } from "../api/client";

export default function Mensajes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    api
      .get("/solicitudes/")
      .then((data) => setSolicitudes(data.results ?? data))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="card" style={{ maxWidth: 520, margin: "20px auto" }}>
      <p className="titulo">Mensajes</p>

      {cargando && <p className="subtitulo">Cargando...</p>}
      {!cargando && solicitudes.length === 0 && (
        <p className="subtitulo">Todavía no tienes ninguna conversación. Propón un intercambio desde un item para empezar una.</p>
      )}

      {solicitudes.map((s) => {
        const otro = s.from_user === usuario?.username ? s.to_user : s.from_user;
        return (
          <Link key={s.id} to={`/chats/${s.id}`} className="fila-chat">
            <div className="avatar" style={{ width: 42, height: 42, fontSize: 14 }}>
              {otro.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p className="titulo" style={{ fontSize: 15, margin: 0 }}>
                {otro}
              </p>
              <p className="subtitulo" style={{ margin: 0 }}>
                {s.estado.replace("_", " ")}
              </p>
            </div>
            <span className={`estado estado-chat-${s.estado}`}>{s.estado.replace("_", " ")}</span>
          </Link>
        );
      })}
    </div>
  );
}
