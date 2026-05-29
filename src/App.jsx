import { useState } from 'react';
import EmployeePanel from './components/EmployeePanel';

function App() {
  const [employees, setEmployees] = useState([]);

  const handleAddEmployee = ({ name, roles }) => {
    const newEmployee = { id: Date.now(), name, roles };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const handleEditEmployee = (id, { name, roles }) => {
    setEmployees(prev =>
      prev.map(emp => emp.id === id ? { ...emp, name, roles } : emp)
    );
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Shift Roster Builder</h1>
      <EmployeePanel
        employees={employees}
        onAdd={handleAddEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
}

export default App;