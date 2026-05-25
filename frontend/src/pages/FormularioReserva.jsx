import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function FormularioReserva() {
  // 1. El "interruptor" para saber qué pantalla mostrar
  const [reservaConfirmada, setReservaConfirmada] = useState(false);

  // Estados para capturar los datos del formulario
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Al darle clic a "Confirmar", activamos el ticket interactivo
  const handleConfirmar = (e) => {
    e.preventDefault();
    setReservaConfirmada(true); // Cambia el interruptor a verdadero
  };

  // RENDERIZADO DEL TICKET (Pantalla 04)
  if (reservaConfirmada) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'center' }}>
        
        {/* Encabezado Verde del Ticket */}
        <h2 style={{ color: '#27ae60', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
          Reserva Confirmada
        </h2>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '30px' }}>
          Tu reserva ha sido registrada exitosamente
        </p>

        {/* Tarjeta del Ticket Fiel al Wireframe */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '25px' }}>
          <div style={{
            border: '1px solid #e5e4e7',
            borderRadius: '12px',
            padding: '35px',
            width: '480px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: 'white',
            textAlign: 'left'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#888', fontWeight: 'bold' }}>Código de Reservación</span>
              <h2 style={{ color: '#1e3d6b', fontSize: '26px', margin: '5px 0 15px 0', letterSpacing: '1px' }}>
                RES-A3F2-20261015
              </h2>
              <hr style={{ border: 'none', borderTop: '2px solid #1e3d6b' }} />
            </div>

            {/* Detalles en Tabla/Filas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', margin: '25px 0' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', color: '#888' }}>Recursos</span>
                <strong style={{ color: '#333' }}>Salón A-101</strong>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', color: '#888' }}>Tipo</span>
                <strong style={{ color: '#333' }}>Salón</strong>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', color: '#888' }}>Fecha</span>
                <strong style={{ color: '#333' }}>{fecha || '15/10/2026'}</strong>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '100px', color: '#888' }}>Horario</span>
                <strong style={{ color: '#333' }}>
                  {horaInicio && horaFin ? `${horaInicio} - ${horaFin}` : '08:00 - 10:00'}
                </strong>
              </div>
            </div>

          </div>
        </div>

        {/* Botón inferior: Ver mis reservaciones */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/mis-reservaciones" style={{
            display: 'block',
            width: '480px',
            border: '1px solid #1e3d6b',
            color: '#1e3d6b',
            backgroundColor: 'transparent',
            padding: '12px 0',
            borderRadius: '6px',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Ver mis reservaciones
          </Link>
        </div>

      </div>
    );
  }

  // RENDERIZADO DEL FORMULARIO (Pantalla 03) - Se muestra si reservaConfirmada es false
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'left' }}>
      <h2 style={{ color: '#1e3d6b', marginBottom: '40px', fontWeight: 'bold' }}>
        Confirmar Reserva
      </h2>

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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ color: '#1e3d6b', margin: 0, fontSize: '22px' }}>Salón A-101</h3>
            <div>
              <span style={{ backgroundColor: '#e6f4ff', color: '#0958d9', padding: '4px 15px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                Salón
              </span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e4e7', marginTop: '10px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Fecha de reserva</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', outline: 'none' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Hora de inicio</label>
  <input 
    type="time" 
    value={horaInicio} 
    onChange={(e) => setHoraInicio(e.target.value)} // <-- Línea corregida aquí
    style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', outline: 'none' }} 
    required 
  />
</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Hora de finalización</label>
            <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #e3e3e3', backgroundColor: '#f5f5f5', outline: 'none' }} required />
          </div>

          <div style={{ color: '#e0533c', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0' }}>
            <span>Este horario ya está reservado para el recurso seleccionado</span>
          </div>

          <button type="submit" style={{ backgroundColor: '#1e3d6b', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
            Confirmar Reserva
          </button>

          <button type="button" onClick={() => window.history.back()} style={{ backgroundColor: 'transparent', color: '#e0533c', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '5px' }}>
            CANCELAR
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioReserva;