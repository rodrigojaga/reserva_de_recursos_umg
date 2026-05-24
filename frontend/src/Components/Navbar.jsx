import { Link } from 'react-router-dom';

function Navbar({ usuario, esAdmin }) {
  return (
    <header style={{
      backgroundColor: '#1e3d6b',
      color: 'white',
      padding: '12px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      width: '100%'
    }}>
      {/* Si esAdmin es true, dice "Gestor de Reservas - Admin" */}
      <h3 style={{ margin: 0, fontWeight: 'bold' }}>
        Gestor de Reservas {esAdmin ? ' - Admin' : ''}
      </h3>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' }}>
        <span>{usuario || "Invitado"}</span>
        <span style={{ color: '#ccc' }}>|</span>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Cerrar Sesión</Link>
      </div>
    </header>
  );
}

export default Navbar;