import { useState } from "react";

const ALLOWED_DOMAIN = "@miumg.edu.gt";

export default function LoginReservas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Simula el flujo de login con Google
  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");

    // Simulación: en producción aquí iría el SDK de Google OAuth
    setTimeout(() => {
      // Simula un correo de prueba válido
      const mockEmail = "estudiante@miumg.edu.gt";
      const mockName = "Estudiante UMG";

      if (!mockEmail.endsWith(ALLOWED_DOMAIN)) {
        setError(`Solo se permiten correos ${ALLOWED_DOMAIN}`);
        setLoading(false);
        return;
      }

      setUser({ name: mockName, email: mockEmail });
      setLoggedIn(true);
      setLoading(false);
    }, 1800);
  };

  if (loggedIn && user) {
    return (
      <div style={styles.wrapper}>
        <Bg />
        <div style={styles.card}>
          <div style={styles.avatarCircle}>{user.name[0]}</div>
          <h2 style={{ ...styles.title, marginBottom: 6 }}>Bienvenido</h2>
          <p style={styles.subtitle}>{user.name}</p>
          <p style={{ fontSize: 13, color: "#1a3a8f", marginBottom: 28 }}>{user.email}</p>
          <button style={styles.primaryBtn} onClick={() => { setLoggedIn(false); setUser(null); }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <Bg />
      <div style={styles.card}>

        <h1 style={styles.title}>Gestor de Reservas</h1>
        <p style={styles.subtitle}>Espacios y Equipos Universitarios</p>

        <div style={styles.divider} />

        <button
          style={{ ...styles.googleBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <Spinner />
          ) : (
            <GoogleIcon />
          )}
          <span style={{ marginLeft: 10 }}>
            {loading ? "Verificando..." : "Continuar con Google"}
          </span>
        </button>

        {error && (
          <p style={styles.errorMsg}>⚠ {error}</p>
        )}

        <p style={styles.domainNote}>
          Solo usuarios con correo <strong>{ALLOWED_DOMAIN}</strong>
        </p>
      </div>
    </div>
  );
}

function Bg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: "linear-gradient(160deg, #0f2461 0%, #1a3a8f 45%, #132b6e 100%)",
      overflow: "hidden"
    }}>
      {/* Círculos decorativos sutiles */}
      {[
        { w: 500, h: 500, top: "-150px", left: "-120px", op: 0.06 },
        { w: 400, h: 400, bottom: "-100px", right: "-80px", op: 0.07 },
        { w: 250, h: 250, top: "40%", right: "15%", op: 0.05 },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          width: s.w, height: s.h,
          borderRadius: "50%",
          border: `2px solid rgba(255,255,255,${s.op})`,
          top: s.top, left: s.left, bottom: s.bottom, right: s.right,
        }} />
      ))}
      {/* Grid pattern */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: "2px solid #dce3f5",
      borderTop: "2px solid #1a3a8f",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },
  card: {
    position: "relative",
    zIndex: 10,
    background: "#ffffff",
    borderRadius: 18,
    padding: "44px 48px",
    width: "100%",
    maxWidth: 380,
    textAlign: "center",
    boxShadow: "0 24px 80px rgba(10,25,70,0.45)",
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#1a3a8f",
    color: "#fff",
    fontSize: 26,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "#1a3a8f",
    margin: "0 0 6px",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#5a6a9a",
    margin: "0 0 4px",
    fontWeight: 500,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, #d8e0f5, transparent)",
    margin: "24px 0",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "13px 20px",
    borderRadius: 10,
    border: "1.5px solid #d0d8f0",
    background: "#fff",
    color: "#1a1a2e",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.18s",
    boxShadow: "0 2px 8px rgba(26,58,143,0.08)",
    letterSpacing: 0.1,
  },
  domainNote: {
    marginTop: 18,
    fontSize: 13,
    color: "#c0392b",
    fontWeight: 500,
  },
  errorMsg: {
    marginTop: 14,
    fontSize: 13,
    color: "#c0392b",
    background: "#fff0ef",
    border: "1px solid #f5c0bc",
    borderRadius: 8,
    padding: "8px 14px",
  },
  primaryBtn: {
    padding: "12px 28px",
    background: "#1a3a8f",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  }
};