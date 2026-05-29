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

    if (!employeeId) {
      setError('請選擇員工');
      return;
    }
    if (startTime >= endTime) {
      setError('開始時間必須早於結束時間');
      return;
    }

    onAddShift({
      id: Date.now(),
      employeeId: Number(employeeId),
      day,
      startTime,
      endTime,
    });

    setEmployeeId('');
    setDay('Mon');
    setStartTime('09:00');
    setEndTime('17:00');
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}>
      <h2>新增排班</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>員工：</label>
          <select
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">-- 請選擇 --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label>星期：</label>
          <select
            value={day}
            onChange={e => setDay(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            {DAYS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label>開始時間：</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label>結束時間：</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>
        )}

        <button type="submit" style={{ marginTop: '0.5rem' }}>新增班表</button>
      </form>
    </div>
  );
}

export default ShiftForm;