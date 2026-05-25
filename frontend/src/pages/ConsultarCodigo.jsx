import React, { useState } from 'react';

function ConsultarCodigo() {
  const [codigoBuscado, setCodigoBuscado] = useState('');
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Datos de prueba para simular la consulta
  const datosReserva = {
    código: 'RES-A3F2-202610151',
    recurso: 'Salón A-101',
    fecha: '15/10/2026',
    horario: '08:00 - 10:00',
    solicitante: 'Mario Macario',
    estado: 'Activa'
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (codigoBuscado.trim() !== '') {
      setMostrarDetalle(true); // Activa la tarjeta de detalles abajo
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'sans-serif', 
      background: '#ffffff', 
      minHeight: '100vh', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '25px'
    }}>
      
      {/* Encabezado Principal */}
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ color: '#1e3d6b', fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          Consultar Reservación
        </h2>
        <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>
          Ingresa tu código de reservación para consultar el detalle
        </p>
      </div>

      {/* Caja 1: Formulario de Búsqueda */}
      <form onSubmit={handleBuscar} style={{
        border: '1px solid #e5e4e7',
        borderRadius: '12px',
        padding: '30px 40px',
        width: '550px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left'
      }}>
        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
          Código de reservación
        </label>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text"
            placeholder="Ej. RES-A3F2-20261015"
            value={codigoBuscado}
            onChange={(e) => setCodigoBuscado(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '8px',
              border: '1px solid #e3e3e3',
              backgroundColor: '#f5f5f5',
              fontSize: '14px',
              color: '#333',
              outline: 'none'
            }}
            required
          />
          
          <button type="submit" style={{
            backgroundColor: '#1e3d6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 25px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '100px'
          }}>
            Buscar
          </button>
        </div>
      </form>

      {/* Caja 2: Detalle de Reservación (Aparece dinámicamente) */}
      {mostrarDetalle && (
        <div style={{
          border: '1px solid #e5e4e7',
          borderRadius: '12px',
          padding: '30px 40px',
          width: '550px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          background: 'white',
          textAlign: 'left',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          
          <h3 style={{ color: '#1e3d6b', fontSize: '18px', margin: '0 0 15px 0', fontWeight: 'bold' }}>
            Detalle de Reservación
          </h3>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e4e7', marginBottom: '20px' }} />

          {/* Listado de características de lado a lado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Código</span>
              <strong style={{ color: '#1e3d6b', letterSpacing: '0.5px' }}>{datosReserva.código}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Recurso</span>
              <strong style={{ color: '#333' }}>{datosReserva.recurso}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Fecha</span>
              <strong style={{ color: '#333' }}>{datosReserva.fecha}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Horario</span>
              <strong style={{ color: '#333' }}>{datosReserva.horario}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Solicitante</span>
              <strong style={{ color: '#333' }}>{datosReserva.solicitante}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '120px', color: '#888' }}>Estado</span>
              <span style={{
                backgroundColor: '#e6fffa',
                color: '#2c7a7b',
                padding: '4px 14px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {datosReserva.estado}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ConsultarCodigo;