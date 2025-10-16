import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import CapacidadFormadora from './pages/CapacidadFormadora';
import SolicitudCupos from './pages/SolicitudCupos';
import GestionAlumnos from './pages/GestionAlumnos';
import ControlAsistencia from './pages/ControlAsistencia';
import Retribuciones from './pages/Retribuciones';
import GestionDocumental from './pages/GestionDocumental';
import ReportesEstrategicos from './pages/ReportesEstrategicos';

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de login como página principal */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard y páginas protegidas */}
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="capacidad-formadora" element={<CapacidadFormadora />} />
          <Route path="solicitud-cupos" element={<SolicitudCupos />} />
          <Route path="gestion-alumnos" element={<GestionAlumnos />} />
          <Route path="control-asistencia" element={<ControlAsistencia />} />
          <Route path="retribuciones" element={<Retribuciones />} />
          <Route path="gestion-documental" element={<GestionDocumental />} />
          <Route path="reportes-estrategicos" element={<ReportesEstrategicos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
