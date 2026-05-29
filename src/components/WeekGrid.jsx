import { getEmployeeConflicts } from '../utils/conflictUtils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeekGrid({ employees, shifts, onDeleteShift }) {
  return (
    <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
      <h2>週班表</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={thStyle}>員工</th>
            {DAYS.map(day => (
              <th key={day} style={thStyle}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const { overlapShiftIds } = getEmployeeConflicts(emp.id, shifts);
            return (
              <tr key={emp.id}>
                <td style={tdStyle}>
                  <strong>{emp.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {emp.roles.join(', ')}
                  </div>
                </td>
                {DAYS.map(day => {
                  const dayShifts = shifts.filter(
                    s => s.employeeId === emp.id && s.day === day
                  );
                  return (
                    <td key={day} style={tdStyle}>
                      {dayShifts.map(shift => {
                        const isConflict = overlapShiftIds.has(shift.id);
                        return (
                          <div key={shift.id} style={{
                            ...shiftTagStyle,
                            background: isConflict ? '#e53e3e' : '#4a90e2',
                          }}>
                            <span>{shift.startTime}–{shift.endTime}</span>
                            <button
                              onClick={() => onDeleteShift(shift.id)}
                              style={{
                                marginLeft: '4px',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                padding: '0',
                              }}
                              title="刪除此班表"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {employees.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '1rem', color: '#aaa' }}>
                尚未新增員工
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { border: '1px solid #ccc', padding: '0.5rem 1rem', background: '#f0f0f0', textAlign: 'center' };
const tdStyle = { border: '1px solid #ccc', padding: '0.5rem', verticalAlign: 'top', minWidth: '80px' };
const shiftTagStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', borderRadius: '4px', padding: '2px 6px', fontSize: '0.8rem', marginBottom: '2px' };

export default WeekGrid;