import { useState } from 'react';
import { getEmployeeConflicts } from '../utils/conflictUtils';
import { toISODate, addDays } from '../utils/dateHelpers';
import { isUnavailable } from '../utils/availabilityHelpers';

export default function ShiftModal({ employees, shifts, prefill, onSave, onClose }) {
  const defaultDate = prefill?.date || toISODate(new Date());
  const [employeeId, setEmployeeId] = useState(prefill?.employeeId ? String(prefill.employeeId) : '');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const selectedEmp = employees.find(e => e.id === Number(employeeId));
  const isMidnightCross = startTime && endTime && startTime > endTime;
  const unavailableWarning = selectedEmp && isUnavailable(selectedEmp, date)
    ? `${selectedEmp.name} is marked unavailable on ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}s`
    : null;

  const previewConflict = (() => {
    if (!employeeId || isMidnightCross) return false;
    const preview = { id: 'preview', employeeId: Number(employeeId), date, startTime, endTime };
    const { overlapShiftIds } = getEmployeeConflicts(Number(employeeId), [...shifts, preview]);
    return overlapShiftIds.has('preview');
  })();

  const handleSave = () => {
    if (!employeeId) { setError('Please select an employee'); return; }
    if (startTime === endTime) { setError('Start and end time cannot be the same'); return; }
    const empId = Number(employeeId);
    if (startTime < endTime) {
      onSave({ employeeId: empId, date, startTime, endTime });
      return;
    }
    const nextDate = toISODate(addDays(new Date(date), 1));
    onSave([
      { employeeId: empId, date, startTime, endTime: '23:59' },
      { employeeId: empId, date: nextDate, startTime: '00:00', endTime },
    ]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,15,20,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card" style={{ padding: 28, minWidth: 360, maxWidth: 420, width: '90%' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1A202C', fontSize: '1rem', fontWeight: 700 }}>
          Add Shift
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Employee</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {unavailableWarning && (
          <div style={alertStyle('#FFFBEB', '#FDE68A', '#92400E')}>⚠️ {unavailableWarning}</div>
        )}
        {isMidnightCross && (
          <div style={alertStyle('#EFF6FF', '#BFDBFE', '#1E40AF')}>ℹ️ Crosses midnight — will be split into two shifts</div>
        )}
        {previewConflict && (
          <div style={alertStyle('#FEF2F2', '#FECACA', '#991B1B')}>⚠️ Overlaps with an existing shift</div>
        )}
        {error && <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSave} style={primaryBtnStyle}>Save Shift</button>
          <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.72rem', color: '#718096',
  fontWeight: 600, marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const inputStyle = {
  width: '100%', background: '#FFFFFF',
  border: '1px solid #CBD5E0', borderRadius: 8,
  padding: '8px 12px', color: '#1A202C', fontSize: '0.875rem',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
const primaryBtnStyle = {
  flex: 1, background: '#4A90E2', color: 'white', border: 'none',
  borderRadius: 8, padding: '10px', fontWeight: 600,
  cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.15s',
};
const secondaryBtnStyle = {
  flex: 1, background: '#F7F8FA', color: '#4A5568',
  border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '10px', cursor: 'pointer', fontSize: '0.875rem',
};
const alertStyle = (bg, border, text) => ({
  marginTop: 12, padding: '8px 12px',
  background: bg, border: `1px solid ${border}`,
  borderRadius: 8, color: text, fontSize: '0.8rem', lineHeight: 1.5,
});