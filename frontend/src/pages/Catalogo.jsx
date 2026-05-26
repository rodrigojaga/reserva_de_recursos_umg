// ================================================
// Catalogo.jsx — Conectado al backend
// GET /api/recursos/ con filtros reales
// ================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaRecurso from '../components/TarjetaRecurso';
import { getRecursos } from '../services/api';

function Catalogo() {
  const navigate = useNavigate();
  const [recursos, setRecursos]     = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState('');

  // Filtros
  const [tipo, setTipo]             = useState('');
  const [capacidadMin, setCapacidadMin] = useState('');
  const [fecha, setFecha]           = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin]       = useState('');

  const cargarRecursos = async (filtros = {}) => {
    setCargando(true);
    setError('');
    try {
      const res = await getRecursos(filtros);
      setRecursos(res.data.results);
    } catch (e) {
      setError('Error al cargar recursos. Verifica que el servidor esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial sin filtros
  useEffect(() => { cargarRecursos(); }, []);

  const handleBuscar = () => {
    const filtros = {};
    if (tipo)         filtros.tipo         = tipo;
    if (capacidadMin) filtros.capacidad_min = capacidadMin;
    if (fecha)        filtros.fecha        = fecha;
    if (horaInicio)   filtros.hora_inicio  = horaInicio;
    if (horaFin)      filtros.hora_fin     = horaFin;
    if (fecha && horaInicio && horaFin) filtros.disponible = 'true';
    cargarRecursos(filtros);
  };

  const handleReservar = (recurso) => {
    // Pasa el recurso seleccionado al formulario de reserva
    navigate('/reservar', { state: { recurso } });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>

      <h2 style={{ color: '#1e3d6b', marginBottom: '30px', fontWeight: 'bold' }}>
        Reservar un Recurso
      </h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '40px', alignItems: 'flex-end' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Tipo de recurso</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={estiloSelect}>
            <option value="">Todos</option>
            <option value="1">Salón</option>
            <option value="2">Laboratorio</option>
            <option value="3">Equipo</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Capacidad mínima</label>
          <input
            type="number"
            placeholder="Ej. 20"
            value={capacidadMin}
            onChange={(e) => setCapacidadMin(e.target.value)}
            style={estiloSelect}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={estiloSelect} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Hora inicio</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} style={estiloSelect} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Hora fin</label>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} style={estiloSelect} />
        </div>

        <button onClick={handleBuscar} style={estiloBoton}>Buscar</button>
      </div>

      {/* Estados */}
      {cargando && <p style={{ color: '#666' }}>Cargando recursos...</p>}
      {error    && <p style={{ color: '#c53030' }}>{error}</p>}

      {/* Tarjetas */}
      {!cargando && !error && (
        recursos.length === 0
          ? <p style={{ color: '#666' }}>No se encontraron recursos con esos filtros.</p>
          : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {recursos.map((r) => (
                <TarjetaRecurso
                  key={r.id}
                  nombre={r.nombre}
                  tipo={r.tipo_recurso_nombre}
                  capacidad={r.capacidad ? `${r.capacidad} personas` : 'Equipo audiovisual'}
                  ubicacion={r.ubicacion_nombre}
                  disponible={r.disponible !== false}
                  onReservar={() => handleReservar(r)}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
}

const estiloSelect = {
  padding: '10px 15px',
  borderRadius: '8px',
  border: '1px solid #e3e3e3',
  backgroundColor: '#f5f5f5',
  color: '#666',
  minWidth: '150px',
  outline: 'none',
  fontSize: 14,
};

const estiloBoton = {
  backgroundColor: '#1e3d6b',
  color: 'white',
  border: 'none',
  padding: '10px 25px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  height: 42,
};

export default Catalogo;
