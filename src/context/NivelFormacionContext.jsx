import { createContext, useContext, useState, useEffect } from 'react';

const NivelFormacionContext = createContext();

export const useNivelFormacion = () => {
  const context = useContext(NivelFormacionContext);
  if (!context) {
    throw new Error('useNivelFormacion debe usarse dentro de NivelFormacionProvider');
  }
  return context;
};

export const NivelFormacionProvider = ({ children }) => {
  // Obtener el nivel guardado en localStorage o usar 'pregrado' por defecto
  const [nivelFormacion, setNivelFormacion] = useState(() => {
    const saved = localStorage.getItem('nivelFormacion');
    return saved || 'pregrado';
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('nivelFormacion', nivelFormacion);
  }, [nivelFormacion]);

  const toggleNivel = () => {
    setNivelFormacion(prev => prev === 'pregrado' ? 'postgrado' : 'pregrado');
  };

  return (
    <NivelFormacionContext.Provider value={{ nivelFormacion, setNivelFormacion, toggleNivel }}>
      {children}
    </NivelFormacionContext.Provider>
  );
};
