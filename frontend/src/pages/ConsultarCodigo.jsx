import { useState } from 'react';
import { getReservas } from '../services/api';

function ConsultarCodigo() {
  const [codigo, setCodigo]     = useState('');
  const [reserva, setReserva]   = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError(''); setReserva(null); setCargando(true);
    try {
      const res = await getReservas();
      const encontrada = res.data.results.find(
        (r) => r.codigo_reservacion.toLowerCase() === codigo.trim().toLowerCase()
      );
      if (encontrada) { setReserva(encontrada); }
      else { setError('No se encontró ninguna reserva con ese código.'); }
    } catch { setError('Error al buscar. Verifica que el servidor esté corriendo.'); }
    finally { setCargando(false); }
  };

  const estiloTarjeta = { border: '1px solid #e5e4e7', borderRadius: '12px', padding: '30px 40px', width: '550px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', background: 'white', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#1e3d6b', fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px' }}>Consultar Reservación</h2>
        <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>Ingresa tu código de reservación para ver el detalle</p>
      </div>

      <form onSubmit={handleBuscar} style={estiloTarjeta}>
        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Código de reservación</label>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input type="text" placeholder="Ej. RES-A3F2-2026-06-01" value={codigo} onChange={(e) => setCodigo(e.target.value)}
            style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', fontSize: '14px', outline: 'none' }} required />
          <button type="submit" disabled={cargando} style={{ backgroundColor: cargando ? '#ccc' : '#1e3d6b', color: 'white', border: 'none', borderRadius: '6px', padding: '12px 25px', fontWeight: 'bold', cursor: cargando ? 'not-allowed' : 'pointer', minWidth: '100px' }}>
            {cargando ? '...' : 'Buscar'}
          </button>
        </div>
        {error && <p style={{ color: '#c53030', fontSize: 13, margin: 0 }}>⚠ {error}</p>}
      </form>

      {reserva && (
        <div style={estiloTarjeta}>
          <h3 style={{ color: '#1e3d6b', fontSize: '18px', margin: '0 0 15px', fontWeight: 'bold' }}>Detalle de Reservación</h3>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e4e7', marginBottom: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px' }}>
            {[['Código', reserva.codigo_reservacion], ['Recurso', reserva.recurso_nombre], ['Usuario', reserva.usuario_nombre], ['Fecha', reserva.fecha_reserva], ['Horario', `${reserva.hora_inicio?.slice(0,5)} - ${reserva.hora_fin?.slice(0,5)}`]].map(([label, valor]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '120px', color: '#888' }}>{label}</span>
                <strong style={{ color: '#333' }}>{valor}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Estado</span>
              <span style={{ backgroundColor: reserva.estado_nombre === 'activa' ? '#e6fffa' : '#f5f5f5', color: reserva.estado_nombre === 'activa' ? '#2c7a7b' : '#9ca3af', padding: '4px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                {reserva.estado_nombre}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultarCodigo;
