import React from 'react';

function TarjetaRecurso({ nombre, tipo, capacidad, ubicacion, disponible }) {
  // Configuración de colores según el tipo de recurso
  const coloresTipo = {
    Salón: { bg: '#e6f4ff', texto: '#0958d9' },
    Laboratorio: { bg: '#fff7e6', texto: '#d46b08' },
    Equipo: { bg: '#f9f0ff', texto: '#531dab' }
  };

  const estiloTipo = coloresTipo[tipo] || { bg: '#f5f5f5', texto: '#595959' };

  return (
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: '12px',
      padding: '24px',
      width: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      background: '#white',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      textAlign: 'left',
      fontFamily: 'sans-serif'
    }}>
      {/* Etiqueta de Tipo */}
      <div>
        <span style={{
          backgroundColor: estiloTipo.bg,
          color: estiloTipo.texto,
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {tipo}
        </span>
      </div>

      {/* Nombre del Recurso */}
      <h3 style={{ margin: '8px 0 4px 0', color: '#1e3d6b', fontSize: '18px' }}>{nombre}</h3>
      
      {/* Detalles */}
      <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
        <div><strong>Capacidad:</strong> {capacidad}</div>
        <div>{ubicacion}</div>
      </div>

      {/* Estado (Disponible / Ocupado) */}
      <div>
        <span style={{
          backgroundColor: disponible ? '#e6fffa' : '#fff5f5',
          color: disponible ? '#2c7a7b' : '#c53030',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {disponible ? 'Disponible' : 'Ocupado'}
        </span>
      </div>

      {/* Botón de Acción */}
      <button style={{
        backgroundColor: disponible ? '#1e3d6b' : '#e0533c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px',
        fontWeight: 'bold',
        cursor: disponible ? 'pointer' : 'not-allowed',
        marginTop: '10px',
        width: '100%',
        transition: 'background-color 0.2s'
      }} disabled={!disponible}>
        {disponible ? 'Reservar' : 'No Disponible'}
      </button>
    </div>
  );
}

export default TarjetaRecurso;