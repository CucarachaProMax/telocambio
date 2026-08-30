import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./api/AuthContext";
import NavBar from "./components/NavBar";
import Chat from "./pages/Chat";
import Explorar from "./pages/Explorar";
import ItemDetalle from "./pages/ItemDetalle";
import Login from "./pages/Login";
import Mensajes from "./pages/Mensajes";
import Perfil from "./pages/Perfil";
import SubirItem from "./pages/SubirItem";

function RutaPrivada({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <p>Cargando...</p>;
  return usuario ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Explorar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/items/:id" element={<ItemDetalle />} />
          <Route path="/perfil/:username" element={<Perfil />} />
          <Route
            path="/subir"
            element={
              <RutaPrivada>
                <SubirItem />
              </RutaPrivada>
            }
          />
          <Route
            path="/mensajes"
            element={
              <RutaPrivada>
                <Mensajes />
              </RutaPrivada>
            }
          />
          <Route
            path="/chats/:id"
            element={
              <RutaPrivada>
                <Chat />
              </RutaPrivada>
            }
          />
        </Routes>
      </main>
    </>
  );
}
