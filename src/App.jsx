import { useState, useEffect } from 'react';
import EmployeePanel from './components/EmployeePanel';
import ShiftForm from './components/ShiftForm';
import WeekGrid from './components/WeekGrid';
import SummaryPanel from './components/SummaryPanel';

function App() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem('shifts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

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

  const handleDeleteShift = (shiftId) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
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
      <ShiftForm employees={employees} onAddShift={handleAddShift} />
      <WeekGrid employees={employees} shifts={shifts} onDeleteShift={handleDeleteShift} />
      <SummaryPanel employees={employees} shifts={shifts} />
    </div>
  );
}

export default App;