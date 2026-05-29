import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ShiftForm({ employees, onAddShift }) {
  const [employeeId, setEmployeeId] = useState('');
  const [day, setDay] = useState('Mon');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId) { setError('請選擇員工'); return; }
    if (startTime >= endTime) { setError('開始時間必須早於結束時間'); return; }
    onAddShift({ id: Date.now(), employeeId: Number(employeeId), day, startTime, endTime });
    setEmployeeId('');
    setDay('Mon');
    setStartTime('09:00');
    setEndTime('17:00');
  };

  return (
    <div style={cardStyle}>
      <h2>📅 新增排班</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>員工</label>
          <select value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
            <option value="">-- 請選擇 --</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>星期</label>
          <select value={day} onChange={e => setDay(e.target.value)}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>開始</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>結束</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>新增班表</button>
      </form>
      {error && <p style={{ color: '#e53e3e', marginTop: '0.5rem', fontSize: '0.9rem' }}>⚠️ {error}</p>}
    </div>
  );
}

const cardStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const labelStyle = { fontSize: '0.8rem', color: '#718096', fontWeight: '600' };

export default ShiftForm;