JavaScript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// FUNCIÓN PARA EL ESTILO DE LAS PESTAÑAS ACTIVAS
const obtenerEstiloLink = (path, currentPath) => {
  const esActivo = currentPath === path;
  return {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: esActivo ? 'bold' : 'normal',
    borderBottom: esActivo ? '2px solid #ffffff' : '2px solid transparent',
    paddingBottom: '5px',
    transition: 'all 0.2s ease'
  };
};

// 1. NAVBAR EXCLUSIVO PARA USUARIOS 
export function NavbarUsuario({ usuario }) {
  const location = useLocation();
  return (
    <header style={{ backgroundColor: '#1e3d6b', color: 'white', fontFamily: 'sans-serif', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, fontWeight: 'bold' }}>Gestor de Reservas</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' }}>
          <strong>{usuario}</strong>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <Link to="/" style={{ color: '#ff7875', textDecoration: 'none', fontWeight: 'bold' }}>Cerrar Sesión</Link>
        </div>
      </div>
      <nav style={{ padding: '10px 40px', display: 'flex', gap: '30px', backgroundColor: '#162e52' }}>
        <Link to="/Catalogo" style={obtenerEstiloLink('/Catalogo', location.pathname)}>Catálogo</Link>
        <Link to="/mis-reservaciones" style={obtenerEstiloLink('/mis-reservaciones', location.pathname)}>Mis Reservas</Link>
        <Link to="/consultar" style={obtenerEstiloLink('/consultar', location.pathname)}>Buscar Código</Link>
      </nav>
    </header>
  );
}

// 2. NAVBAR EXCLUSIVO PARA ADMINISTRADORES 
export function NavbarAdmin({ usuario }) {
  const location = useLocation();
  return (
    <header style={{ backgroundColor: '#1e3d6b', color: 'white', fontFamily: 'sans-serif', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, fontWeight: 'bold' }}>Gestor de Reservas - Admin</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' }}>
          <strong>{usuario}</strong>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <Link to="/" style={{ color: '#ff7875', textDecoration: 'none', fontWeight: 'bold' }}>Cerrar Sesión</Link>
        </div>
      </div>
      <nav style={{ padding: '10px 40px', display: 'flex', gap: '30px', backgroundColor: '#162e52' }}>
        <Link to="/admin" style={obtenerEstiloLink('/admin', location.pathname)}>Panel Admin</Link>
        <Link to="/admin/recursos" style={obtenerEstiloLink('/admin/recursos', location.pathname)}>Recursos</Link>
        <Link to="/admin/reportes" style={obtenerEstiloLink('/admin/reportes', location.pathname)}>Exportar CSV</Link>
      </nav>
    </header>
  );
}