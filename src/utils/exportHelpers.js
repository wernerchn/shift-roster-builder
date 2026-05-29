// 把 shifts 資料匯出成 CSV 並觸發下載
export function exportCSV(employees, shifts, weekDates) {
  const weekDateStrings = weekDates.map(d => toISODate(d));
  const headers = ['Employee', 'Role(s)', 'Date', 'Day', 'Start', 'End', 'Hours'];

  const rows = [];

  for (const emp of employees) {
    const empShifts = shifts
      .filter(s => weekDateStrings.includes(s.date) && s.employeeId === emp.id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    for (const s of empShifts) {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
      const dayName = new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      rows.push([
        emp.name,
        emp.roles.join(' / '),
        s.date,
        dayName,
        s.startTime,
        s.endTime,
        hours.toFixed(2),
      ]);
    }
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `roster_${weekDateStrings[0]}_to_${weekDateStrings[6]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}