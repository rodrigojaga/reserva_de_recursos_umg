import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { NavbarUsuario, NavbarAdmin } from './components/Navbar';
import { useUsuario } from './context/UsuarioContext';

import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import FormularioReserva from './pages/FormularioReserva';
import MisReservaciones from './pages/MisReservaciones';
import ConsultarCodigo from './pages/ConsultarCodigo';
import PanelAdmin from './pages/PanelAdmin';
import GestionRecursos from './pages/GestionRecursos';
import ExportarCSV from './pages/ExportarCSV';

function ContenidoApp() {
  const location  = useLocation();
  const { usuario, esAdmin } = useUsuario();

  const esLogin   = location.pathname === '/';
  const esRutaAdmin = location.pathname.startsWith('/admin');

  // Si no hay usuario y no está en login, redirige al login
  if (!usuario && !esLogin) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario admin intentando entrar a rutas de usuario, redirige al admin
  if (usuario && esAdmin && !esRutaAdmin && !esLogin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {!esLogin && (
        esRutaAdmin
          ? <NavbarAdmin usuario={usuario?.nombre} />
          : <NavbarUsuario usuario={usuario?.nombre} />
      )}

      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rutas de usuario */}
        <Route path="/Catalogo"           element={<Catalogo />} />
        <Route path="/reservar"           element={<FormularioReserva />} />
        <Route path="/mis-reservaciones"  element={<MisReservaciones />} />
        <Route path="/consultar"          element={<ConsultarCodigo />} />

        {/* Rutas de admin */}
        <Route path="/admin"              element={<PanelAdmin />} />
        <Route path="/admin/recursos"     element={<GestionRecursos />} />
        <Route path="/admin/reportes"     element={<ExportarCSV />} />
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
