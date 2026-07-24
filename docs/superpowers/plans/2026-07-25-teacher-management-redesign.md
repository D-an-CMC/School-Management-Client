# Teacher Management Redesign Plan

## Goal
Replace user-management/page.tsx UI with Stitch "Quan ly Giao vien" design (teachers only, real API data).

## Key decisions
- Keep existing page file, replace JSX + styling only
- Use GET /api/teachers (search/page/limit) and GET /api/teachers/stats/summary
- Colors: sidebar #003366, active #004080, brand button #004d80, brand text #003366
- Table columns: Ma GV | Ten GV | Email | SDT | Bo mon | Lop | Trang thai | Actions
- Tabs: Giao vien (active) | Hoc sinh | Nhan vien (display only)
- Keep Plus Jakarta Sans (project font), not Inter

## Tasks
1. Refactor page state to teacher-only data, swap API calls
2. Replace page JSX with Stitch layout (welcome, stats, tabs, table, pagination)
3. Test build
