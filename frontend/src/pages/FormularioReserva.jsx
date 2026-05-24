import React, { useState } from 'react';

function FormularioReserva() {
  // Estados para capturar lo que escribe el usuario
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Función para manejar el envío del formulario
  const handleConfirmar = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', { fecha, horaInicio, horaFin });
    alert('Intentando confirmar reserva para Salón A-101...');
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'sans-serif', 
      background: '#ffffff', 
      minHeight: '100vh',
      textAlign: 'left'
    }}>
      
      {/* Título Principal */}
      <h2 style={{ color: '#1e3d6b', marginBottom: '40px', fontWeight: 'bold' }}>
        Confirmar Reserva
      </h2>

      {/* Contenedor de la Tarjeta Central Centrada */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        
        <form onSubmit={handleConfirmar} style={{
          border: '1px solid #f0f0f0',
          borderRadius: '12px',
          padding: '40px',
          width: '500px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Encabezado de la Tarjeta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ color: '#1e3d6b', margin: 0, fontSize: '22px' }}>Salón A-101</h3>
            <div>
              <span style={{
                backgroundColor: '#e6f4ff',
                color: '#0958d9',
                padding: '4px 15px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Salón
              </span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e4e7', marginTop: '10px' }} />
          </div>

          {/* Campo: Fecha de reserva */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              Fecha de reserva
            </label>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                outline: 'none',
                fontSize: '14px',
                color: '#666'
              }}
              required
            />
          </div>

          {/* Campo: Hora de inicio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              Hora de inicio
            </label>
            <input 
              type="time" 
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                outline: 'none',
                fontSize: '14px',
                color: '#666'
              }}
              required
            />
          </div>

          {/* Campo: Hora de finalización */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              Hora de finalización
            </label>
            <input 
              type="time" 
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                outline: 'none',
                fontSize: '14px',
                color: '#666'
              }}
              required
            />
          </div>

          {/* Mensajes de error en rojo (Fieles al Wireframe) */}
          <div style={{ 
            color: '#e0533c', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            margin: '10px 0'
          }}>
            <span>Este horario ya está reservado para el recurso seleccionado</span>
            <span>Ha alcanzado el límite máximo de reservas activas para este tipo de recurso</span>
          </div>

          {/* Botón de Confirmar */}
          <button 
            type="submit"
            style={{
              backgroundColor: '#1e3d6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Confirmar Reserva
          </button>

          {/* Botón de Cancelar */}
          <button 
            type="button"
            onClick={() => window.history.back()}
            style={{
              backgroundColor: 'transparent',
              color: '#e0533c',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              marginTop: '5px'
            }}
          >
            CANCELAR
          </button>

        </form>
      </div>

    </div>
  );
}

export default FormularioReserva;