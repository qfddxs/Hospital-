import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('training_center_id', user.id);

      if (error) throw error;
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from('students')
        .insert([{ full_name: fullName, email: email, training_center_id: user.id }]);

      if (error) throw error;

      // Limpiar formulario y recargar lista
      setFullName('');
      setEmail('');
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error.message);
    }
  };

  if (loading) {
    return <p>Cargando alumnos...</p>;
  }

  return (
    <div>
      <h1>Gestión de Alumnos</h1>

      <form onSubmit={handleAddStudent}>
        <h3>Añadir Nuevo Alumno</h3>
        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email del alumno"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Añadir Alumno</button>
      </form>

      <hr />

      <h3>Lista de Alumnos</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.full_name}</td>
              <td>{student.email}</td>
              <td>{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageStudents;