import { useState, useEffect } from 'react';
import { getEmployeeConflicts } from '../utils/conflictUtils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ShiftModal({ employees, shifts, prefill, onSave, onClose }) {
  const [employeeId, setEmployeeId] = useState(prefill?.employeeId ? String(prefill.employeeId) : '');
  const [day, setDay] = useState(prefill?.day || 'Mon');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const previewShift = employeeId ? { id: 'preview', employeeId: Number(employeeId), day, startTime, endTime } : null;
  const previewConflict = previewShift ? (() => {
    const tempShifts = [...shifts, previewShift];
    const { overlapShiftIds } = getEmployeeConflicts(Number(employeeId), tempShifts);
    return overlapShiftIds.has('preview');
  })() : false;

  const handleSave = () => {
    if (!employeeId) { setError('Please select an employee'); return; }
    if (startTime >= endTime) { setError('Start time must be before end time'); return; }
    onSave({ employeeId: Number(employeeId), day, startTime, endTime });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ padding: 28, minWidth: 360, maxWidth: 420 }}>
        <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '1.05rem' }}>📅 Add Shift</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Employee', el: <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} style={inputStyle}><option value="">-- Select --</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select> },
            { label: 'Day', el: <select value={day} onChange={e => setDay(e.target.value)} style={inputStyle}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select> },
            { label: 'Start Time', el: <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} /> },
            { label: 'End Time', el: <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} /> },
          ].map(({ label, el }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{label}</label>
              {el}
            </div>
          ))}
        </div>

        {previewConflict && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.82rem' }}>
            ⚠️ This shift overlaps with an existing shift
          </div>
        )}
        {error && <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSave} style={{ flex: 1, background: '#6366F1', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, cursor: 'pointer' }}>Save Shift</button>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };