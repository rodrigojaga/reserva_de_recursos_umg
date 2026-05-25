import React, { useState } from 'react';

function ExportarCSV() {
  // Estados para capturar los parámetros del reporte
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('');

  // Función simulada para exportar los datos
  const handleExportar = (e) => {
    e.preventDefault();
    console.log('Exportando reporte con:', { fechaInicio, fechaFin, tipoRecurso });
    alert(`Generando reporte CSV desde el ${fechaInicio} hasta el ${fechaFin}...`);
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'sans-serif', 
      background: '#ffffff', 
      minHeight: '100vh', 
      textAlign: 'left' 
    }}>
      
      {/* Título y descripción de la sección */}
      <h2 style={{ color: '#1e3d6b', marginBottom: '10px', fontWeight: 'bold' }}>
        Exportar Reportes
      </h2>
      <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px' }}>
        Selecciona el tipo de reporte y el rango de fechas a exportar
      </p>

      {/* Contenedor para centrar la tarjeta del formulario */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        
        <form onSubmit={handleExportar} style={{
          border: '1px solid #e5e4e7',
          borderRadius: '12px',
          padding: '40px',
          width: '520px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Encabezado interno de la tarjeta */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#1e3d6b', fontSize: '18px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
              Reservas por Rango de Fechas
            </h3>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
              Exportar todas las reservaciones registradas dentro de un período específico
            </p>
          </div>

          {/* Campo: Fecha inicio */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', width: '130px' }}>
              Fecha inicio
            </label>
            <input 
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                color: '#666',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Campo: Fecha fin */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', width: '130px' }}>
              Fecha fin
            </label>
            <input 
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                color: '#666',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Campo: Tipo de Recurso */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', width: '130px' }}>
              Tipo de Recurso
            </label>
            <select 
              value={tipoRecurso}
              onChange={(e) => setTipoRecurso(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #e3e3e3',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                color: '#666',
                outline: 'none',
                cursor: 'pointer'
              }}
              required
            >
              <option value="">Tipo de Recurso</option>
              <option value="Todos">Todos los Recursos</option>
              <option value="Salón">Salones</option>
              <option value="Laboratorio">Laboratorios</option>
              <option value="Equipo">Equipos</option>
            </select>
          </div>

          {/* Botón de Acción: Exportar CSV */}
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
              width: '100%',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(30,61,107,0.2)'
            }}
          >
            Exportar CSV
          </button>

        </form>
      </div>

    </div>
  );
}

export default ExportarCSV;