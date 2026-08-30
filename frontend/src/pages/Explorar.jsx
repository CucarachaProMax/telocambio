import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Hero from "../components/Hero";
import SelectorMapa from "../components/SelectorMapa";

const EMOJI_POR_CATEGORIA = {
  Cartas: "🃏",
  Figuras: "🎎",
  "Coches (miniatura)": "🚗",
  Peluches: "🧸",
  Otro: "✨",
};

export default function Explorar() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [filtros, setFiltros] = useState({ q: "", categoria: "" });
  const [etiquetasElegidas, setEtiquetasElegidas] = useState([]);
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null, ciudad: "" });
  const [radioKm, setRadioKm] = useState(25);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [cargando, setCargando] = useState(true);

  // el buscador vive en el navbar y llega aquí como ?q= en la URL
  useEffect(() => {
    setFiltros((f) => ({ ...f, q: searchParams.get("q") || "" }));
  }, [searchParams]);

  useEffect(() => {
    api.get("/categorias/").then(setCategorias);
    api.get("/etiquetas/").then(setEtiquetas);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.q) params.set("q", filtros.q);
    if (filtros.categoria) params.set("categoria", filtros.categoria);
    if (etiquetasElegidas.length) params.set("etiquetas", etiquetasElegidas.join(","));
    if (ubicacion.lat && ubicacion.lng) {
      params.set("lat", ubicacion.lat);
      params.set("lng", ubicacion.lng);
      params.set("radio_km", radioKm);
    }

    setCargando(true);
    api
      .get(`/items/?${params.toString()}`)
      .then((data) => setItems(data.results ?? data))
      .finally(() => setCargando(false));
  }, [filtros, etiquetasElegidas, ubicacion, radioKm]);

  function toggleEtiqueta(id) {
    setEtiquetasElegidas((s) => (s.includes(id) ? s.filter((e) => e !== id) : [...s, id]));
  }

  function elegirCategoria(id) {
    setFiltros((f) => ({ ...f, categoria: f.categoria === String(id) ? "" : String(id) }));
  }

  const nombreCategoriaActiva = useMemo(
    () => categorias.find((c) => String(c.id) === filtros.categoria)?.nombre,
    [categorias, filtros.categoria]
  );

  const hayFiltrosActivos = filtros.q || nombreCategoriaActiva || ubicacion.lat;

  return (
    <div>
      {!hayFiltrosActivos && <Hero />}

      <div className="tiles-categorias">
        {categorias.map((c) => (
          <div
            key={c.id}
            className={filtros.categoria === String(c.id) ? "tile-categoria activa" : "tile-categoria"}
            onClick={() => elegirCategoria(c.id)}
          >
            <span className="emoji">{EMOJI_POR_CATEGORIA[c.nombre] ?? "📦"}</span>
            <span className="nombre">{c.nombre}</span>
          </div>
        ))}
      </div>

      <div className="barra-filtros">
        <button type="button" className="btn-secundario" onClick={() => setMostrarMapa((m) => !m)}>
          📍 {ubicacion.ciudad || "Cerca de..."}
        </button>
        <div className="chips">
          {etiquetas.map((et) => (
            <span
              key={et.id}
              className={etiquetasElegidas.includes(et.id) ? "chip activa" : "chip"}
              onClick={() => toggleEtiqueta(et.id)}
            >
              {et.nombre}
            </span>
          ))}
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="filtros-activos">
          {filtros.q && (
            <span className="chip activa" onClick={() => setFiltros((f) => ({ ...f, q: "" }))}>
              "{filtros.q}" ✕
            </span>
          )}
          {nombreCategoriaActiva && (
            <span className="chip activa" onClick={() => elegirCategoria("")}>
              {nombreCategoriaActiva} ✕
            </span>
          )}
        </div>
      )}

      {mostrarMapa && (
        <div className="card" style={{ marginBottom: 14 }}>
          <SelectorMapa
            lat={ubicacion.lat}
            lng={ubicacion.lng}
            radioKm={ubicacion.lat ? radioKm : null}
            onSeleccionar={setUbicacion}
            pedirAlAbrir
          />
          {ubicacion.lat && (
            <div className="fila" style={{ marginTop: 10 }}>
              <span className="subtitulo" style={{ margin: 0 }}>
                Radio
              </span>
              <input
                type="range"
                min="5"
                max="100"
                value={radioKm}
                onChange={(e) => setRadioKm(Number(e.target.value))}
                style={{ marginBottom: 0 }}
              />
              <span className="subtitulo" style={{ margin: 0, minWidth: 50 }}>
                {radioKm} km
              </span>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setUbicacion({ lat: null, lng: null, ciudad: "" })}
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid-items">
          {items.map((item) => (
            <Link to={`/items/${item.id}`} key={item.id} className="tarjeta-item">
              <div className="foto-placeholder">
                {item.fotos?.[0] ? <img src={item.fotos[0].imagen} alt={item.nombre} /> : "🖼️"}
              </div>
              <div className="tarjeta-body">
                <p className="titulo">{item.nombre}</p>
                <p className="subtitulo">
                  de {item.dueno}
                  {item.distancia_km != null && ` · a ${item.distancia_km} km`}
                </p>
                <span className={`estado estado-${item.estado}`}>{item.estado}</span>
              </div>
            </Link>
          ))}
          {items.length === 0 && <p>No hay items que coincidan con la búsqueda.</p>}
        </div>
      )}
    </div>
  );
}
