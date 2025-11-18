import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen transition-colors duration-200" style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 50%, #faf5ff 100%)',
    }}>
      <style>{`
        .dark .min-h-screen {
          background: linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e1b4b 100%) !important;
        }
      `}</style>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

