// "YYYY-MM-DD" → "Mon" / "Tue" / ...
export function getDayAbbr(dateStr) {
  // 加 T00:00:00 避免時區偏移導致星期錯誤
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

// 檢查某員工在某日期是否不可上班
// employee.unavailableDays    = ["Mon", "Wed", ...]     星期
// employee.unavailableDates   = ["2026-05-27", ...]     精準日期
export function isUnavailable(employee, dateStr) {
  const dayAbbr = getDayAbbr(dateStr);

  const blockedByWeekday = employee?.unavailableDays?.includes(dayAbbr) ?? false;
  const blockedByDate    = employee?.unavailableDates?.includes(dateStr) ?? false;

  return blockedByWeekday || blockedByDate;
}

// 給 EmployeeModal 用：把日期格式化成可讀字串
export function formatBlockedDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', weekday: 'short',
  });
}