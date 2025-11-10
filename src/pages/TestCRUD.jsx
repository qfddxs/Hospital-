import { useState } from 'react';
import { supabase } from '../supabaseClient';

function TestCRUD() {
  const [nombre, setNombre] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testInsert = async () => {
    setError(null);
    setResult(null);
    
    console.log('Intentando insertar:', { nombre, activo: true });
    
    const { data, error } = await supabase
      .from('centros_formadores')
      .insert([{ nombre, activo: true }])
      .select();
    
    console.log('Respuesta completa:', { data, error });
    
    if (error) {
      setError(JSON.stringify(error, null, 2));
    } else {
      setResult(JSON.stringify(data, null, 2));
    }
  };

  const testSelect = async () => {
    setError(null);
    setResult(null);
    
    const { data, error } = await supabase
      .from('centros_formadores')
      .select('*');
    
    console.log('SELECT resultado:', { data, error });
    
    if (error) {
      setError(JSON.stringify(error, null, 2));
    } else {
      setResult(JSON.stringify(data, null, 2));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test CRUD Supabase</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block mb-2">Nombre del Centro:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Ej: Universidad de Chile"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testInsert}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test INSERT
          </button>
          
          <button
            onClick={testSelect}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test SELECT
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 p-4 rounded">
            <h3 className="font-bold text-red-800 mb-2">Error:</h3>
            <pre className="text-sm overflow-auto">{error}</pre>
          </div>
        )}
        
        {result && (
          <div className="bg-green-100 border border-green-400 p-4 rounded">
            <h3 className="font-bold text-green-800 mb-2">Resultado:</h3>
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCRUD;
