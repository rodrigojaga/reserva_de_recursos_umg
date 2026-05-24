import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';

// Tus importaciones de páginas
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import FormularioReserva from './pages/FormularioReserva';
import MisReservaciones from './pages/MisReservaciones';
import ConsultarCodigo from './pages/ConsultarCodigo';
import PanelAdmin from './pages/PanelAdmin';
import GestionRecursos from './pages/GestionRecursos';
import ExportarCSV from './pages/ExportarCSV';

// Creamos un componente intermedio para leer la URL actual de la página
function ContenidoApp() {
  const location = useLocation();
  
  // Si la URL empieza con "/admin", sabemos que el usuario es Byron Caal
  const esRutaAdmin = location.pathname.startsWith('/admin');
  const nombreUsuario = esRutaAdmin ? "Administrador" : "USER";

  return (
    <>
      {/* El Navbar cambia de nombre y título según la página actual */}
      <Navbar usuario={nombreUsuario} esAdmin={esRutaAdmin} />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Catalogo" element={<Catalogo />} />
        <Route path="/reservar" element={<FormularioReserva />} />
        <Route path="/mis-reservaciones" element={<MisReservaciones />} />
        <Route path="/consultar" element={<ConsultarCodigo />} />
        
        {/* Rutas de Administración */}
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