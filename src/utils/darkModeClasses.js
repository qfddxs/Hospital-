// Clases comunes de dark mode para reutilizar en toda la aplicación

export const darkModeClasses = {
  // Contenedores y cards
  card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  
  // Texto
  textPrimary: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted: 'text-gray-500 dark:text-gray-500',
  
  // Inputs y formularios
  input: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500',
  inputFocus: 'focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-500 dark:focus:ring-teal-400',
  
  // Botones
  buttonPrimary: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white',
  buttonSecondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
  buttonDanger: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white',
  
  // Tablas
  tableHeader: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  tableRow: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
  tableBorder: 'border-gray-200 dark:border-gray-700',
  
  // Badges y etiquetas
  badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  badgeSuccess: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  badgeWarning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  badgeDanger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  badgeInfo: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  
  // Divisores
  divider: 'border-gray-200 dark:border-gray-700',
  
  // Modales y overlays
  modal: 'bg-white dark:bg-gray-800',
  overlay: 'bg-black bg-opacity-50 dark:bg-opacity-70',
  
  // Iconos
  icon: 'text-gray-500 dark:text-gray-400',
  iconHover: 'hover:text-gray-700 dark:hover:text-gray-200',
}

// Función helper para combinar clases
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
