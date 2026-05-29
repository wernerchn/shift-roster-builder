# Shift Roster Builder

A web application for managers to create and manage a weekly staff schedule for a small team.

## Setup Instructions

```bash
git clone https://github.com/wernerchn/shift-roster-builder.git
cd shift-roster-builder
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

- Add, edit, and remove employees with one or more roles (e.g. Cashier, Cook)
- Assign employees to specific days and time slots (e.g. Monday 09:00–17:00)
- Weekly grid view — columns are days (Mon–Sun), rows are employees
- Conflict detection:
  - Overlapping shifts on the same day (highlighted in red)
  - Scheduled more than 5 consecutive days
- Summary panel showing total hours per employee and conflict warnings

## Data Model

All data is stored in React state (in-memory). No backend or database required.

**Employee**
```json
{ "id": 1234567890, "name": "Alice", "roles": ["Cashier", "Cook"] }
```

**Shift**
```json
{ "id": 1234567891, "employeeId": 1234567890, "day": "Mon", "startTime": "09:00", "endTime": "17:00" }
```

## Design Decisions

- **React + Vite**: Chosen for component-based state management, which suits the multiple interacting panels in this app.
- **In-memory state**: All data lives in React useState hooks in App.jsx. Simple and sufficient for a single-session scheduling tool.
- **Conflict logic in utils/conflictUtils.js**: Separated from UI components so it can be reasoned about and tested independently.
- **Time comparison via minutes**: startTime and endTime are stored as "HH:MM" strings and converted to minutes for accurate overlap detection.
- **Deleting an employee also removes their shifts**: Prevents orphaned shift data.

## Known Limitations

- Data does not persist after page refresh (no localStorage)
- No drag-and-drop shift reassignment (stretch goal not implemented)