// ================================================
// MisReservaciones.jsx — Conectado al backend
// GET /api/reservas/?usuario=X
// ================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuario } from '../context/UsuarioContext';
import { getReservas, cancelarReserva } from '../services/api';

function MisReservaciones() {
  const navigate        = useNavigate();
  const { usuario }     = useUsuario();
  const [reservas, setReservas]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');

  const cargarReservas = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await getReservas({ usuario: usuario.id });
      setReservas(res.data.results);
    } catch {
      setError('Error al cargar tus reservaciones.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarReservas(); }, []);

  const handleCancelar = async (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva ${reserva.codigo_reservacion}?`)) return;
    try {
      await cancelarReserva(reserva.id, usuario.id);
      cargarReservas(); // recargar la lista
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al cancelar.';
      alert(msg);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e4e7', paddingBottom: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#1e3d6b', margin: 0, fontWeight: 'bold' }}>Mis Reservaciones</h2>
        <button onClick={() => navigate('/Catalogo')} style={estiloBotonPrimario}>
          + Nueva Reserva
        </button>
      </div>

      {cargando && <p style={{ color: '#666' }}>Cargando reservaciones...</p>}
      {error    && <p style={{ color: '#c53030' }}>{error}</p>}

      {!cargando && !error && (
        reservas.length === 0
          ? <p style={{ color: '#666' }}>No tienes reservaciones activas.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {['Código', 'Recurso', 'Fecha', 'Horario', 'Estado', 'Acción'].map((h) => (
                      <th key={h} style={estiloTh}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ ...estiloTd, color: '#1e3d6b', fontWeight: 'bold' }}>{r.codigo_reservacion}</td>
                      <td style={estiloTd}>{r.recurso_nombre}</td>
                      <td style={estiloTd}>{r.fecha_reserva}</td>
                      <td style={estiloTd}>{r.hora_inicio?.slice(0,5)} - {r.hora_fin?.slice(0,5)}</td>
                      <td style={estiloTd}>
                        <span style={{
                          backgroundColor: r.estado_nombre === 'activa' ? '#e6fffa' : '#f5f5f5',
                          color: r.estado_nombre === 'activa' ? '#2c7a7b' : '#9ca3af',
                          padding: '6px 16px', borderRadius: '6px',
                          fontWeight: 'bold', fontSize: '13px'
                        }}>
                          {r.estado_nombre}
                        </span>
                      </td>
                      <td style={estiloTd}>
                        {r.estado_nombre === 'activa' && (
                          <button onClick={() => handleCancelar(r)} style={{
                            backgroundColor: '#fff5f5', color: '#c53030',
                            border: '1px solid #fed7d7', borderRadius: '6px',
                            padding: '6px 14px', fontSize: '13px',
                            fontWeight: 'bold', cursor: 'pointer'
                          }}>
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  );
}

const estiloBotonPrimario = {
  backgroundColor: '#1e3d6b', color: 'white', border: 'none',
  borderRadius: '6px', padding: '10px 20px', fontWeight: 'bold',
  fontSize: '14px', cursor: 'pointer',
};
const estiloTh = { padding: '15px', color: '#555', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #e5e4e7', textAlign: 'left' };
const estiloTd = { padding: '18px 15px', color: '#333', fontSize: '14px' };

export default MisReservaciones;
