import { useState } from 'react';
import EmployeePanel from './components/EmployeePanel';
import ShiftForm from './components/ShiftForm';

function App() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const handleAddEmployee = ({ name, roles }) => {
    setEmployees(prev => [...prev, { id: Date.now(), name, roles }]);
  };

  const handleEditEmployee = (id, { name, roles }) => {
    setEmployees(prev =>
      prev.map(emp => emp.id === id ? { ...emp, name, roles } : emp)
    );
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setShifts(prev => prev.filter(s => s.employeeId !== id));
  };

  const handleAddShift = (shift) => {
    setShifts(prev => [...prev, shift]);
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
      <ShiftForm
        employees={employees}
        onAddShift={handleAddShift}
      />
      <p style={{ color: '#888', marginTop: '1rem' }}>
        已記錄班表：{shifts.length} 筆
      </p>
    </div>
  );
}

export default App;