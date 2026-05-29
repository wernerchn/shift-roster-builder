import { useState } from 'react';
import { formatBlockedDate } from '../utils/availabilityHelpers';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EmployeeModal({ mode, emp, onSave, onDelete, onClose }) {
  const [name, setName] = useState(emp?.name || '');
  const [rolesStr, setRolesStr] = useState(emp?.roles?.join(', ') || '');
  const [unavailableDays, setUnavailableDays] = useState(emp?.unavailableDays || []);
  const [unavailableDates, setUnavailableDates] = useState(emp?.unavailableDates || []);
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState('');

  const toggleDay = day =>
    setUnavailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const addDate = () => {
    if (!dateInput || unavailableDates.includes(dateInput)) return;
    setUnavailableDates(prev => [...prev, dateInput].sort());
    setDateInput('');
  };

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    const roles = rolesStr.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 0) { setError('At least one role is required'); return; }
    onSave({ name: name.trim(), roles, unavailableDays, unavailableDates });
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
      <div className="card" style={{
        padding: 28, minWidth: 400, maxWidth: 460,
        width: '90%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#1A202C', fontSize: '1rem', fontWeight: 700 }}>
          {mode === 'add' ? 'Add Employee' : 'Edit Employee'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={labelStyle}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Alice" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Roles (comma separated)</label>
            <input type="text" value={rolesStr} onChange={e => setRolesStr(e.target.value)}
              placeholder="e.g. Cashier, Cook" style={inputStyle} />
          </div>

          {/* Recurring weekdays */}
          <div>
            <label style={labelStyle}>Recurring Unavailable Days</label>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#A0AEC0' }}>Always off on these weekdays</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_DAYS.map(day => {
                const on = unavailableDays.includes(day);
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem',
                    fontWeight: on ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s',
                    border: on ? '1px solid #FECACA' : '1px solid #E2E8F0',
                    background: on ? '#FEF2F2' : '#F7F8FA',
                    color: on ? '#DC2626' : '#4A5568',
                  }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific dates */}
          <div>
            <label style={labelStyle}>Specific Unavailable Dates</label>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#A0AEC0' }}>One-off dates (leave, holiday)</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={addDate} disabled={!dateInput} style={{
                background: dateInput ? '#EBF4FF' : '#F7F8FA',
                border: `1px solid ${dateInput ? '#BFDBFE' : '#E2E8F0'}`,
                color: dateInput ? '#2563EB' : '#A0AEC0',
                borderRadius: 8, padding: '8px 14px',
                cursor: dateInput ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
              }}>
                + Add
              </button>
            </div>
            {unavailableDates.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {unavailableDates.map(d => (
                  <div key={d} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#FFFBEB', border: '1px solid #FDE68A',
                    borderRadius: 8, padding: '5px 10px',
                  }}>
                    <span style={{ fontSize: '0.82rem', color: '#92400E' }}>📅 {formatBlockedDate(d)}</span>
                    <button type="button" onClick={() => setUnavailableDates(p => p.filter(x => x !== d))}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSave} style={primaryBtnStyle}>
            {mode === 'add' ? 'Add Employee' : 'Save Changes'}
          </button>
          <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
        </div>

        {mode === 'edit' && onDelete && (
          <button onClick={onDelete} style={{
            marginTop: 10, width: '100%',
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#DC2626', borderRadius: 8, padding: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>
            Remove Employee
          </button>
        )}
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
};
const primaryBtnStyle = {
  flex: 1, background: '#4A90E2', color: 'white', border: 'none',
  borderRadius: 8, padding: '10px', fontWeight: 600,
  cursor: 'pointer', fontSize: '0.875rem',
};
const secondaryBtnStyle = {
  flex: 1, background: '#F7F8FA', color: '#4A5568',
  border: '1px solid #E2E8F0', borderRadius: 8,
  padding: '10px', cursor: 'pointer', fontSize: '0.875rem',
};