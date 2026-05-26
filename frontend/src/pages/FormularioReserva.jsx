// ================================================
// FormularioReserva.jsx — Conectado al backend
// POST /api/reservas/crear/
// ================================================

import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useUsuario } from '../context/UsuarioContext';
import { crearReserva } from '../services/api';

function FormularioReserva() {
  const { state }       = useLocation(); // viene del Catálogo con el recurso
  const navigate        = useNavigate();
  const { usuario }     = useUsuario();
  const recurso         = state?.recurso;

  const [fecha, setFecha]           = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin]       = useState('');
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState('');
  const [reservaCreada, setReservaCreada] = useState(null);

  // Si no viene un recurso del catálogo, vuelve al catálogo
  if (!recurso) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>No hay recurso seleccionado.</p>
        <Link to="/Catalogo">Volver al Catálogo</Link>
      </div>
    );
  }

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await crearReserva({
        usuario:       usuario.id,
        recurso:       recurso.id,
        fecha_reserva: fecha,
        hora_inicio:   horaInicio,
        hora_fin:      horaFin,
      });
      setReservaCreada(res.data.reserva);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la reserva.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  // ── Pantalla de confirmación (ticket) ─────────
  if (reservaCreada) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'center' }}>
        <h2 style={{ color: '#27ae60', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Reserva Confirmada
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Tu reserva ha sido registrada exitosamente</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
          <div style={{
            border: '1px solid #e5e4e7', borderRadius: '12px', padding: '35px',
            width: '480px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: 'white', textAlign: 'left'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#888', fontWeight: 'bold' }}>Código de Reservación</span>
              <h2 style={{ color: '#1e3d6b', fontSize: '24px', margin: '5px 0 15px', letterSpacing: '1px' }}>
                {reservaCreada.codigo_reservacion}
              </h2>
              <hr style={{ border: 'none', borderTop: '2px solid #1e3d6b' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', margin: '20px 0' }}>
              {[
                ['Recurso',   reservaCreada.recurso_nombre],
                ['Fecha',     reservaCreada.fecha_reserva],
                ['Horario',   `${reservaCreada.hora_inicio?.slice(0,5)} - ${reservaCreada.hora_fin?.slice(0,5)}`],
                ['Duración',  `${reservaCreada.duracion_minutos} minutos`],
                ['Estado',    reservaCreada.estado_nombre],
              ].map(([label, valor]) => (
                <div key={label} style={{ display: 'flex' }}>
                  <span style={{ width: '100px', color: '#888' }}>{label}</span>
                  <strong style={{ color: '#333' }}>{valor}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link to="/mis-reservaciones" style={estiloLinkBtn}>Ver mis reservaciones</Link>
          <Link to="/Catalogo" style={{ ...estiloLinkBtn, background: '#1e3d6b', color: 'white', border: 'none' }}>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulario ────────────────────────────────
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e3d6b', marginBottom: '40px', fontWeight: 'bold' }}>Confirmar Reserva</h2>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <form onSubmit={handleConfirmar} style={{
          border: '1px solid #f0f0f0', borderRadius: '12px', padding: '40px',
          width: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          background: 'white', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          {/* Info del recurso */}
          <div>
            <h3 style={{ color: '#1e3d6b', margin: '0 0 8px', fontSize: '22px' }}>{recurso.nombre}</h3>
            <span style={{ backgroundColor: '#e6f4ff', color: '#0958d9', padding: '4px 15px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              {recurso.tipo_recurso_nombre}
            </span>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e4e7', marginTop: '15px' }} />
          </div>

          {/* Campos */}
          {[
            { label: 'Fecha de reserva', type: 'date',  value: fecha,       setter: setFecha },
            { label: 'Hora de inicio',   type: 'time',  value: horaInicio,  setter: setHoraInicio },
            { label: 'Hora de fin',      type: 'time',  value: horaFin,     setter: setHoraFin },
          ].map(({ label, type, value, setter }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{label}</label>
              <input
                type={type} value={value} onChange={(e) => setter(e.target.value)}
                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', outline: 'none' }}
                required
              />
            </div>
          ))}

          {/* Error */}
          {error && (
            <p style={{ color: '#c53030', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              ⚠ {error}
            </p>
          )}

          <button type="submit" disabled={cargando} style={{
            backgroundColor: cargando ? '#ccc' : '#1e3d6b',
            color: 'white', border: 'none', borderRadius: '8px',
            padding: '14px', fontWeight: 'bold', fontSize: '15px',
            cursor: cargando ? 'not-allowed' : 'pointer'
          }}>
            {cargando ? 'Procesando...' : 'Confirmar Reserva'}
          </button>

          <button type="button" onClick={() => navigate(-1)} style={{
            backgroundColor: 'transparent', color: '#e0533c',
            border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'
          }}>
            CANCELAR
          </button>
        </form>
      </div>
    </div>
  );
}

const estiloLinkBtn = {
  display: 'inline-block', padding: '12px 24px',
  border: '1px solid #1e3d6b', color: '#1e3d6b',
  backgroundColor: 'transparent', borderRadius: '6px',
  fontWeight: 'bold', textDecoration: 'none', fontSize: '14px',
};

export default FormularioReserva;
