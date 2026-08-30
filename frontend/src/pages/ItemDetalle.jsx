import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { api } from "../api/client";

export default function ItemDetalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [misItems, setMisItems] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [error, setError] = useState("");
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/items/${id}/`).then(setItem);
  }, [id]);

  async function abrirSelector() {
    setError("");
    const propios = await api.get(`/items/?disponible=1`);
    const lista = (propios.results ?? propios).filter((i) => i.dueno === usuario?.username);
    setMisItems(lista);
    setMostrarSelector(true);
  }

  function toggleSeleccion(itemId) {
    setSeleccionados((s) => (s.includes(itemId) ? s.filter((i) => i !== itemId) : [...s, itemId]));
  }

  async function enviarSolicitud() {
    if (seleccionados.length === 0) {
      setError("Elige al menos un item tuyo para ofrecer.");
      return;
    }
    try {
      const solicitud = await api.post("/solicitudes/", {
        items_ofrecidos: seleccionados,
        items_pedidos: [item.id],
      });
      navigate(`/chats/${solicitud.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!item) return <p>Cargando...</p>;

  const esMio = item.dueno === usuario?.username;

  return (
    <div className="card" style={{ maxWidth: 480, margin: "20px auto" }}>
      <div className="foto-placeholder foto-grande">
        {item.fotos?.[0] ? <img src={item.fotos[0].imagen} alt={item.nombre} /> : "🖼️"}
      </div>
      <h2>{item.nombre}</h2>
      <p className="subtitulo">
        {item.categoria_nombre} · {item.subcategoria_nombre} · de {item.dueno} ({item.ciudad_efectiva})
      </p>
      <p>{item.descripcion}</p>
      <div className="chips">
        {item.etiquetas?.map((et) => (
          <span key={et} className="chip">
            {et}
          </span>
        ))}
      </div>

      {!esMio && !mostrarSelector && (
        <button className="btn-primario" onClick={abrirSelector}>
          Proponer intercambio
        </button>
      )}

      {mostrarSelector && (
        <div className="selector-items">
          <p>Elige qué le ofreces a cambio:</p>
          {misItems.length === 0 && <p>No tienes items disponibles subidos todavía.</p>}
          {misItems.map((mi) => (
            <label key={mi.id} className="fila-seleccionable">
              <input
                type="checkbox"
                checked={seleccionados.includes(mi.id)}
                onChange={() => toggleSeleccion(mi.id)}
              />
              {mi.nombre}
            </label>
          ))}
          {error && <p className="error">{error}</p>}
          <button className="btn-primario" onClick={enviarSolicitud}>
            Enviar solicitud
          </button>
        </div>
      )}
    </div>
  );
}
