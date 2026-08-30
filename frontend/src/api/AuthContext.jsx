import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get("/yo/")
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  async function login(username, password) {
    const data = await api.post("/login/", { username, password });
    setUsuario(data);
    return data;
  }

  async function logout() {
    await api.post("/logout/");
    setUsuario(null);
  }

  async function registrar(payload) {
    await api.post("/registro/", payload);
    return login(payload.username, payload.password);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, registrar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
