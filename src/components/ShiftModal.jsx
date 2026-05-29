import { useState } from 'react';
import { getEmployeeConflicts } from '../utils/conflictUtils';
import { toISODate, addDays } from '../utils/dateHelpers';

export default function ShiftModal({ employees, shifts, prefill, onSave, onClose }) {
  const defaultDate = prefill?.date || toISODate(new Date());
  const [employeeId, setEmployeeId] = useState(
    prefill?.employeeId ? String(prefill.employeeId) : ''
  );
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const isMidnightCross = startTime !== '' && endTime !== '' && startTime > endTime;

  const previewConflict = (() => {
    if (!employeeId || isMidnightCross) return false;
    const preview = {
      id: 'preview',
      employeeId: Number(employeeId),
      date,
      startTime,
      endTime,
    };
    const { overlapShiftIds } = getEmployeeConflicts(
      Number(employeeId),
      [...shifts, preview]
    );
    return overlapShiftIds.has('preview');
  })();

  const handleSave = () => {
    if (!employeeId) {
      setError('Please select an employee');
      return;
    }
    if (startTime === endTime) {
      setError('Start and end time cannot be the same');
      return;
    }

    const empId = Number(employeeId);

    // 正常班（不跨午夜）
    if (startTime < endTime) {
      onSave({ employeeId: empId, date, startTime, endTime });
      return;
    }

    // 跨午夜：自動拆成兩段
    const nextDateISO = toISODate(addDays(new Date(date), 1));
    onSave([
      { employeeId: empId, date, startTime, endTime: '23:59' },
      { employeeId: empId, date: nextDateISO, startTime: '00:00', endTime },
    ]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass" style={{ padding: 28, minWidth: 360, maxWidth: 420, width: '90%' }}>
        <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '1.05rem' }}>
          📅 Add Shift
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Employee */}
          <div>
            <label style={labelStyle}>Employee</label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Select --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Start Time */}
          <div>
            <label style={labelStyle}>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* End Time */}
          <div>
            <label style={labelStyle}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={inputStyle}
            />
          </div>

        </div>

        {/* 跨午夜提示 */}
        {isMidnightCross && (
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 8, color: '#bfdbfe', fontSize: '0.82rem',
          }}>
            ℹ️ This shift crosses midnight — it will be split into two shifts automatically.
          </div>
        )}

        {/* 衝突預覽 */}
        {previewConflict && (
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#fca5a5', fontSize: '0.82rem',
          }}>
            ⚠️ This shift overlaps with an existing shift on this date
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: '8px 0 0' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, background: '#6366F1', color: 'white',
              border: 'none', borderRadius: 10, padding: '10px',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Save Shift
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'transparent', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '10px', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '0.78rem', color: '#64748b',
  fontWeight: 600, marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 12px',
  color: '#e2e8f0', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
  colorScheme: 'dark',
};