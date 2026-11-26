import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onAuth }) => {
  const [form, setForm] = useState({ email: "", password: "", authenticatorCode: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to login");
      onAuth(data.token);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="layout-title">Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="layout-title">
            Email
          </label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="layout-title">
            Password
          </label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="authenticatorCode" className="layout-title">
            Authenticator code (if enabled)
          </label>
          <input
            type="text"
            id="authenticatorCode"
            name="authenticatorCode"
            value={form.authenticatorCode}
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength="6"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button disabled={saving} type="submit">
          {saving ? "Please wait…" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
