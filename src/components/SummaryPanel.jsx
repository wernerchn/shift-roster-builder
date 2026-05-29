import { getEmployeeConflicts, calcTotalHours } from '../utils/conflictUtils';

function SummaryPanel({ employees, shifts }) {
  return (
    <div style={cardStyle}>
      <h2>📊 本週工時摘要</h2>
      {employees.length === 0 && <p style={{ color: '#a0aec0' }}>尚未新增員工</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {employees.map(emp => {
          const { hasAnyConflict, consecutiveConflict, overlapShiftIds } = getEmployeeConflicts(emp.id, shifts);
          const totalHours = calcTotalHours(emp.id, shifts);
          return (
            <div key={emp.id} style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${hasAnyConflict ? '#feb2b2' : '#9ae6b4'}`,
              background: hasAnyConflict ? '#fff5f5' : '#f0fff4',
              minWidth: '180px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{emp.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>{totalHours} 小時</div>
              {hasAnyConflict ? (
                <div style={{ fontSize: '0.8rem', color: '#e53e3e', marginTop: '0.25rem' }}>
                  ⚠️{overlapShiftIds.size > 0 ? ' 時間重疊' : ''}
                  {consecutiveConflict ? ' 連續超過5天' : ''}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#38a169', marginTop: '0.25rem' }}>✓ 正常</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const cardStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

export default SummaryPanel;