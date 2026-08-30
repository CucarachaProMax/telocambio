import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

const BARCELONA = [41.3874, 2.1686];

// Pin dibujado en SVG a mano: nada de imágenes externas ni assets del
// paquete de Leaflet (esa era la causa de que el icono no apareciera
// con Vite). Coral + tinta, a juego con el resto del diseño.
const iconoPin = L.divIcon({
  className: "pin-mapa",
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="#FF5C7A" stroke="#211934" stroke-width="2"/>
    <circle cx="15" cy="15" r="5.5" fill="#FFFDF9" stroke="#211934" stroke-width="1.5"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

/**
 * Selector de ubicación aproximada. Al hacer click en el mapa (o al
 * detectar el GPS), redondea las coordenadas a ~1km antes de
 * devolverlas — nunca se guarda ni se enseña una posición exacta.
 *
 * Props:
 *  - lat, lng: posición actual (o null)
 *  - radioKm: si se pasa, dibuja un círculo de ese radio (modo búsqueda)
 *  - onSeleccionar({ lat, lng, ciudad }): se llama al elegir un punto
 *  - pedirAlAbrir: si es true y no hay lat/lng, pide el GPS nada más
 *    montar el mapa (con el permiso nativo del navegador)
 *  - alturaPx: alto del mapa
 */
export default function SelectorMapa({ lat, lng, radioKm, onSeleccionar, pedirAlAbrir = false, alturaPx = 220 }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const circuloRef = useRef(null);
  const [punto, setPunto] = useState(lat && lng ? { lat, lng } : null);
  const [buscandoGps, setBuscandoGps] = useState(false);

  // si el padre nos pasa una posición nueva desde fuera (ej. el perfil
  // tarda en cargar y llega un instante después), la reflejamos
  useEffect(() => {
    if (lat && lng) {
      setPunto((p) => (p && p.lat === lat && p.lng === lng ? p : { lat, lng }));
    } else {
      setPunto(null);
      marcadorRef.current?.remove();
      marcadorRef.current = null;
      circuloRef.current?.remove();
      circuloRef.current = null;
    }
  }, [lat, lng]);

  useEffect(() => {
    const centroInicial = punto ? [punto.lat, punto.lng] : BARCELONA;
    const mapa = L.map(contenedorRef.current).setView(centroInicial, punto ? 12 : 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(mapa);
    mapa.on("click", (e) => elegirPunto(e.latlng.lat, e.latlng.lng));
    mapaRef.current = mapa;

    if (punto) colocarMarcador(punto.lat, punto.lng);
    if (pedirAlAbrir && !punto) usarMiUbicacion();

    // por si el mapa se monta dentro de algo que aún no tenía su
    // tamaño final (un desplegable, una pestaña...), recalculamos
    const t = setTimeout(() => mapa.invalidateSize(), 150);

    return () => {
      clearTimeout(t);
      mapa.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!punto) return;
    colocarMarcador(punto.lat, punto.lng);
    if (radioKm) dibujarCirculo(punto.lat, punto.lng, radioKm);
  }, [punto, radioKm]);

  function colocarMarcador(la, ln) {
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (marcadorRef.current) marcadorRef.current.setLatLng([la, ln]);
    else marcadorRef.current = L.marker([la, ln], { icon: iconoPin }).addTo(mapa);
  }

  function dibujarCirculo(la, ln, km) {
    const mapa = mapaRef.current;
    if (!mapa) return;
    const metros = km * 1000;
    if (circuloRef.current) circuloRef.current.setLatLng([la, ln]).setRadius(metros);
    else
      circuloRef.current = L.circle([la, ln], {
        radius: metros,
        color: "#ff5c7a",
        fillColor: "#ff5c7a",
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(mapa);
  }

  async function elegirPunto(latClic, lngClic) {
    const la = Math.round(latClic * 100) / 100; // ~1km de precisión
    const ln = Math.round(lngClic * 100) / 100;
    setPunto({ lat: la, lng: ln }); // el pin aparece al instante, sin esperar nada
    mapaRef.current?.setView([la, ln], Math.max(mapaRef.current.getZoom(), 12));
    let ciudad = "";
    try {
      ciudad = await geocodificarInverso(la, ln);
    } catch {
      // si falla el geocoding seguimos igual — las coordenadas ya son válidas
    }
    onSeleccionar({ lat: la, lng: ln, ciudad });
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        elegirPunto(pos.coords.latitude, pos.coords.longitude);
        setBuscandoGps(false);
      },
      () => setBuscandoGps(false), // si deniega el permiso, sigue pudiendo elegir a mano
      { timeout: 8000 }
    );
  }

  return (
    <div className="selector-mapa">
      <div ref={contenedorRef} style={{ height: alturaPx, borderRadius: 14, border: "3px solid var(--ink)" }} />
      <button type="button" className="btn-secundario boton-mi-ubicacion" onClick={usarMiUbicacion} disabled={buscandoGps}>
        📍 {buscandoGps ? "Buscando tu ubicación..." : "Usar mi ubicación actual"}
      </button>
    </div>
  );
}

// Nominatim es gratuito pero con límite de uso bajo (pensado para poco
// tráfico); si la app crece, esto se cambiaría por un proveedor de pago
// (Mapbox, Google Geocoding) con más capacidad.
async function geocodificarInverso(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
  );
  const data = await res.json();
  return data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
}
