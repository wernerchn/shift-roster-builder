import { useState, useEffect, useMemo, useRef } from 'react';
import { getEmployeeConflicts, calcTotalHours } from './utils/conflictUtils';
import {
  startOfWeek, addDays, toISODate,
  formatWeekLabel, formatDayHeader,
} from './utils/dateHelpers';
import ShiftModal from './components/ShiftModal';
import EmployeeModal from './components/EmployeeModal';
import { isUnavailable } from './utils/availabilityHelpers';
import { exportCSV } from './utils/exportHelpers';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Avatar({ name, size = 32 }) {
  const colors = ['#4A90E2','#22C55E','#F59E0B','#EC4899','#14B8A6','#8B5CF6'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function StatCard({ icon, value, label, color = '#4A90E2' }) {
  return (
    <div className="card" style={{
      padding: '16px 20px', display: 'flex', alignItems: 'center',
      gap: 14, flex: 1, minWidth: 140,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1A202C', lineHeight: 1 }}>{value}</div>
        <div style={{
          fontSize: '0.72rem', color: '#718096', fontWeight: 600,
          marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>{label}</div>
      </div>
    </div>
  );
}

const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function App() {
  const [employees, setEmployees] = useState(
    () => JSON.parse(localStorage.getItem('employees') || '[]')
  );
  const [shifts, setShifts] = useState(
    () => JSON.parse(localStorage.getItem('shifts') || '[]')
  );
  const [shiftModal, setShiftModal] = useState(null);
  const [empModal, setEmpModal] = useState(null);
  const [highlightShiftId, setHighlightShiftId] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date())
  );

  const dragShiftId = useRef(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  useEffect(() => { localStorage.setItem('employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('shifts', JSON.stringify(shifts)); }, [shifts]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );
  const weekDateStrings = useMemo(() => weekDates.map(d => toISODate(d)), [weekDates]);
  const weekShifts = useMemo(
    () => shifts.filter(s => weekDateStrings.includes(s.date)),
    [shifts, weekDateStrings]
  );

  const addEmployee = data => setEmployees(p => [...p, { id: Date.now(), ...data }]);
  const editEmployee = (id, data) => setEmployees(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteEmployee = id => {
    setEmployees(p => p.filter(e => e.id !== id));
    setShifts(p => p.filter(s => s.employeeId !== id));
  };
  const addShift = shift => setShifts(p => [...p, { id: Date.now(), ...shift }]);
  const deleteShift = id => setShifts(p => p.filter(s => s.id !== id));

  const handleDragStart = (e, shiftId) => {
    dragShiftId.current = shiftId;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };
  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    dragShiftId.current = null;
    setDragOverCell(null);
  };
  const handleDragOver = (e, employeeId, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ employeeId, date });
  };
  const handleDragLeave = () => setDragOverCell(null);
  const handleDrop = (e, targetEmployeeId, targetDate) => {
    e.preventDefault();
    setDragOverCell(null);
    const id = dragShiftId.current;
    if (!id) return;
    const targetEmp = employees.find(emp => emp.id === targetEmployeeId);
    if (targetEmp && isUnavailable(targetEmp, targetDate)) {
      const dayName = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      alert(`⚠️ ${targetEmp.name} is unavailable on ${dayName}. Shift was not moved.`);
      dragShiftId.current = null;
      return;
    }
    setShifts(prev => prev.map(s => s.id === id ? { ...s, employeeId: targetEmployeeId, date: targetDate } : s));
    dragShiftId.current = null;
  };

  const handlePrevWeek = () => setCurrentWeekStart(p => addDays(p, -7));
  const handleNextWeek = () => setCurrentWeekStart(p => addDays(p, 7));

  const totalHours = useMemo(
    () => employees.reduce((sum, emp) => sum + calcTotalHours(emp.id, weekShifts), 0),
    [employees, weekShifts]
  );
  const totalShifts = weekShifts.length;

  const hoursPerDay = useMemo(
    () => weekDateStrings.map(iso =>
      weekShifts.filter(s => s.date === iso).reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + (eh * 60 + em - sh * 60 - sm) / 60;
      }, 0)
    ),
    [weekShifts, weekDateStrings]
  );
  const maxDayHours = Math.max(...hoursPerDay, 1);

  const allConflicts = useMemo(
    () => employees.flatMap(emp => {
      const { overlapShiftIds, consecutiveConflict } = getEmployeeConflicts(emp.id, shifts);
      const items = [];
      if (overlapShiftIds.size > 0) items.push({ emp, type: 'overlap', shiftIds: [...overlapShiftIds] });
      if (consecutiveConflict) items.push({ emp, type: 'consecutive' });
      return items;
    }),
    [employees, shifts]
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA' }}>

      {/* Top Nav */}
      <div className="no-print" style={{
        background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>🗓️</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1A202C' }}>Shift Roster</span>
        </div>
        <button
          onClick={() => setEmpModal({ mode: 'add' })}
          style={{
            background: '#4A90E2', color: 'white', border: 'none',
            borderRadius: 8, padding: '8px 16px',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#3A7BC8'}
          onMouseLeave={e => e.currentTarget.style.background = '#4A90E2'}
        >
          + Add Employee
        </button>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>
            Weekly Schedule
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#718096' }}>
            {formatWeekLabel(currentWeekStart)}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar no-print" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="👤" value={employees.length} label="Employees" color="#4A90E2" />
          <StatCard icon="⏱️" value={`${totalHours}h`} label="Hours This Week" color="#22C55E" />
          <StatCard icon="📋" value={totalShifts} label="Shifts Scheduled" color="#8B5CF6" />
          <StatCard
            icon="⚠️"
            value={allConflicts.length}
            label="Conflicts"
            color={allConflicts.length > 0 ? '#EF4444' : '#22C55E'}
          />

          {/* Hours Per Day Chart */}
          <div className="card" style={{ padding: '16px 20px', flex: 2, minWidth: 220 }}>
            <div style={{
              fontSize: '0.72rem', color: '#718096', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12,
            }}>
              Hours Per Day
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 56 }}>
              {hoursPerDay.map((h, i) => {
                const barH = Math.max((h / maxDayHours) * 40, h > 0 ? 6 : 0);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {h > 0 && (
                      <span style={{ fontSize: '0.6rem', color: '#4A90E2', fontWeight: 700, lineHeight: 1 }}>
                        {Number.isInteger(h) ? h : h.toFixed(1)}
                      </span>
                    )}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{
                        width: '100%',
                        background: h > 0 ? '#4A90E2' : '#EDF2F7',
                        borderRadius: '4px 4px 0 0',
                        height: barH,
                        opacity: h > 0 ? 0.85 : 0.5,
                        transition: 'height 0.3s',
                        minHeight: 4,
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      color: h > 0 ? '#4A5568' : '#CBD5E0',
                      fontWeight: h > 0 ? 600 : 400,
                    }}>
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Layout: Grid + Sidebar */}
        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

          {/* Roster Grid */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: '1px solid #EDF2F7',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={handlePrevWeek} style={navBtnStyle} className="no-print">←</button>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A202C' }}>
                    {formatWeekLabel(currentWeekStart)}
                  </span>
                  <button onClick={handleNextWeek} style={navBtnStyle} className="no-print">→</button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }} className="no-print">
                  💡 Drag to reassign
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                  <thead>
                    <tr style={{ background: '#F7F8FA' }}>
                      <th style={thStyle}>Employee</th>
                      {weekDates.map((d, i) => (
                        <th key={weekDateStrings[i]} style={thStyle}>
                          {formatDayHeader(d)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{
                          textAlign: 'center', padding: '3rem',
                          color: '#A0AEC0', fontSize: '0.9rem',
                        }}>
                          No employees yet — click "+ Add Employee" to get started
                        </td>
                      </tr>
                    )}
                    {employees.map((emp, rowIdx) => {
                      const { overlapShiftIds, consecutiveConflict } = getEmployeeConflicts(emp.id, weekShifts);
                      return (
                        <tr key={emp.id} style={{ background: rowIdx % 2 === 0 ? '#FFFFFF' : '#F7F8FA' }}>
                          <td style={{ ...tdStyle, minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Avatar name={emp.name} size={26} />
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A202C' }}>
                                  {emp.name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>
                                  {emp.roles.join(', ')}
                                </div>
                              </div>
                              {consecutiveConflict && (
                                <span
                                  className="pulse-amber"
                                  title="Scheduled 5+ consecutive days"
                                  style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#F59E0B', display: 'inline-block', flexShrink: 0,
                                  }}
                                />
                              )}
                            </div>
                          </td>

                          {weekDateStrings.map(iso => {
                            const dayShifts = weekShifts
                              .filter(s => s.employeeId === emp.id && s.date === iso)
                              .sort((a, b) => a.startTime.localeCompare(b.startTime));
                            const isOver = dragOverCell?.employeeId === emp.id && dragOverCell?.date === iso;
                            const unavail = isUnavailable(emp, iso);

                            return (
                              <td
                                key={iso}
                                style={{
                                  ...tdStyle, minWidth: 100, cursor: 'pointer',
                                  background: isOver
                                    ? 'rgba(74,144,226,0.08)'
                                    : unavail
                                    ? 'rgba(245,158,11,0.05)'
                                    : 'inherit',
                                  outline: isOver ? '2px dashed #4A90E2' : 'none',
                                  outlineOffset: -2,
                                  transition: 'background 0.15s',
                                }}
                                onClick={() => setShiftModal({ employeeId: emp.id, date: iso })}
                                onDragOver={e => handleDragOver(e, emp.id, iso)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, emp.id, iso)}
                              >
                                {unavail && (
                                  <div style={{
                                    fontSize: '0.58rem', color: '#D97706',
                                    background: '#FEF3C7', border: '1px solid #FDE68A',
                                    borderRadius: 4, padding: '1px 5px',
                                    marginBottom: 3, fontWeight: 600, display: 'inline-block',
                                  }}>
                                    ⚠️ Unavailable
                                  </div>
                                )}
                                {dayShifts.length === 0
                                  ? <span className="add-hint">+</span>
                                  : dayShifts.map(shift => (
                                    <div
                                      key={shift.id}
                                      draggable
                                      className={`shift-pill${overlapShiftIds.has(shift.id) ? ' conflict' : ''}`}
                                      style={highlightShiftId === shift.id ? { outline: '2px solid #F59E0B' } : {}}
                                      onDragStart={e => { e.stopPropagation(); handleDragStart(e, shift.id); }}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <span>{shift.startTime}–{shift.endTime}</span>
                                      <button
                                        onClick={e => { e.stopPropagation(); deleteShift(shift.id); }}
                                        style={{
                                          background: 'transparent', border: 'none',
                                          color: 'inherit', cursor: 'pointer',
                                          padding: 0, fontSize: '0.65rem', opacity: 0.5, lineHeight: 1,
                                        }}
                                      >✕</button>
                                    </div>
                                  ))
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
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Conflicts */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A202C' }}>Conflicts</span>
                {allConflicts.length > 0 && (
                  <span style={{
                    background: '#FEF2F2', color: '#DC2626',
                    borderRadius: 20, padding: '2px 8px',
                    fontSize: '0.72rem', fontWeight: 700,
                  }}>
                    {allConflicts.length}
                  </span>
                )}
              </div>
              {allConflicts.length === 0
                ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                    <span style={{ color: '#22C55E' }}>✓</span>
                    <span style={{ color: '#4A5568' }}>No conflicts</span>
                  </div>
                )
                : allConflicts.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => c.shiftIds && setHighlightShiftId(c.shiftIds[0])}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '8px 10px', borderRadius: 8,
                      background: c.type === 'overlap' ? '#FEF2F2' : '#FFFBEB',
                      border: `1px solid ${c.type === 'overlap' ? '#FECACA' : '#FDE68A'}`,
                      marginBottom: 6, cursor: c.shiftIds ? 'pointer' : 'default',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', marginTop: 1 }}>
                      {c.type === 'overlap' ? '🔴' : '🟡'}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A202C' }}>{c.emp.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096', marginTop: 1 }}>
                        {c.type === 'overlap' ? 'Overlapping shifts' : '5+ consecutive days'}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Team */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A202C' }}>Team</span>
                <span style={{
                  background: '#EBF4FF', color: '#2563EB',
                  borderRadius: 20, padding: '2px 8px',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {employees.length}
                </span>
              </div>
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {employees.length === 0 && (
                  <p style={{ color: '#A0AEC0', fontSize: '0.85rem' }}>No employees yet</p>
                )}
                {employees.map(emp => (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 6px', borderRadius: 8,
                      borderBottom: '1px solid #F0F4F8',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onClick={() => setEmpModal({ mode: 'edit', emp })}
                    onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Avatar name={emp.name} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1A202C' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.roles.join(', ')}
                        {emp.unavailableDays?.length > 0 && ` · off ${emp.unavailableDays.join(', ')}`}
                        {emp.unavailableDates?.length > 0 && ` · +${emp.unavailableDates.length} date${emp.unavailableDates.length > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#CBD5E0' }}>✏️</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setEmpModal({ mode: 'add' })}
                className="no-print"
                style={{
                  marginTop: 12, width: '100%',
                  background: '#EBF4FF', border: '1px solid #BFDBFE',
                  color: '#2563EB', borderRadius: 8, padding: '8px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                onMouseLeave={e => e.currentTarget.style.background = '#EBF4FF'}
              >
                + Add Employee
              </button>
            </div>

            {/* Weekly Summary */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A202C' }}>Weekly Summary</span>
                <div style={{ display: 'flex', gap: 6 }} className="no-print">
                  <button
                    onClick={() => exportCSV(employees, shifts, weekDates)}
                    style={smallBtnStyle}
                    title="Export CSV"
                  >
                    📤 CSV
                  </button>
                  <button onClick={() => window.print()} style={smallBtnStyle} title="Print">
                    🖨️
                  </button>
                </div>
              </div>

              {employees.length === 0 && (
                <p style={{ color: '#A0AEC0', fontSize: '0.85rem' }}>No employees yet</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {employees.map(emp => {
                  const hours = calcTotalHours(emp.id, weekShifts);
                  const { hasAnyConflict } = getEmployeeConflicts(emp.id, weekShifts);
                  const empShiftCount = weekShifts.filter(s => s.employeeId === emp.id).length;
                  const pct = Math.min((hours / 40) * 100, 100);
                  const sc = hasAnyConflict ? '#EF4444' : hours >= 40 ? '#22C55E' : hours > 0 ? '#4A90E2' : '#CBD5E0';
                  const bgc = hasAnyConflict ? '#FEF2F2' : hours >= 40 ? '#F0FDF4' : hours > 0 ? '#EBF4FF' : '#F7F8FA';

                  return (
                    <div key={emp.id} style={{
                      background: bgc,
                      border: `1px solid ${sc}33`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={emp.name} size={22} />
                          <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1A202C' }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.83rem', fontWeight: 700, color: sc }}>{hours}h</span>
                      </div>

                      <div style={{ background: '#E2E8F0', borderRadius: 4, height: 5, marginBottom: 6 }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          borderRadius: 4, background: sc, transition: 'width 0.4s',
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>
                          {empShiftCount} shift{empShiftCount !== 1 ? 's' : ''} · {hours} / 40h
                        </span>
                        {hasAnyConflict && (
                          <span style={{
                            fontSize: '0.65rem', background: '#FEE2E2', color: '#DC2626',
                            borderRadius: 4, padding: '1px 6px', fontWeight: 600,
                          }}>
                            conflict
                          </span>
                        )}
                        {!hasAnyConflict && hours >= 40 && (
                          <span style={{
                            fontSize: '0.65rem', background: '#DCFCE7', color: '#16A34A',
                            borderRadius: 4, padding: '1px 6px', fontWeight: 600,
                          }}>
                            full week
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {shiftModal && (
        <ShiftModal
          employees={employees}
          shifts={shifts}
          prefill={shiftModal}
          onSave={payload => {
            if (Array.isArray(payload)) payload.forEach(addShift);
            else addShift(payload);
            setShiftModal(null);
          }}
          onClose={() => setShiftModal(null)}
        />
      )}
      {empModal && (
        <EmployeeModal
          mode={empModal.mode}
          emp={empModal.emp}
          onSave={data => {
            empModal.mode === 'add' ? addEmployee(data) : editEmployee(empModal.emp.id, data);
            setEmpModal(null);
          }}
          onDelete={empModal.mode === 'edit'
            ? () => { deleteEmployee(empModal.emp.id); setEmpModal(null); }
            : null
          }
          onClose={() => setEmpModal(null)}
        />
      )}
    </div>
  );
}

// Shared styles
const thStyle = {
  textAlign: 'left', padding: '10px 12px', color: '#718096',
  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
  textTransform: 'uppercase', borderBottom: '1px solid #EDF2F7', whiteSpace: 'nowrap',
};
const tdStyle = {
  padding: '8px 10px',
  borderBottom: '1px solid #EDF2F7',
  verticalAlign: 'top',
};
const navBtnStyle = {
  background: '#FFFFFF', border: '1px solid #E2E8F0',
  color: '#4A5568', borderRadius: 8,
  padding: '4px 12px', cursor: 'pointer', fontSize: '0.9rem',
  transition: 'border-color 0.15s',
};
const smallBtnStyle = {
  background: '#F7F8FA', border: '1px solid #E2E8F0',
  color: '#718096', borderRadius: 6,
  padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem',
};