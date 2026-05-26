import { useState, useEffect } from 'react';
import { getRecursos } from '../services/api';

function GestionRecursos() {
  const [recursos, setRecursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getRecursos();
        setRecursos(res.data.results);
      } catch { setError('Error al cargar recursos.'); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e4e7', paddingBottom: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#1e3d6b', margin: 0, fontWeight: 'bold' }}>Gestión de Recursos</h2>
        <button style={{ backgroundColor: '#1e3d6b', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 20px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
          + Agregar Recurso
        </button>
      </div>

      {cargando && <p style={{ color: '#666' }}>Cargando recursos...</p>}
      {error    && <p style={{ color: '#c53030' }}>{error}</p>}

      {!cargando && !error && (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['Nombre', 'Tipo', 'Capacidad', 'Ubicación', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '15px', color: '#555', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #e5e4e7', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recursos.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '18px 15px', color: '#1e3d6b', fontWeight: 'bold', fontSize: 14 }}>{r.nombre}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.tipo_recurso_nombre}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.capacidad || 'N/A'}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.ubicacion_nombre}</td>
                    <td style={{ padding: '18px 15px' }}>
                      <span style={{ backgroundColor: r.activo ? '#e6fffa' : '#fff5f5', color: r.activo ? '#2c7a7b' : '#c53030', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: 12 }}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ backgroundColor: '#e6f4ff', color: '#0958d9', border: '1px solid #bae7ff', borderRadius: '6px', padding: '6px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
                        <button style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', borderRadius: '6px', padding: '6px 16px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 14, color: '#888' }}>Total: {recursos.length} recursos registrados</div>
        </>
      )}
    </div>
  );
}

export default GestionRecursos;
