import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NavbarUsuario, NavbarAdmin } from './components/Navbar'; // Importación de las dos barras independientes

// Importaciones de tus páginas
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import FormularioReserva from './pages/FormularioReserva';
import MisReservaciones from './pages/MisReservaciones';
import ConsultarCodigo from './pages/ConsultarCodigo';
import PanelAdmin from './pages/PanelAdmin';
import GestionRecursos from './pages/GestionRecursos';
import ExportarCSV from './pages/ExportarCSV';

function ContenidoApp() {
  const location = useLocation();
  
  // Evaluamos en qué entorno estamos parados
  const esRutaAdmin = location.pathname.startsWith('/admin');
  const esLogin = location.pathname === '/';

  return (
    <>
      
      {!esLogin && (
        esRutaAdmin 
          ? <NavbarAdmin usuario="Administrador" /> 
          : <NavbarUsuario usuario="User" />
      )}

      <Routes>
        {/* Pantalla de Entrada */}
        <Route path="/" element={<Login />} />
        
        {/* Entorno del Usuario Regular */}
        <Route path="/Catalogo" element={<Catalogo />} />
        <Route path="/reservar" element={<FormularioReserva />} />
        <Route path="/mis-reservaciones" element={<MisReservaciones />} />
        <Route path="/consultar" element={<ConsultarCodigo />} />
        
        {/* Entorno del Administrador */}
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/admin/recursos" element={<GestionRecursos />} />
        <Route path="/admin/reportes" element={<ExportarCSV />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ContenidoApp />
    </Router>
  );
}

export default App;