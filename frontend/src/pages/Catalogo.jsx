import React from 'react';
import TarjetaRecurso from '../components/TarjetaRecurso';

// Simulación de los datos del catálogo
const recursosBD = [
  { id: 1, nombre: 'Salón A-101', tipo: 'Salón', capacidad: '30 personas', ubicacion: 'Edificio A, Nivel 1', disponible: true },
  { id: 2, nombre: 'Laboratorio de Cómputo 1', tipo: 'Laboratorio', capacidad: '25 personas', ubicacion: 'Edificio B, Nivel 2', disponible: true },
  { id: 3, nombre: 'Proyector HD-03', tipo: 'Equipo', capacidad: 'Equipo audiovisual', ubicacion: 'Bodega Central', disponible: false },
];

function Catalogo() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#ffffff', minHeight: '100vh' }}>
      
      <h2 style={{ color: '#1e3d6b', textAlign: 'left', marginBottom: '30px', fontWeight: 'bold' }}>
        Reservar un Recurso
      </h2>

      {/* Barra de Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        flexWrap: 'wrap', 
        marginBottom: '40px',
        alignItems: 'center'
      }}>
        {['Tipo de recurso', 'Ubicación', 'Seleccionar fecha', 'Seleccionar hora'].map((filtro) => (
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
        
        <button style={{
          backgroundColor: '#1e3d6b',
          color: 'white',
          border: 'none',
          padding: '10px 25px',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Buscar
        </button>
      </div>

      {/* Contenedor de las Tarjetas alineado */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'nowrap', // Impide que se bajen las tarjetas si el espacio es un poco justo
        justifyContent: 'flex-start',
        overflowX: 'auto' // Por si la pantalla es muy pequeña, añade scroll horizontal en lugar de romper el diseño
      }}>
        {recursosBD.map((recurso) => (
          <TarjetaRecurso
            key={recurso.id}
            nombre={recurso.nombre}
            tipo={recurso.tipo}
            capacidad={recurso.capacidad}
            ubicacion={recurso.ubicacion}
            disponible={recurso.disponible}
          />
        ))}
      </div>

    </div>
  );
}

export default Catalogo;