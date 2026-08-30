import { useState } from "react";
import { api } from "../api/client";

const ETIQUETAS = ["Puntual", "Serio", "Buena comunicación", "Item tal cual se describía"];

export default function ResenaModal({ tradeId, obligatoria, onCerrar }) {
  const [estrellas, setEstrellas] = useState(0);
  const [tags, setTags] = useState([]);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");

  function toggleTag(t) {
    setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  }

  async function publicar() {
    if (estrellas === 0) {
      setError("Elige una valoración primero");
      return;
    }
    try {
      await api.post("/resenas/", {
        trade_request: tradeId,
        estrellas,
        etiquetas: tags,
        comentario,
      });
      onCerrar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-fondo">
      <div className="modal card">
        <p className="titulo">Valora tu intercambio</p>
        {obligatoria && <p className="subtitulo">Tienes que valorarlo antes de continuar</p>}

        <div className="estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={n <= estrellas ? "estrella activa" : "estrella"}
              onClick={() => setEstrellas(n)}
            >
              ★
            </span>
          ))}
        </div>

        <div className="chips">
          {ETIQUETAS.map((t) => (
            <span key={t} className={tags.includes(t) ? "chip activa" : "chip"} onClick={() => toggleTag(t)}>
              {t}
            </span>
          ))}
        </div>

        <textarea
          placeholder="Comentario (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn-primario" onClick={publicar}>
          Publicar reseña
        </button>
        {!obligatoria && (
          <button className="btn-secundario" onClick={onCerrar}>
            Ahora no
          </button>
        )}
      </div>
    </div>
  );
}
