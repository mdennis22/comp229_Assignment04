import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = ({ onAuth }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [stage, setStage] = useState("register");
  const [authToken, setAuthToken] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const startTwoFactorSetup = async (token) => {
    const response = await fetch("/api/users/2fa/setup", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to set up two-factor authentication");
    setEnrollment(data);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to register");
      setAuthToken(data.token);
      setStage("setup");
      try {
        await startTwoFactorSetup(data.token);
      } catch (setupError) {
        setError(setupError.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyTwoFactor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/users/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ authenticatorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to verify authenticator code");
      onAuth(authToken);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipTwoFactor = () => {
    onAuth(authToken);
    navigate("/");
  };

  const handleRetryTwoFactorSetup = async () => {
    setSaving(true);
    setError("");
    try {
      await startTwoFactorSetup(authToken);
    } catch (setupError) {
      setError(setupError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="layout-title">{stage === "register" ? "Register" : "Set up two-factor authentication"}</h1>

      {stage === "register" ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="layout-title">
              Username
            </label>
            <input type="text" id="username" name="username" value={form.username} onChange={handleChange} required />
          </div>

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
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Please wait..." : "Register"}
          </button>
        </form>
      ) : (
        <div>
          <p>Scan this QR code with an authenticator app, then enter the six-digit code to enable 2FA.</p>
          {enrollment ? (
            <>
              <img src={enrollment.qrCode} alt="Two-factor authentication setup QR code" />
              <p>Manual setup key: {enrollment.secret}</p>
              <form onSubmit={handleVerifyTwoFactor}>
                <div className="form-group">
                  <label htmlFor="authenticatorCode" className="layout-title">
                    Authenticator code
                  </label>
                  <input
                    type="text"
                    id="authenticatorCode"
                    value={authenticatorCode}
                    onChange={(event) => setAuthenticatorCode(event.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    required
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={saving}>
                  {saving ? "Please wait..." : "Verify and finish"}
                </button>
              </form>
            </>
          ) : (
            <>
              {error && <p className="error-message">{error}</p>}
              <button type="button" onClick={handleRetryTwoFactorSetup} disabled={saving}>
                Retry setup
              </button>
            </>
          )}
          <button type="button" onClick={handleSkipTwoFactor} disabled={saving}>
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
