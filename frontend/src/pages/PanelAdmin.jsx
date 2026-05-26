import { useState, useEffect } from 'react';
import { useUsuario } from '../context/UsuarioContext';
import { getReservasAdmin, cancelarReserva } from '../services/api';

function PanelAdmin() {
  const { usuario }             = useUsuario();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');
  const [pagina, setPagina]     = useState(1);
  const [total, setTotal]       = useState(0);
  const PAGE_SIZE = 10;

  // Filtros
  const [filtroFecha, setFiltroFecha]     = useState('');
  const [filtroRecurso, setFiltroRecurso] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEstado, setFiltroEstado]   = useState('');

  const cargar = async (page = 1) => {
    setCargando(true); setError('');
    try {
      const filtros = { page, page_size: PAGE_SIZE };
      if (filtroFecha)   filtros.fecha    = filtroFecha;
      if (filtroRecurso) filtros.recurso  = filtroRecurso;
      if (filtroUsuario) filtros.usuario  = filtroUsuario;
      if (filtroEstado)  filtros.estado   = filtroEstado;
      const res = await getReservasAdmin(usuario.correo, filtros);
      setReservas(res.data.results);
      setTotal(res.data.count);
    } catch { setError('Error al cargar reservaciones.'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(pagina); }, [pagina]);

  const handleFiltrar = () => { setPagina(1); cargar(1); };

  const handleCancelar = async (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva ${reserva.codigo_reservacion}?`)) return;
    try {
      await cancelarReserva(reserva.id, usuario.id);
      cargar(pagina);
    } catch (err) { alert(err.response?.data?.error || 'Error al cancelar.'); }
  };

  const totalPaginas = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e3d6b', marginBottom: '30px', fontWeight: 'bold' }}>Panel de Administración</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px', alignItems: 'flex-end' }}>
        {[
          { label: 'Fecha', type: 'date',   value: filtroFecha,    setter: setFiltroFecha },
          { label: 'ID Recurso', type: 'number', value: filtroRecurso, setter: setFiltroRecurso },
          { label: 'ID Usuario', type: 'number', value: filtroUsuario, setter: setFiltroUsuario },
        ].map(({ label, type, value, setter }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#666' }}>{label}</label>
            <input type={type} value={value} onChange={(e) => setter(e.target.value)}
              style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', outline: 'none', minWidth: 140 }} />
          </div>
        ))}
        <button onClick={handleFiltrar} style={{ backgroundColor: '#1e3d6b', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: 42 }}>
          Filtrar
        </button>
        <button onClick={() => { setFiltroFecha(''); setFiltroRecurso(''); setFiltroUsuario(''); setFiltroEstado(''); setPagina(1); cargar(1); }}
          style={{ backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #e3e3e3', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', height: 42 }}>
          Limpiar
        </button>
      </div>

      {cargando && <p style={{ color: '#666' }}>Cargando...</p>}
      {error    && <p style={{ color: '#c53030' }}>{error}</p>}

      {!cargando && !error && (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['Código', 'Recurso', 'Usuario', 'Fecha', 'Horario', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '15px', color: '#555', fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #e5e4e7', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '18px 15px', color: '#1e3d6b', fontWeight: 'bold', fontSize: 14 }}>{r.codigo_reservacion}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.recurso_nombre}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.usuario_nombre}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.fecha_reserva}</td>
                    <td style={{ padding: '18px 15px', fontSize: 14 }}>{r.hora_inicio?.slice(0,5)} - {r.hora_fin?.slice(0,5)}</td>
                    <td style={{ padding: '18px 15px' }}>
                      <span style={{ backgroundColor: r.estado_nombre === 'activa' ? '#e6fffa' : '#fff5f5', color: r.estado_nombre === 'activa' ? '#2c7a7b' : '#c53030', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: 13 }}>
                        {r.estado_nombre}
                      </span>
                    </td>
                    <td style={{ padding: '18px 15px' }}>
                      {r.estado_nombre === 'activa' && (
                        <button onClick={() => handleCancelar(r)} style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', borderRadius: '6px', padding: '6px 12px', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: 14, color: '#888' }}>
            <span>Mostrando {reservas.length} de {total} reservaciones</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
                style={{ border: 'none', background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px', cursor: pagina === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                &lt;
              </button>
              <span style={{ background: '#1e3d6b', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>{pagina}</span>
              <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina >= totalPaginas}
                style={{ border: 'none', background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px', cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PanelAdmin;
