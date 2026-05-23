import { Link } from 'react-router-dom';

function Navbar({ usuario }) {
  return (
    <header style={{
      backgroundColor: '#1e3d6b', // Azul marino de tu diseño
      color: 'white',
      padding: '12px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ margin: 0, fontWeight: 'bold' }}>Gestor de Reservas</h3>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' }}>
        <span>{usuario || "Invitado"}</span>
        <span style={{ color: '#ccc' }}>|</span>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Cerrar Sesión</Link>
      </div>
    </header>
  );
}

export default Navbar;