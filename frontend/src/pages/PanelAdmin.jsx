import React from 'react';

// Datos simulados exactos a tu wireframe de administración
const reservacionesAdminBD = [
  { código: 'RES-A3F2-20261015', recurso: 'Salón A-101', usuario: 'Mario Macario', fecha: '15/10/2026', horario: '08:00 - 10:00', estado: 'Activa' },
  { código: 'RES-B7C1-20261010', recurso: 'Laboratorio de Cómputo 1', usuario: 'Milton Meren', fecha: '10/10/2026', horario: '14:00 - 16:00', estado: 'Cancelada' },
  { código: 'RES-C9D4-20261020', recurso: 'Proyector HD-03', usuario: 'Rodrigo Galindo', fecha: '20/10/2026', horario: '10:00 - 11:00', estado: 'Activa' },
];

function PanelAdmin() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'left' }}>
      
      {/* Título del Panel */}
      <h2 style={{ color: '#1e3d6b', marginBottom: '30px', fontWeight: 'bold' }}>
        Panel de Administración
      </h2>

      {/* Barra de Filtros Superiores */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        flexWrap: 'wrap', 
        marginBottom: '30px',
        alignItems: 'center'
      }}>
        {['Filtrar por recurso', 'Filtrar por estado', 'Filtrar por fecha', 'Filtrar por Usuario'].map((filtro) => (
          <select key={filtro} style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid #e3e3e3',
            backgroundColor: '#f5f5f5',
            color: '#666',
            minWidth: '160px',
            outline: 'none'
          }}>
            <option>{filtro}</option>
          </select>
        ))}
      </div>

      {/* Tabla de Reservaciones Globales */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Código', 'Recurso', 'Usuario', 'Fecha', 'Horario', 'Estado', 'Acciones'].map((header) => (
                <th key={header} style={{ 
                  padding: '15px', 
                  color: '#555', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e5e4e7',
                  textAlign: header === 'Acciones' ? 'center' : 'left'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {reservacionesAdminBD.map((reserva, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                
                {/* Código */}
                <td style={{ padding: '18px 15px', color: '#1e3d6b', fontWeight: 'bold', fontSize: '14px' }}>
                  {reserva.código}
                </td>
                
                {/* Recurso */}
                <td style={{ padding: '18px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.recurso}
                </td>

                {/* Usuario Solicitante */}
                <td style={{ padding: '18px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.usuario}
                </td>
                
                {/* Fecha */}
                <td style={{ padding: '18px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.fecha}
                </td>
                
                {/* Horario */}
                <td style={{ padding: '18px 15px', color: '#333', fontSize: '14px' }}>
                  {reserva.horario}
                </td>
                
                {/* Estado */}
                <td style={{ padding: '18px 15px' }}>
                  <span style={{ 
                    backgroundColor: reserva.estado === 'Activa' ? '#e6fffa' : '#fff5f5', 
                    color: reserva.estado === 'Activa' ? '#2c7a7b' : '#c53030',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'inline-block'
                  }}>
                    {reserva.estado}
                  </span>
                </td>

                {/* Acciones de Administrador */}
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                    
                    {reserva.estado === 'Activa' && (
                      <button style={{
                        backgroundColor: '#fff5f5',
                        color: '#c53030',
                        border: '1px solid #fed7d7',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}>
                        Cancelar
                      </button>
                    )}

                    <button style={{
                      backgroundColor: '#e6f4ff',
                      color: '#0958d9',
                      border: '1px solid #bae7ff',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Ver Historial
                    </button>
                    
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Paginación Inferior */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '30px', 
        fontSize: '14px', 
        color: '#888',
        marginTop: '10px'
      }}>
        <span>Mostrando 3 de 24 reservaciones</span>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ border: 'none', background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>&lt;</button>
          <button style={{ border: 'none', background: '#1e3d6b', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>1</button>
          <button style={{ border: 'none', background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>&gt;</button>
        </div>
      </div>

    </div>
  );
}

export default PanelAdmin;