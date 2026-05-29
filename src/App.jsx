import { useState } from 'react';
import EmployeePanel from './components/EmployeePanel';
import ShiftForm from './components/ShiftForm';
import WeekGrid from './components/WeekGrid';

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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
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
      <WeekGrid
        employees={employees}
        shifts={shifts}
      />
    </div>
  );
}

export default App;