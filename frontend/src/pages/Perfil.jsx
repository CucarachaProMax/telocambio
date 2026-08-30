import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function Perfil() {
  const { username } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/usuarios/${username}/`).then(setPerfil);
    api.get(`/usuarios/${username}/resenas/`).then((data) => setResenas(data.results ?? data));
    api.get(`/items/?dueno=${username}&disponible=0`).then((data) => setItems(data.results ?? data));
  }, [username]);

  if (!perfil) return <p>Cargando...</p>;

  return (
    <div style={{ maxWidth: 620, margin: "20px auto" }}>
      <div className="card">
        <div className="fila cabecera-perfil">
          <div className="avatar">{perfil.username.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="titulo">{perfil.username}</p>
            <p className="subtitulo">
              ★ {perfil.valoracion_media ?? "Sin valoraciones todavía"}
              {perfil.ciudad && ` · ${perfil.ciudad}`}
            </p>
          </div>
        </div>

        <p className="subtitulo" style={{ marginTop: 16 }}>
          Reseñas
        </p>
        {resenas.length === 0 && <p>Todavía no tiene reseñas.</p>}
        {resenas.map((r) => (
          <div key={r.id} className="resena">
            <div className="fila">
              <strong>{r.autor}</strong>
              <span>★ {r.estrellas.toFixed(1)}</span>
            </div>
            {r.comentario && <p className="subtitulo">{r.comentario}</p>}
            <div className="chips">
              {r.etiquetas.map((e) => (
                <span key={e} className="chip">
                  {e}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="titulo" style={{ margin: "20px 0 10px" }}>
        Items de {perfil.username}
      </p>
      {items.length === 0 && <p className="subtitulo">Todavía no ha subido ningún item.</p>}
      <div className="grid-items">
        {items.map((item) => (
          <Link to={`/items/${item.id}`} key={item.id} className="tarjeta-item">
            <div className="foto-placeholder">
              {item.fotos?.[0] ? <img src={item.fotos[0].imagen} alt={item.nombre} /> : "🖼️"}
            </div>
            <div className="tarjeta-body">
              <p className="titulo">{item.nombre}</p>
              <span className={`estado estado-${item.estado}`}>{item.estado}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
