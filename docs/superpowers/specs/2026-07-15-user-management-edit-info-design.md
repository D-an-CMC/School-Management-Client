---
name: user-management-edit-info
description: Implement "Sửa thông tin" feature on user-management page — reuse existing add modal with edit mode
metadata:
  type: project
---

# Edit User Info — Design Spec

## Goal
Replace the placeholder alert on the "Sửa thông tin" dropdown action with a working edit form that pre-fills existing user data and calls `updateUser` API.

## Approach
Reuse the existing add-user modal by adding an edit-mode flag (`editMode`) and an `editingUser` state. Modal title, submit button text, and API call behavior change based on mode. Password field is hidden in edit mode.

## State Changes
Add to component:
- `editMode: boolean` — defaults `false`
- `editingUser: UserRow | null` — the user being edited

## Edit Flow
1. Click "Sửa thông tin" → close dropdown, call `openEditModal(user)`
2. `openEditModal` sets `editMode = true`, fills form fields from `editingUser`, opens modal
3. Modal title: "Sửa thông tin người dùng"
4. Password field: not rendered in edit mode
5. Submit button text: "Cập nhật"
6. Submit calls `updateUser(userId, body)` → on success close modal, reload users
7. Cancel / close modal → reset form state

## Pre-fill Logic
Fill form from `editingUser` fields:
- `full_name` ← `editingUser.full_name`
- `phone` ← `editingUser.phone`
- `date_of_birth` ← `editingUser.date_of_birth`
- `role` ← `editingUser.role_name` (mapped to string)
- For students: `class_id` ← `editingUser.class_id`, derive `grade_level` and `school_year_id` from `classOptions`
- For teachers: `teacher_code` ← `editingUser.student_code` (reuses the field)
- Email, student_code are read-only in both modes

## Validation Changes
Bắt buộc nhập ho tên và trường password bị bỏ trong edit mode. Các rule khác giữ nguyên: phone 10 số, DOB ≤ today, học sinh bắt buộc có năm học/khoi/lop.

## Reset Behavior
Đóng modal (thêm hoặc sửa) → reset toàn bộ form fields về default, `editMode = false`, `editingUser = null`.

## API
- Read: `getUser(id)` — optional, có thể lấy data từ state có sẵn
- Write: `updateUser(id, body)` — đã có trong `lib/api.ts`

## Files to Modify
- `app/(app)/user-management/page.tsx` — only file modified
