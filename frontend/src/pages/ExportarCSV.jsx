import { useState } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { getCSVAdmin } from '../services/api';

function ExportarCSV() {
  const { usuario }         = useUsuario();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [cargando, setCargando]       = useState(false);
  const [error, setError]             = useState('');

  const handleExportar = async (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      const filtros = {};
      if (fechaInicio) filtros.fecha_inicio = fechaInicio;
      if (fechaFin)    filtros.fecha_fin    = fechaFin;

      const res = await getCSVAdmin(usuario.correo, filtros);

      // Crear enlace de descarga automática
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `reservas_${fechaInicio || 'todas'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al exportar. Verifica el servidor.');
    } finally { setCargando(false); }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e3d6b', marginBottom: '10px', fontWeight: 'bold' }}>Exportar Reportes</h2>
      <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px' }}>Selecciona el rango de fechas y descarga el CSV</p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <form onSubmit={handleExportar} style={{ border: '1px solid #e5e4e7', borderRadius: '12px', padding: '40px', width: '520px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', background: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#1e3d6b', fontSize: '18px', margin: '0 0 8px', fontWeight: 'bold' }}>Reservas por Rango de Fechas</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Deja los campos vacíos para exportar todas las reservas</p>
          </div>

          {[
            { label: 'Fecha inicio', value: fechaInicio, setter: setFechaInicio },
            { label: 'Fecha fin',    value: fechaFin,    setter: setFechaFin },
          ].map(({ label, value, setter }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', width: '130px' }}>{label}</label>
              <input type="date" value={value} onChange={(e) => setter(e.target.value)}
                style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', fontSize: '14px', outline: 'none' }} />
            </div>
          ))}

          {error && <p style={{ color: '#c53030', fontSize: 13, margin: 0 }}>⚠ {error}</p>}

          <button type="submit" disabled={cargando} style={{ backgroundColor: cargando ? '#ccc' : '#1e3d6b', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 'bold', fontSize: '15px', cursor: cargando ? 'not-allowed' : 'pointer' }}>
            {cargando ? 'Generando CSV...' : 'Exportar CSV'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExportarCSV;
