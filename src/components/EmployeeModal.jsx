import { useState } from 'react';

export default function EmployeeModal({ mode, emp, onSave, onDelete, onClose }) {
  const [name, setName] = useState(emp?.name || '');
  const [roles, setRoles] = useState(emp?.roles?.join(', ') || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), roles: roles.split(',').map(r => r.trim()).filter(Boolean) });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ padding: 28, minWidth: 340 }}>
        <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '1.05rem' }}>{mode === 'add' ? '＋ Add Employee' : '✏️ Edit Employee'}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alice" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Roles (comma-separated)</label>
            <input value={roles} onChange={e => setRoles(e.target.value)} placeholder="e.g. Cashier, Cook" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleSave} style={{ flex: 1, background: '#6366F1', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', cursor: 'pointer' }}>Cancel</button>
        </div>

        {onDelete && (
          <button onClick={onDelete} style={{ width: '100%', marginTop: 10, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            🗑 Remove Employee
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 6 };