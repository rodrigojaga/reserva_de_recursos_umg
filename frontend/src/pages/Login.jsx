// ================================================
// Login.jsx — MVP: selector de usuario
// Permite cambiar entre estudiante y administrador
// ================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuario } from '../context/UsuarioContext';

export default function Login() {
  const { login, USUARIOS_PRUEBA } = useUsuario();
  const navigate = useNavigate();
  const [seleccionado, setSeleccionado] = useState(null);
  const [error, setError] = useState('');

  const handleEntrar = () => {
    if (!seleccionado) {
      setError('Selecciona un usuario para continuar.');
      return;
    }
    login(seleccionado);
    // Redirige según el rol
    if (seleccionado.rol === 'admin') {
      navigate('/admin');
    } else {
      navigate('/Catalogo');
    }
  };

  return (
    <div style={styles.wrapper}>
      <Bg />
      <div style={styles.card}>

        <h1 style={styles.title}>Gestor de Reservas</h1>
        <p style={styles.subtitle}>Espacios y Equipos Universitarios</p>

        <div style={styles.divider} />

        {/* Selector de usuario MVP */}
        <p style={{ fontSize: 13, color: '#5a6a9a', marginBottom: 12, fontWeight: 600 }}>
          Selecciona tu usuario (MVP)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {USUARIOS_PRUEBA.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSeleccionado(u); setError(''); }}
              style={{
                ...styles.usuarioBtn,
                borderColor: seleccionado?.id === u.id ? '#1a3a8f' : '#d0d8f0',
                background: seleccionado?.id === u.id ? '#eef2ff' : '#fff',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#1a3a8f', fontSize: 14 }}>{u.nombre}</div>
                <div style={{ fontSize: 12, color: '#5a6a9a' }}>{u.correo}</div>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                backgroundColor: u.rol === 'admin' ? '#fef3c7' : '#e0f2fe',
                color: u.rol === 'admin' ? '#92400e' : '#0369a1',
              }}>
                {u.rol}
              </span>
            </button>
          ))}
        </div>

        {error && <p style={styles.errorMsg}>⚠ {error}</p>}

        <button style={styles.primaryBtn} onClick={handleEntrar}>
          Entrar al sistema
        </button>

        <p style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
          Solo usuarios con correo <strong>@miumg.edu.gt</strong>
        </p>
      </div>
    </div>
  );
}

function Bg() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'linear-gradient(160deg, #0f2461 0%, #1a3a8f 45%, #132b6e 100%)',
      overflow: 'hidden'
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
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

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    position: 'relative',
    zIndex: 10,
    background: '#ffffff',
    borderRadius: 18,
    padding: '44px 48px',
    width: '100%',
    maxWidth: 420,
    textAlign: 'center',
    boxShadow: '0 24px 80px rgba(10,25,70,0.45)',
  },
  title: {
    fontSize: 26, fontWeight: 800, color: '#1a3a8f',
    margin: '0 0 6px', letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, color: '#5a6a9a', margin: '0 0 4px', fontWeight: 500,
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #d8e0f5, transparent)',
    margin: '24px 0',
  },
  usuarioBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid #d0d8f0',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  primaryBtn: {
    width: '100%',
    padding: '13px 20px',
    borderRadius: 10,
    border: 'none',
    background: '#1a3a8f',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  errorMsg: {
    marginBottom: 12,
    fontSize: 13,
    color: '#c0392b',
    background: '#fff0ef',
    border: '1px solid #f5c0bc',
    borderRadius: 8,
    padding: '8px 14px',
  },
};
