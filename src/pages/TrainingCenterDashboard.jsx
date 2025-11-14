import { NavLink, Outlet } from 'react-router-dom';
import './TrainingCenterDashboard.css'; // Crearemos este archivo para los estilos

function TrainingCenterDashboard() {
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h3>Centro Formador</h3>
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard-centro-formador/alumnos">
                Gestión de Alumnos
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard-centro-formador/asistencia">
                Asistencia
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard-centro-formador/cupos">
                Solicitud de Cupos
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-content">
        {/* El Outlet de React Router renderizará aquí el componente de la ruta hija */}
        <Outlet />
      </main>
    </div>
  );
}

export default TrainingCenterDashboard;