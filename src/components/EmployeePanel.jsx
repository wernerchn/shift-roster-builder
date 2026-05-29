import { useState } from 'react';

function EmployeePanel({ employees, onAdd, onEdit, onDelete }) {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const rolesArray = roles.split(',').map(r => r.trim()).filter(Boolean);
    if (editingId !== null) {
      onEdit(editingId, { name: name.trim(), roles: rolesArray });
      setEditingId(null);
    } else {
      onAdd({ name: name.trim(), roles: rolesArray });
    }
    setName('');
    setRoles('');
  };

  const handleEditClick = (emp) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRoles(emp.roles.join(', '));
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setRoles('');
  };

  return (
    <div style={cardStyle}>
      <h2>👤 員工管理</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名" style={{ flex: '1', minWidth: '120px' }} />
        <input value={roles} onChange={e => setRoles(e.target.value)} placeholder="角色（逗號分隔，如：Cashier, Cook）" style={{ flex: '2', minWidth: '200px' }} />
        <button type="submit" className="btn-primary">{editingId !== null ? '儲存' : '新增員工'}</button>
        {editingId !== null && <button type="button" className="btn-secondary" onClick={handleCancel}>取消</button>}
      </form>

      {employees.length === 0 && <p style={{ color: '#a0aec0' }}>尚未新增員工</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {employees.map(emp => (
          <li key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #edf2f7' }}>
            <span style={{ flex: 1 }}><strong>{emp.name}</strong> <span style={{ color: '#718096', fontSize: '0.85rem' }}>[{emp.roles.join(', ')}]</span></span>
            <button className="btn-secondary" onClick={() => handleEditClick(emp)}>編輯</button>
            <button className="btn-danger" onClick={() => onDelete(emp.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cardStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

export default EmployeePanel;