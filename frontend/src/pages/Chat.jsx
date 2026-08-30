import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { api } from "../api/client";
import ResenaModal from "../components/ResenaModal";

const WS_URL = import.meta.env.VITE_WS_URL;

export default function Chat() {
  const { id } = useParams(); // id de la TradeRequest
  const { usuario } = useAuth();
  const [trade, setTrade] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [mostrarResena, setMostrarResena] = useState(false);
  const [resenaObligatoria, setResenaObligatoria] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    api.get(`/solicitudes/${id}/`).then(setTrade);
  }, [id]);

  useEffect(() => {
    if (!trade?.chat) return;
    const ws = new WebSocket(`${WS_URL}/chat/${trade.chat}/`);
    ws.onmessage = (e) => setMensajes((m) => [...m, JSON.parse(e.data)]);
    wsRef.current = ws;
    return () => ws.close();
  }, [trade?.chat]);

  function enviarMensaje(e) {
    e.preventDefault();
    if (!texto.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ contenido: texto }));
    setTexto("");
  }

  async function rechazar() {
    setTrade(await api.post(`/solicitudes/${id}/rechazar/`));
  }

  async function aceptarIntercambio() {
    setTrade(await api.post(`/solicitudes/${id}/aceptar-intercambio/`));
  }

  async function marcarRealizado() {
    const res = await api.post(`/solicitudes/${id}/realizado/`);
    setTrade(res.trade);
    setResenaObligatoria(true);
    setMostrarResena(true);
  }

  if (!trade) return <p>Cargando...</p>;

  const esReceptor = usuario?.username === trade.to_user;
  const puedeResponderInicial = esReceptor && trade.estado === "pendiente";
  const puedeMarcarRealizado = esReceptor && trade.estado === "en_proceso";

  return (
    <div className="card chat" style={{ maxWidth: 480, margin: "20px auto" }}>
      <p className="titulo">Chat de intercambio</p>
      <p className="subtitulo">Estado: {trade.estado.replace("_", " ")}</p>

      <div className="mensajes">
        {mensajes.map((m, i) => (
          <div key={i} className={m.autor === usuario?.username ? "mensaje mio" : "mensaje"}>
            <p>{m.contenido}</p>
          </div>
        ))}
      </div>

      <form onSubmit={enviarMensaje} className="fila">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje..." />
        <button type="submit">Enviar</button>
      </form>

      <div className="acciones-chat">
        {puedeResponderInicial && (
          <button className="btn-peligro" onClick={rechazar}>
            Rechazar
          </button>
        )}
        {trade.estado !== "en_proceso" && trade.estado !== "realizado" && (
          <button className="btn-primario" onClick={aceptarIntercambio}>
            Aceptar intercambio
          </button>
        )}
        {puedeMarcarRealizado && (
          <button className="btn-primario" onClick={marcarRealizado}>
            Intercambio realizado
          </button>
        )}
      </div>

      {mostrarResena && (
        <ResenaModal tradeId={trade.id} obligatoria={resenaObligatoria} onCerrar={() => setMostrarResena(false)} />
      )}
    </div>
  );
}
