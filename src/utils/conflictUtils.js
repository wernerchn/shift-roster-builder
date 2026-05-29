const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function hasOverlap(shiftA, shiftB) {
  const s1 = toMinutes(shiftA.startTime);
  const e1 = toMinutes(shiftA.endTime);
  const s2 = toMinutes(shiftB.startTime);
  const e2 = toMinutes(shiftB.endTime);
  return !(e2 <= s1 || s2 >= e1);
}

export function hasConsecutiveDaysConflict(employeeShifts) {
  const workedDays = [...new Set(employeeShifts.map(s => s.day))];
  const indices = workedDays
    .map(d => DAY_ORDER.indexOf(d))
    .filter(i => i !== -1)
    .sort((a, b) => a - b);

  let count = 1;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      count++;
      if (count > 5) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

export function getEmployeeConflicts(employeeId, shifts) {
  const empShifts = shifts.filter(s => s.employeeId === employeeId);

  const overlapConflicts = new Set();
  for (let i = 0; i < empShifts.length; i++) {
    for (let j = i + 1; j < empShifts.length; j++) {
      if (empShifts[i].day === empShifts[j].day &&
          hasOverlap(empShifts[i], empShifts[j])) {
        overlapConflicts.add(empShifts[i].id);
        overlapConflicts.add(empShifts[j].id);
      }
    }
  }

  const consecutiveConflict = hasConsecutiveDaysConflict(empShifts);

  return {
    overlapShiftIds: overlapConflicts,
    consecutiveConflict,
    hasAnyConflict: overlapConflicts.size > 0 || consecutiveConflict,
  };
}

export function calcTotalHours(employeeId, shifts) {
  return shifts
    .filter(s => s.employeeId === employeeId)
    .reduce((total, s) => {
      return total + (toMinutes(s.endTime) - toMinutes(s.startTime)) / 60;
    }, 0);
}