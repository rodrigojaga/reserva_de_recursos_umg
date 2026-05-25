import React from 'react';
import { useNavigate } from 'react-router-dom';

// Datos simulados fieles a tu wireframe
const misReservasBD = [
  { código: 'RES-A3F2-20261015', recurso: 'Salón A-101', fecha: '15/10/2026', horario: '08:00 - 10:00', estado: 'Activa' },
  { código: 'RES-B7C1-20261010', recurso: 'Laboratorio de Cómputo 1', fecha: '10/10/2026', horario: '14:00 - 16:00', estado: 'Cancelada' },
  { código: 'RES-C9D4-20261020', recurso: 'Proyector HD-03', fecha: '20/10/2026', horario: '10:00 - 11:00', estado: 'Activa' },
];

function MisReservaciones() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'left' }}>
      
      {/* Encabezado con Título y Botón de Nueva Reserva */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #e5e4e7', 
        paddingBottom: '20px',
        marginBottom: '30px' 
      }}>
        <h2 style={{ color: '#1e3d6b', margin: 0, fontWeight: 'bold' }}>
          Mis Reservaciones
        </h2>
        
        <button 
          onClick={() => navigate('/Catalogo')}
          style={{
            backgroundColor: '#1e3d6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          + Nueva Reserva
        </button>
      </div>

      {/* Estructura de la Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          
          {/* Encabezados grises del Wireframe */}
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Código', 'Recurso', 'Fecha', 'Horario', 'Estado'].map((header) => (
                <th key={header} style={{ 
                  padding: '15px', 
                  color: '#555', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e4e7'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Filas de la Tabla sin botones de Cancelar */}
          <tbody>
            {misReservasBD.map((reserva, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                
                {/* Código en azul */}
                <td style={{ padding: '20px 15px', color: '#1e3d6b', fontWeight: 'bold', fontSize: '14px' }}>
                  {reserva.código}
                </td>
                
                {/* Nombre del recurso */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.recurso}
                </td>
                
                {/* Fecha */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.fecha}
                </td>
                
                {/* Horario */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.horario}
                </td>
                
                {/* Estado con Badge de Color (Activa / Cancelada) */}
                <td style={{ padding: '20px 15px' }}>
                  <span style={{ 
                    backgroundColor: reserva.estado === 'Activa' ? '#e6fffa' : '#f5f5f5', 
                    color: reserva.estado === 'Activa' ? '#2c7a7b' : '#9ca3af',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'inline-block'
                  }}>
                    {reserva.estado}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default MisReservaciones;