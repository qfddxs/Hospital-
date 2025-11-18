const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-sky-100 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sky-200 dark:divide-gray-700">
          <thead style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(20, 184, 166, 0.08) 50%, rgba(167, 139, 250, 0.08) 100%)',
            borderBottom: '2px solid rgba(14, 165, 233, 0.2)'
          }}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-4 text-left text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider"
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-sky-100 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No hay datos para mostrar</p>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">Agrega un nuevo registro para comenzar</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-all duration-200 ease-in-out border-l-4 border-transparent
                    ${onRowClick ? 'cursor-pointer hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-mint-50/50 dark:hover:from-sky-900/10 dark:hover:to-mint-900/10 hover:border-l-sky-500 hover:shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gradient-to-r from-sky-50/20 to-transparent dark:from-gray-700/20 dark:to-transparent'}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`
                        px-4 py-4 text-sm text-gray-700 dark:text-gray-300
                        ${column.wrap !== false ? '' : 'whitespace-nowrap'}
                      `}
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

