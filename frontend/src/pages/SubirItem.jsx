import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { api } from "../api/client";
import SelectorMapa from "../components/SelectorMapa";

export default function SubirItem() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [form, setForm] = useState({ subcategoria: "", nombre: "", descripcion: "", etiquetas: [] });
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null, ciudad: "" });
  const [ubicacionPerfil, setUbicacionPerfil] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categorias/").then(setCategorias);
    api.get("/etiquetas/").then(setEtiquetas);
  }, []);

  // Pre-rellenamos con la ubicación del perfil en cuanto la tenemos —
  // el usuario la ve ya puesta y solo la cambia si de verdad quiere.
  useEffect(() => {
    if (usuario?.latitud && usuario?.longitud) {
      const inicial = { lat: usuario.latitud, lng: usuario.longitud, ciudad: usuario.ciudad };
      setUbicacionPerfil(inicial);
      setUbicacion(inicial);
    }
  }, [usuario]);

  function toggleEtiqueta(id) {
    setForm((f) => ({
      ...f,
      etiquetas: f.etiquetas.includes(id) ? f.etiquetas.filter((e) => e !== id) : [...f.etiquetas, id],
    }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    try {
      const fd = new FormData();
      fd.append("subcategoria", form.subcategoria);
      fd.append("nombre", form.nombre);
      fd.append("descripcion", form.descripcion);
      form.etiquetas.forEach((id) => fd.append("etiquetas", id));

      // Solo mandamos ubicación propia del item si de verdad la
      // moviste respecto a la de tu perfil — si no, el item hereda la
      // del perfil automáticamente (y nunca al revés).
      const distinta =
        ubicacionPerfil && (ubicacion.lat !== ubicacionPerfil.lat || ubicacion.lng !== ubicacionPerfil.lng);
      if (distinta) {
        fd.append("ciudad", ubicacion.ciudad);
        fd.append("latitud", ubicacion.lat);
        fd.append("longitud", ubicacion.lng);
      }

      const item = await api.post("/items/", fd, { isFormData: true });
      navigate(`/items/${item.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card" style={{ maxWidth: 460, margin: "20px auto" }} onSubmit={enviar}>
      <p className="titulo">Subir un item</p>

      <label>Categoría / subcategoría</label>
      <select value={form.subcategoria} onChange={(e) => setForm({ ...form, subcategoria: e.target.value })} required>
        <option value="">Elige una subcategoría</option>
        {categorias.map((c) => (
          <optgroup key={c.id} label={c.nombre}>
            {c.subcategorias.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <label>Nombre</label>
      <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />

      <label>Descripción</label>
      <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

      <label>Etiquetas</label>
      <div className="chips">
        {etiquetas.map((et) => (
          <span
            key={et.id}
            className={form.etiquetas.includes(et.id) ? "chip activa" : "chip"}
            onClick={() => toggleEtiqueta(et.id)}
          >
            {et.nombre}
          </span>
        ))}
      </div>

      <label>Ubicación del item</label>
      <p className="subtitulo" style={{ marginTop: 0 }}>
        Por defecto, la de tu perfil{ubicacion.ciudad ? ` (📍 ${ubicacion.ciudad})` : ""}. Pincha en otro punto si este
        item está en otro sitio — no cambia tu perfil.
      </p>
      <SelectorMapa lat={ubicacion.lat} lng={ubicacion.lng} onSeleccionar={setUbicacion} />

      {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}
      <button className="btn-primario" type="submit" style={{ marginTop: 16 }}>
        Publicar item
      </button>
    </form>
  );
}
