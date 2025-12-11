const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4001";
const USER_BASE_URL = import.meta.env.VITE_USER_URL || "http://localhost:4002";

export const signup = async (payload) => {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Signup failed");
  }
  return res.json();
};

export const login = async (payload) => {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Login failed");
  }
  return res.json();
};

export const fetchProfile = async (token) => {
  const res = await fetch(`${USER_BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to load profile");
  }
  return res.json();
};

