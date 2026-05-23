import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Tu barra azul oficial

// Importaciones de tus páginas
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import FormularioReserva from './pages/FormularioReserva';
import MisReservaciones from './pages/MisReservaciones';
import ConsultarCodigo from './pages/ConsultarCodigo';
import PanelAdmin from './pages/PanelAdmin';
import GestionRecursos from './pages/GestionRecursos';
import ExportarCSV from './pages/ExportarCSV';

function App() {
  return (
    <Router>
      {/* 1. Al poner el Navbar oficial aquí, se verá la barra azul en todo el sitio */}
      <Navbar usuario="USER" />

      {/* 2. Las rutas se encargarán de llenar el resto de la pantalla limpia */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Catalogo" element={<Catalogo />} />
        <Route path="/reservar" element={<FormularioReserva />} />
        <Route path="/mis-reservaciones" element={<MisReservaciones />} />
        <Route path="/consultar" element={<ConsultarCodigo />} />
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/admin/recursos" element={<GestionRecursos />} />
        <Route path="/admin/reportes" element={<ExportarCSV />} />
      </Routes>
    </Router>
  );
}

export default App;