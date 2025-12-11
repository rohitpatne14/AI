import { useEffect, useState } from "react";
import { login, signup, fetchProfile } from "./api";
import "./App.css";
import visionImage from "./vision.png";

const emptyForm = { name: "", email: "", password: "" };

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile(token)
        .then((profile) => setUser(profile))
        .catch((err) => {
          console.error(err);
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const data = await signup(form);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setUser(data.user);
      } else {
        const data = await login({ email: form.email, password: form.password });
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <div className="app">
      <header>
        <h1>Secure Dashboard</h1>
        {user ? <button onClick={handleLogout}>Logout</button> : null}
      </header>

      {!user ? (
        <div className="card">
          <div className="tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
            </button>
          </form>
          {error ? <p className="error">{error}</p> : null}
        </div>
      ) : (
        <div className="card dashboard">
          <h2>Welcome back, {user.name}!</h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>This dashboard is protected. You can only see it when authenticated.</p>
          <div className="vision-board">
            <img src={visionImage} alt="Vision Board 2025" className="vision-image" />
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;

