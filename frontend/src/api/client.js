const API_URL = import.meta.env.VITE_API_URL;

function leerCookie(nombre) {
  const match = document.cookie.match(new RegExp(`(^| )${nombre}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

async function asegurarCsrf() {
  if (!leerCookie("csrftoken")) {
    await fetch(`${API_URL}/csrf/`, { credentials: "include" });
  }
}

async function apiFetch(path, { method = "GET", body, isFormData = false } = {}) {
  const necesitaCsrf = method !== "GET" && method !== "HEAD";
  if (necesitaCsrf) await asegurarCsrf();

  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (necesitaCsrf) headers["X-CSRFToken"] = leerCookie("csrftoken");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include", // manda la cookie de sesión (HttpOnly) en cada request
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const mensaje =
      (data && (data.detail || JSON.stringify(data))) || `Error ${res.status}`;
    throw new Error(mensaje);
  }
  return data;
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body, opts = {}) => apiFetch(path, { method: "POST", body, ...opts }),
  patch: (path, body) => apiFetch(path, { method: "PATCH", body }),
};

export { API_URL };
