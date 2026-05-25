import React from 'react';

// Datos de prueba basados en el inventario real de tus wireframes
const recursosAdminBD = [
  { id: 1, nombre: 'Salón A-101', tipo: 'Salón', capacidad: '30 personas', ubicacion: 'Edificio A, Nivel 1' },
  { id: 2, nombre: 'Laboratorio de Cómputo 1', tipo: 'Laboratorio', capacidad: '25 personas', ubicacion: 'Edificio B, Nivel 2' },
  { id: 3, nombre: 'Proyector HD-03', tipo: 'Equipo', capacidad: 'Equipo audiovisual', ubicacion: 'Bodega Central' },
];

function GestionRecursos() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh', textAlign: 'left' }}>
      
      {/* Encabezado: Título y Botón Superior Derecho */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #e5e4e7', 
        paddingBottom: '20px',
        marginBottom: '30px' 
      }}>
        <h2 style={{ color: '#1e3d6b', margin: 0, fontWeight: 'bold' }}>
          Gestión de Recursos
        </h2>
        
        <button style={{
          backgroundColor: '#1e3d6b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          + Agregar Recurso
        </button>
      </div>

      {/* Tabla de Inventario de Recursos */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          
          {/* Encabezado Gris Claro de la Tabla */}
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Nombre del Recurso', 'Tipo', 'Capacidad', 'Ubicación', 'Acciones'].map((header) => (
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

          {/* Filas con los recursos registrados */}
          <tbody>
            {recursosAdminBD.map((recurso) => (
              <tr key={recurso.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                
                {/* Nombre resaltado en el Azul Institucional */}
                <td style={{ padding: '20px 15px', color: '#1e3d6b', fontWeight: 'bold', fontSize: '14px' }}>
                  {recurso.nombre}
                </td>
                
                {/* Tipo de recurso */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {recurso.tipo}
                </td>
                
                {/* Capacidad */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {recurso.capacidad}
                </td>
                
                {/* Ubicación */}
                <td style={{ padding: '20px 15px', color: '#333', fontSize: '14px' }}>
                  {recurso.ubicacion}
                </td>
                
                {/* Celda de Acciones: Editar y Eliminar */}
                <td style={{ padding: '20px 15px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    
                    {/* Botón Editar (Azul claro con borde sutil) */}
                    <button style={{
                      backgroundColor: '#e6f4ff',
                      color: '#0958d9',
                      border: '1px solid #bae7ff',
                      borderRadius: '6px',
                      padding: '6px 16px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Editar
                    </button>

                    {/* Botón Eliminar (Rojo suave/rosa con borde sutil) */}
                    <button style={{
                      backgroundColor: '#fff5f5',
                      color: '#c53030',
                      border: '1px solid #fed7d7',
                      borderRadius: '6px',
                      padding: '6px 16px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Eliminar
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer de la tabla: Conteo de recursos totales */}
      <div style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
        <span>Total: 3 recursos registrados</span>
      </div>

    </div>
  );
}

export default GestionRecursos;