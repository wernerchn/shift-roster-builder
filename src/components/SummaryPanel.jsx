import { getEmployeeConflicts, calcTotalHours } from '../utils/conflictUtils';

function SummaryPanel({ employees, shifts }) {
  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>本週工時摘要</h2>
      {employees.length === 0 && (
        <p style={{ color: '#aaa' }}>尚未新增員工</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {employees.map(emp => {
          const { hasAnyConflict, consecutiveConflict, overlapShiftIds } = getEmployeeConflicts(emp.id, shifts);
          const totalHours = calcTotalHours(emp.id, shifts);
          return (
            <li key={emp.id} style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              borderRadius: '4px',
              background: hasAnyConflict ? '#fff0f0' : '#f0fff0',
              border: `1px solid ${hasAnyConflict ? '#ffaaaa' : '#aaffaa'}`,
            }}>
              <strong>{emp.name}</strong>
              <span style={{ marginLeft: '1rem' }}>總工時：{totalHours} 小時</span>
              {hasAnyConflict && (
                <span style={{ marginLeft: '1rem', color: 'red', fontWeight: 'bold' }}>
                  ⚠️{overlapShiftIds.size > 0 ? ' 時間重疊' : ''}
                  {consecutiveConflict ? ' 連續超過5天' : ''}
                </span>
              )}
              {!hasAnyConflict && (
                <span style={{ marginLeft: '1rem', color: 'green' }}>✓ 正常</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SummaryPanel;