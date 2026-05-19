import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Tus importaciones actuales
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';

// Nuevas importaciones para completar la secuencia de la tarea
import FormularioReserva from './pages/FormularioReserva';
import MisReservaciones from './pages/MisReservaciones';
import ConsultarCodigo from './pages/ConsultarCodigo';
import PanelAdmin from './pages/PanelAdmin';
import GestionRecursos from './pages/GestionRecursos';
import ExportarCSV from './pages/ExportarCSV';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        
        {/* Barra de Navegación con todos los accesos directos para evaluar las rutas */}
        <nav style={{ 
          padding: '15px', 
          background: '#1a1a1a', 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <Link to="/" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>Acceso (Login)</Link>
          <Link to="/Catalogo" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>Catálogo</Link>
          <Link to="/reservar" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>03 - Formulario</Link>
          <Link to="/mis-reservaciones" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>05 - Mis Reservas</Link>
          <Link to="/consultar" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>06 - Buscar Código</Link>
          <Link to="/admin" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>07 - Panel Admin</Link>
          <Link to="/admin/recursos" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>08 - Recursos</Link>
          <Link to="/admin/reportes" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>09 - Exportar CSV</Link>
        </nav>

        {/* Declaración oficial de rutas del Sistema de Gestión de Reservas */}
        <Routes>
          {/* Tus rutas iniciales */}
          <Route path="/" element={<Login />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          
          {/* Nuevas rutas agregadas */}
          <Route path="/reservar" element={<FormularioReserva />} />
          <Route path="/mis-reservaciones" element={<MisReservaciones />} />
          <Route path="/consultar" element={<ConsultarCodigo />} />
          <Route path="/admin" element={<PanelAdmin />} />
          <Route path="/admin/recursos" element={<GestionRecursos />} />
          <Route path="/admin/reportes" element={<ExportarCSV />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;