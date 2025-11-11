import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from './SessionContext';
import { supabase } from '../supabaseClient';

const UserRoleContext = createContext({
  userRole: null,
  centroFormadorId: null,
  isAdmin: false,
  isCentroFormador: false,
  loading: true,
});

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole debe usarse dentro de UserRoleProvider');
  }
  return context;
};

export const UserRoleProvider = ({ children }) => {
  const { user } = useSession();
  const [userRole, setUserRole] = useState(null);
  const [centroFormadorId, setCentroFormadorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setCentroFormadorId(null);
        setLoading(false);
        return;
      }

      try {
        // Obtener rol del usuario
        const { data, error } = await supabase
          .from('usuarios_centros')
          .select('rol, centro_formador_id')
          .eq('user_id', user.id)
          .eq('activo', true)
          .maybeSingle();

        if (error) {
          console.error('Error al consultar usuarios_centros:', error);
          setUserRole('admin');
          setCentroFormadorId(null);
        } else if (!data) {
          // Si no existe en usuarios_centros, es personal del hospital (admin)
          setUserRole('admin');
          setCentroFormadorId(null);
        } else {
          setUserRole(data.rol);
          setCentroFormadorId(data.centro_formador_id);
        }
      } catch (err) {
        console.error('Error al obtener rol:', err);
        setUserRole('admin'); // Por defecto admin si hay error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const value = {
    userRole,
    centroFormadorId,
    isAdmin: userRole === 'admin' || userRole === 'encargado_docencia',
    isCentroFormador: userRole === 'centro_formador',
    loading,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};
