import { useState, useEffect } from 'react';
import { getEmployeeConflicts, calcTotalHours } from './utils/conflictUtils';
import ShiftModal from './components/ShiftModal';
import EmployeeModal from './components/EmployeeModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_LABEL = 'May 26 – Jun 1, 2026';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Avatar({ name, size = 32 }) {
  const colors = ['#6366F1','#22C55E','#F59E0B','#EC4899','#14B8A6','#8B5CF6'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: 'white', flexShrink: 0 }}>
      {initials(name)}
    </div>
  );
}

export default function App() {
  const [employees, setEmployees] = useState(() => JSON.parse(localStorage.getItem('employees') || '[]'));
  const [shifts, setShifts] = useState(() => JSON.parse(localStorage.getItem('shifts') || '[]'));
  const [shiftModal, setShiftModal] = useState(null);
  const [empModal, setEmpModal] = useState(null);
  const [highlightShiftId, setHighlightShiftId] = useState(null);

  useEffect(() => { localStorage.setItem('employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('shifts', JSON.stringify(shifts)); }, [shifts]);

  const addEmployee = (data) => setEmployees(p => [...p, { id: Date.now(), ...data }]);
  const editEmployee = (id, data) => setEmployees(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteEmployee = (id) => { setEmployees(p => p.filter(e => e.id !== id)); setShifts(p => p.filter(s => s.employeeId !== id)); };
  const addShift = (shift) => setShifts(p => [...p, { id: Date.now(), ...shift }]);
  const deleteShift = (id) => setShifts(p => p.filter(s => s.id !== id));

  const totalHours = employees.reduce((sum, emp) => sum + calcTotalHours(emp.id, shifts), 0);
  const hoursPerDay = DAYS.map(day => shifts.filter(s => s.day === day).reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return sum + (eh * 60 + em - sh * 60 - sm) / 60;
  }, 0));
  const maxDayHours = Math.max(...hoursPerDay, 1);

  const allConflicts = employees.flatMap(emp => {
    const { overlapShiftIds, consecutiveConflict } = getEmployeeConflicts(emp.id, shifts);
    const items = [];
    if (overlapShiftIds.size > 0) items.push({ emp, type: 'overlap', shiftIds: [...overlapShiftIds] });
    if (consecutiveConflict) items.push({ emp, type: 'consecutive' });
    return items;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F14', padding: '24px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>Shift Roster Builder</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Manage your weekly team schedule</p>
        </div>
        <button onClick={() => setEmpModal({ mode: 'add' })}
          style={{ background: '#6366F1', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          ＋ Add Employee
        </button>
      </div>

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto auto auto', gap: 16 }}>

        {/* HERO: Weekly Roster Grid (col 1-8, row 1-2) */}
        <div className="glass" style={{ gridColumn: '1 / 9', gridRow: '1 / 3', padding: 20, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>🗓️ Week of {WEEK_LABEL}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>←</button>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}>→</button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Employee</th>
                {DAY_LABELS.map(d => (
                  <th key={d} style={{ textAlign: 'center', padding: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', minWidth: 90 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#374151' }}>No employees yet — add one to get started</td></tr>
              )}
              {employees.map(emp => {
                const { overlapShiftIds, consecutiveConflict } = getEmployeeConflicts(emp.id, shifts);
                return (
                  <tr key={emp.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={emp.name} size={28} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0' }}>{emp.name}</span>
                        {consecutiveConflict && <span className="pulse-amber" title="5+ consecutive days" style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />}
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.day === day);
                      return (
                        <td key={day} className="cell-hover" style={{ padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top', textAlign: 'center' }}
                          onClick={() => dayShifts.length === 0 && setShiftModal({ employeeId: emp.id, day })}>
                          {dayShifts.length === 0
                            ? <span className="add-hint">＋</span>
                            : dayShifts.map(shift => {
                              const isConflict = overlapShiftIds.has(shift.id);
                              const isHighlighted = highlightShiftId === shift.id;
                              return (
                                <div key={shift.id} className={`shift-pill${isConflict ? ' conflict' : ''}`}
                                  style={isHighlighted ? { outline: '2px solid #F59E0B' } : {}}>
                                  <span>{shift.startTime}–{shift.endTime}</span>
                                  <button onClick={(e) => { e.stopPropagation(); deleteShift(shift.id); }}
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '0.7rem', opacity: 0.6 }}>✕</button>
                                </div>
                              );
                            })
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Staff Card (col 9-10, row 1) */}
        <div className="glass" style={{ gridColumn: '9 / 11', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{employees.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Staff active this week</div>
        </div>

        {/* Weekly Hours Card (col 11-12, row 1) */}
        <div className="glass" style={{ gridColumn: '11 / 13', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⏱️</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{totalHours}h</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 4 }}>Total assigned</div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
            {hoursPerDay.map((h, i) => (
              <div key={i} style={{ flex: 1, background: '#22C55E', borderRadius: 3, opacity: 0.7, height: `${Math.max((h / maxDayHours) * 100, 8)}%`, transition: 'height 0.3s' }} title={`${DAYS[i]}: ${h}h`} />
            ))}
          </div>
        </div>

        {/* Conflict Alert Card (col 9-12, row 2) */}
        <div className="glass" style={{ gridColumn: '9 / 13', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>⚠️ Conflicts</span>
            {allConflicts.length > 0 && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 20, padding: '1px 8px', fontSize: '0.75rem', fontWeight: 600 }}>{allConflicts.length}</span>}
          </div>
          {allConflicts.length === 0
            ? <p style={{ color: '#374151', fontSize: '0.85rem', margin: 0 }}>✓ No conflicts detected</p>
            : allConflicts.map((c, i) => (
              <div key={i} onClick={() => c.shiftIds && setHighlightShiftId(c.shiftIds[0])}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 4, cursor: c.shiftIds ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                <span style={{ fontSize: '0.85rem' }}>{c.type === 'overlap' ? '🔴' : '🟡'}</span>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e0' }}>
                  <strong>{c.emp.name}</strong> — {c.type === 'overlap' ? 'Overlapping shifts' : '5+ consecutive days'}
                </span>
              </div>
            ))
          }
        </div>

        {/* Employee List Card (col 1-4, row 3) */}
        <div className="glass" style={{ gridColumn: '1 / 5', padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>👥 Team</span>
            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{employees.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 200 }}>
            {employees.length === 0 && <p style={{ color: '#374151', fontSize: '0.85rem' }}>No employees yet</p>}
            {employees.map(emp => (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                onClick={() => setEmpModal({ mode: 'edit', emp })}>
                <Avatar name={emp.name} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0' }}>{emp.name}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                    {emp.roles.map(r => (
                      <span key={r} style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderRadius: 4, padding: '1px 6px', fontSize: '0.7rem' }}>{r}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: '#374151', fontSize: '0.8rem' }}>✏️</span>
              </div>
            ))}
          </div>
          <button onClick={() => setEmpModal({ mode: 'add' })}
            style={{ marginTop: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            ＋ Add Employee
          </button>
        </div>

        {/* Weekly Summary Panel (col 5-12, row 3) */}
        <div className="glass" style={{ gridColumn: '5 / 13', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>📋 Weekly Summary</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>📤 Export CSV</button>
              <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>🖨️ Print</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {employees.length === 0 && <p style={{ color: '#374151', fontSize: '0.85rem' }}>No employees yet</p>}
            {employees.map(emp => {
              const hours = calcTotalHours(emp.id, shifts);
              const { hasAnyConflict } = getEmployeeConflicts(emp.id, shifts);
              const pct = Math.min((hours / 40) * 100, 100);
              const statusColor = hasAnyConflict ? '#EF4444' : hours >= 40 ? '#22C55E' : hours > 0 ? '#6366F1' : '#374151';
              return (
                <div key={emp.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', minWidth: 150, border: `1px solid ${statusColor}33` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Avatar name={emp.name} size={24} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e2e8f0' }}>{emp.name}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 4, marginBottom: 6 }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: statusColor, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: statusColor, fontWeight: 600 }}>{hours}h / 40h</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {shiftModal && <ShiftModal employees={employees} shifts={shifts} prefill={shiftModal} onSave={(s) => { addShift(s); setShiftModal(null); }} onClose={() => setShiftModal(null)} />}
      {empModal && <EmployeeModal mode={empModal.mode} emp={empModal.emp} onSave={(data) => { empModal.mode === 'add' ? addEmployee(data) : editEmployee(empModal.emp.id, data); setEmpModal(null); }} onDelete={empModal.mode === 'edit' ? () => { deleteEmployee(empModal.emp.id); setEmpModal(null); } : null} onClose={() => setEmpModal(null)} />}
    </div>
  );
}