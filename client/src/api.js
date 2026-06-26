const AUTH_API_URL = "http://localhost:5003/api/auth";
const TOKEN_KEY = "pocketcart_token";
const USER_KEY = "pocketcart_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function signup(email, password, name) {
  const response = await fetch(`${AUTH_API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to sign up");
  }
  return data;
}

export async function login(email, password) {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to log in");
  }
  return data;
}

export async function authFetch(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (response.status === 401) {
    clearSession();
    window.location.reload();
  }

  return response;
}
