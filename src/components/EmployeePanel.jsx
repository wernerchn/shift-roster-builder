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
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>員工管理</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div>
          <label>姓名：</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：Alice"
            style={{ marginLeft: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <label>角色（用逗號分隔）：</label>
          <input
            value={roles}
            onChange={e => setRoles(e.target.value)}
            placeholder="例如：Cashier, Cook"
            style={{ marginLeft: '0.5rem' }}
          />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <button type="submit">{editingId !== null ? '儲存修改' : '新增員工'}</button>
          {editingId !== null && (
            <button type="button" onClick={handleCancel} style={{ marginLeft: '0.5rem' }}>
              取消
            </button>
          )}
        </div>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {employees.map(emp => (
          <li key={emp.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
            <strong>{emp.name}</strong>
            <span style={{ marginLeft: '0.5rem', color: '#666' }}>
              [{emp.roles.join(', ')}]
            </span>
            <button onClick={() => handleEditClick(emp)} style={{ marginLeft: '1rem' }}>編輯</button>
            <button onClick={() => onDelete(emp.id)} style={{ marginLeft: '0.5rem', color: 'red' }}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeePanel;