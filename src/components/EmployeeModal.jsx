import { useState } from 'react';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EmployeeModal({ mode, emp, onSave, onDelete, onClose }) {
  const [name, setName] = useState(emp?.name || '');
  const [rolesInput, setRolesInput] = useState(emp?.roles?.join(', ') || '');
  const [unavailableDays, setUnavailableDays] = useState(emp?.unavailableDays || []);
  const [unavailableDates, setUnavailableDates] = useState(emp?.unavailableDates || []);
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState('');

  const toggleDay = day => {
    setUnavailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addDate = () => {
    if (!dateInput) return;
    if (unavailableDates.includes(dateInput)) { setDateInput(''); return; }
    setUnavailableDates(prev => [...prev, dateInput].sort());
    setDateInput('');
  };

  const removeDate = d => setUnavailableDates(prev => prev.filter(x => x !== d));

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Name is required'); return; }
    const roles = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 0) { setError('At least one role is required'); return; }
    onSave({ name: trimmed, roles, unavailableDays, unavailableDates });
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,15,20,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card modal-box"
        style={{ padding: 28, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h3 style={{ margin: '0 0 20px', color: '#1A202C', fontSize: '1rem', fontWeight: 700 }}>
          {mode === 'add' ? 'Add Employee' : 'Edit Employee'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              style={inputStyle}
            />
          </div>

          {/* Roles */}
          <div>
            <label style={labelStyle}>Roles <span style={{ color: '#A0AEC0', fontWeight: 400, textTransform: 'none' }}>(comma separated)</span></label>
            <input
              type="text"
              value={rolesInput}
              onChange={e => setRolesInput(e.target.value)}
              placeholder="e.g. Cashier, Supervisor"
              style={inputStyle}
            />
          </div>

          {/* Unavailable Days */}
          <div>
            <label style={labelStyle}>Unavailable Days</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem',
                    fontWeight: 600, cursor: 'pointer', border: '1px solid',
                    fontFamily: 'inherit',
                    background: unavailableDays.includes(day) ? '#FEF3C7' : '#F7F8FA',
                    borderColor: unavailableDays.includes(day) ? '#FDE68A' : '#E2E8F0',
                    color: unavailableDays.includes(day) ? '#92400E' : '#718096',
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Unavailable Specific Dates */}
          <div>
            <label style={labelStyle}>Unavailable Specific Dates</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addDate}
                style={{
                  background: '#4A90E2', color: 'white',
                  border: 'none', borderRadius: 8,
                  padding: '8px 14px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                Add
              </button>
            </div>
            {unavailableDates.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {unavailableDates.map(d => (
                  <span key={d} style={{
                    background: '#FEF3C7', border: '1px solid #FDE68A',
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: '0.75rem', color: '#92400E',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {d}
                    <button
                      onClick={() => removeDate(d)}
                      style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#92400E',
                        padding: 0, fontSize: '0.7rem', lineHeight: 1,
                      }}
                    >✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={handleSave} style={primaryBtnStyle}>
            {mode === 'add' ? 'Add Employee' : 'Save Changes'}
          </button>
          <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
          {mode === 'edit' && onDelete && (
            <button
              onClick={() => { if (window.confirm(`Remove ${emp.name}?`)) onDelete(); }}
              style={deleteBtnStyle}
            >
              Delete
            </button>
          )}
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
  width: '100%', padding: '8px 12px',
  border: '1px solid #E2E8F0', borderRadius: 8,
  fontSize: '0.875rem', color: '#1A202C',
  background: '#F7F8FA', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const primaryBtnStyle = {
  flex: 1, background: '#4A90E2', color: 'white',
  border: 'none', borderRadius: 8, padding: '10px',
  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
  fontFamily: 'inherit', minWidth: 120,
};
const secondaryBtnStyle = {
  flex: 1, background: '#F7F8FA',
  border: '1px solid #E2E8F0', color: '#718096',
  borderRadius: 8, padding: '10px',
  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
  fontFamily: 'inherit', minWidth: 80,
};
const deleteBtnStyle = {
  background: '#FEF2F2', border: '1px solid #FECACA',
  color: '#DC2626', borderRadius: 8, padding: '10px 16px',
  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
  fontFamily: 'inherit',
};