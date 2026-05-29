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
    setUnavailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );

  const addDate = () => {
    if (!dateInput) return;
    if (unavailableDates.includes(dateInput)) return;
    setUnavailableDates(prev => [...prev, dateInput].sort());
    setDateInput('');
  };

  const removeDate = date =>
    setUnavailableDates(prev => prev.filter(d => d !== date));

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
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass" style={{
        padding: 28, minWidth: 400, maxWidth: 460,
        width: '90%', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '1.05rem' }}>
          {mode === 'add' ? '➕ Add Employee' : '✏️ Edit Employee'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alice"
              style={inputStyle}
            />
          </div>

          {/* Roles */}
          <div>
            <label style={labelStyle}>Roles (comma separated)</label>
            <input
              type="text"
              value={rolesStr}
              onChange={e => setRolesStr(e.target.value)}
              placeholder="e.g. Cashier, Cook"
              style={inputStyle}
            />
          </div>

          {/* Recurring unavailable weekdays */}
          <div>
            <label style={labelStyle}>Recurring Unavailable Days</label>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b' }}>
              Every week — e.g. always off on Mondays
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_DAYS.map(day => {
                const selected = unavailableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '5px 12px', borderRadius: 20,
                      border: selected
                        ? '1px solid rgba(239,68,68,0.6)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: selected
                        ? 'rgba(239,68,68,0.2)'
                        : 'rgba(255,255,255,0.05)',
                      color: selected ? '#fca5a5' : '#94a3b8',
                      fontSize: '0.8rem', fontWeight: selected ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {unavailableDays.length > 0 && (
              <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#fca5a5' }}>
                Every: {unavailableDays.join(', ')}
              </p>
            )}
          </div>

          {/* Specific unavailable dates */}
          <div>
            <label style={labelStyle}>Specific Unavailable Dates</label>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b' }}>
              One-off dates — e.g. public holiday or personal leave
            </p>

            {/* Date picker row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={addDate}
                disabled={!dateInput}
                style={{
                  background: dateInput ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: dateInput ? '#a5b4fc' : '#4b5563',
                  borderRadius: 8, padding: '8px 14px',
                  cursor: dateInput ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
                }}
              >
                ＋ Add
              </button>
            </div>

            {/* List of added dates */}
            {unavailableDates.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {unavailableDates.map(d => (
                  <div
                    key={d}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: 8, padding: '5px 10px',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: '#fcd34d' }}>
                      📅 {formatBlockedDate(d)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDate(d)}
                      style={{
                        background: 'transparent', border: 'none',
                        color: '#fca5a5', cursor: 'pointer',
                        fontSize: '0.8rem', padding: '0 4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {error && (
          <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: '12px 0 0' }}>{error}</p>
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
            {mode === 'add' ? 'Add Employee' : 'Save Changes'}
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

        {mode === 'edit' && onDelete && (
          <button
            onClick={onDelete}
            style={{
              marginTop: 10, width: '100%',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: 10, padding: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            🗑️ Remove Employee
          </button>
        )}
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