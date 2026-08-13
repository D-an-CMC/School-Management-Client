const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim();

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: { id: number; email: string; role: string; name: string };
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function loginApi(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<AuthResponse | ApiError>;
}

export async function getMe(): Promise<{ id: number; email: string; role: string; name: string; teacherId?: number; studentId?: number } | null> {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.success || !json?.data?.id) return null;
  const u = json.data;
  return { id: u.id, email: u.email, role: u.role, name: u.name, teacherId: u.teacherId, studentId: u.studentId };
}

export async function getUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/users${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getUser(id: number) {
  const res = await apiFetch(`/api/users/${id}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function updateUser(id: number, data: Record<string, any>) {
  const res = await apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function deleteUser(id: number) {
  const res = await apiFetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function createUser(data: Record<string, any>) {
  const res = await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function getStudents(params?: { search?: string; classId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/students${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getStudent(id: number) {
  const res = await apiFetch(`/api/students/${id}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getStudentCodePreview(classId: number, schoolYearId?: number) {
  const qs = schoolYearId ? `?classId=${classId}&schoolYearId=${schoolYearId}` : `?classId=${classId}`
  const res = await apiFetch(`/api/students/preview/code${qs}`);
  const json = (await res.json()) as { success: boolean; data?: { student_code: string; email: string } };
  return json.success ? json.data : null;
}

export async function getStudentStats() {
  const res = await apiFetch('/api/students/stats/count');
  const json = (await res.json()) as any;
  return json.data ?? json;
}

export function getStudentsCount(): Promise<number> {
  return getStudentStats().then((s) => s.totalStudents ?? 0);
}

export async function getTeachers(params?: { search?: string; subjectId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.subjectId) qs.set('subjectId', String(params.subjectId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/teachers${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getTeacherCodePreview() {
  const res = await apiFetch('/api/teachers/preview/code');
  const json = (await res.json()) as { success: boolean; data?: { teacher_code: string; email: string } };
  return json.success ? json.data : null;
}

export async function getTeacherStats() {
  const res = await apiFetch('/api/teachers/stats/summary');
  const json = (await res.json()) as any;
  return json.data ?? json;
}

export async function getTeacherSubjects(teacherId: number) {
  const res = await apiFetch(`/api/teachers/${teacherId}/subjects`);
  const json = (await res.json()) as { success: boolean; data?: { subject_id: number; subject_code: string; subject_name: string }[] };
  return json.success ? json.data ?? [] : [];
}

export async function getClasses(params?: { teacherId?: number; schoolYearId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
  if (params?.schoolYearId != null) qs.set('schoolYearId', String(params.schoolYearId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/classes${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getClass(id: number) {
  const res = await apiFetch(`/api/classes/${id}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getClassStudents(classId: number) {
  const res = await apiFetch(`/api/classes/${classId}/students`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getClassesCount(schoolYearId?: number) {
  const qs = schoolYearId != null ? `?schoolYearId=${schoolYearId}&limit=1` : '?limit=1';
  const res = await apiFetch(`/api/classes${qs}`);
  if (!res.ok) return 0;
  const json = (await res.json()) as PaginatedResponse<any>;
  return json.total || 0;
}

export async function getRiskStats() {
  const res = await apiFetch('/api/ai/risk-stats')
  if (!res.ok) return null
  const json = (await res.json()) as { success: boolean; data?: any }
  return json.success ? json.data : null
}

export async function getGradeStats(schoolYearId?: number) {
  const qs = schoolYearId != null ? `?schoolYearId=${schoolYearId}` : '';
  const res = await apiFetch(`/api/classes/stats/by-grade${qs}`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getStudentAttendanceStats() {
  const res = await apiFetch('/api/students/stats/attendance');
  const json = (await res.json()) as { success: boolean; data?: { total: number; present: number; grades: { grade_level: number; total: number; present: number; percent: string }[] } };
  return json.success ? json.data ?? null : null;
}

export async function getGradesByClass(classId: number, subjectId?: number, semesterId?: number, mode?: string) {
  const qs = new URLSearchParams();
  if (subjectId) qs.set('subjectId', String(subjectId));
  if (semesterId) qs.set('semesterId', String(semesterId));
  if (mode) qs.set('mode', mode);
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/grades/class/${classId}${suffix}`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getGradeTypes() {
  const res = await apiFetch('/api/grades/types');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function updateGradeItem(gradeItemId: number, score: number) {
  const res = await apiFetch(`/api/grades/items/${gradeItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export interface GradeItemUpdate {
  gradeItemId: number;
  score: number;
}

export async function batchUpdateGrades(updates: GradeItemUpdate[]) {
  const res = await apiFetch('/api/grades/batch', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function saveClassGrades(classId: number, grades: any[], subjectId?: number, semesterId?: number) {
  const payload: { student_id: number; freq: (number | null)[]; midTerm: number | null; finalTerm: number | null; ranking?: string }[] = [];

  for (const g of grades) {
    const sid = g.student_id ?? parseInt(g.id);
    if (!sid) continue;

    const freq = (Array.isArray(g.freq) ? g.freq : []).map((v: string) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    });

    const midScore = parseFloat(g.midTerm);
    const finalScore = parseFloat(g.finalTerm);

    payload.push({
      student_id: sid,
      freq,
      midTerm: isNaN(midScore) ? null : midScore,
      finalTerm: isNaN(finalScore) ? null : finalScore,
      ...(g.ranking ? { ranking: g.ranking } : {}),
    });
  }

  const res = await apiFetch(`/api/grades/class/${classId}/batch`, {
    method: 'POST',
    body: JSON.stringify({ grades: payload, subjectId, semesterId }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function getAttendanceSessions(params?: { teacherId?: number; classId?: number; semesterId?: number; schoolYearId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.semesterId) qs.set('semesterId', String(params.semesterId));
  if (params?.schoolYearId) qs.set('schoolYearId', String(params.schoolYearId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/attendance/sessions${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function createAttendanceSession(data: { teacherId?: number; sessionDate?: string; classId?: number; semesterId?: number; schoolYearId?: number; session?: 'MORNING' | 'AFTERNOON'; students?: number[] }) {
  const res = await apiFetch('/api/attendance/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function saveSessionAttendance(sessionId: number, records: { studentId: number; status: string; note?: string }[]) {
  const res = await apiFetch(`/api/attendance/sessions/${sessionId}/records`, {
    method: 'PUT',
    body: JSON.stringify({ records }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

// ── Kết quả cuối năm ────────────────────────────────────────

export async function getYearResultsOverview(yearId: number, teacherId?: number) {
  const qs = teacherId ? `?yearId=${yearId}&teacherId=${teacherId}` : `?yearId=${yearId}`;
  const res = await apiFetch(`/api/year-results/overview${qs}`);
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function evaluateClassYearResults(classId: number, yearId: number) {
  const res = await apiFetch(`/api/year-results/classes/${classId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ yearId }),
  });
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function getClassYearResults(classId: number, yearId: number, recompute = false) {
  const res = await apiFetch(`/api/year-results/classes/${classId}?yearId=${yearId}${recompute ? '&recompute=true' : ''}`);
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function getStudentYearResult(studentId: number, yearId: number) {
  const res = await apiFetch(`/api/year-results/students/${studentId}?yearId=${yearId}`);
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function confirmYearResult(resultId: number, finalResult: string) {
  const res = await apiFetch(`/api/year-results/results/${resultId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ finalResult }),
  });
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function finalizeYearResult(resultId: number) {
  const res = await apiFetch(`/api/year-results/results/${resultId}/finalize`, {
    method: 'POST',
  });
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function getAttendanceSession(sessionId: number) {
  const res = await apiFetch(`/api/attendance/sessions/${sessionId}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getTimetables(params?: { teacherId?: number; classId?: number; semesterId?: number; weekStart?: string; page?: number; limit?: number; timetableTypeId?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.semesterId) qs.set('semesterId', String(params.semesterId));
  if (params?.weekStart) qs.set('weekStart', params.weekStart);
  if (params?.timetableTypeId != null) qs.set('timetableTypeId', String(params.timetableTypeId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/timetables${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getMyTimetable(params?: { semesterId?: number; weekStart?: string }): Promise<{ success: boolean; data: any[]; className?: string | null; roomName?: string | null }> {
  const qs = new URLSearchParams();
  if (params?.semesterId) qs.append('semesterId', String(params.semesterId));
  if (params?.weekStart) qs.append('weekStart', params.weekStart);
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/timetables/my${suffix}`);
  if (!res.ok) return { success: false, data: [] };
  const json = await res.json();
  return { success: json.success ?? false, data: json.data ?? [], className: json.className ?? null, roomName: json.roomName ?? null };
}


export async function getExamSchedules(params?: { classId?: number; semesterId?: number }) {
  const qs = new URLSearchParams();
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.semesterId) qs.set('semesterId', String(params.semesterId));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/timetables/exam-schedules${suffix}`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getRoles() {
  const res = await apiFetch('/api/permissions/roles');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getPermissionsByRole(roleId: number) {
  const res = await apiFetch(`/api/permissions/roles/${roleId}/permissions`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  const res = await apiFetch(`/api/permissions/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionIds }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function getAllPermissions() {
  const res = await apiFetch('/api/permissions/permissions');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export interface NotificationItem {
  notification_id: number
  title: string
  content?: string
  target_type?: string
  created_at: string
  is_read: boolean
}

export async function getMyNotifications(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/notifications/my${suffix}`);
  const json = (await res.json()) as PaginatedResponse<NotificationItem> & { unreadCount?: number };
  return json;
}

export async function getNotificationUnreadCount() {
  const res = await apiFetch('/api/notifications/unread-count');
  const json = (await res.json()) as { success: boolean; data?: { unreadCount: number } };
  return json.data?.unreadCount ?? 0;
}

export async function markNotificationRead(notificationId: number) {
  const res = await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
  return (await res.json()) as { success: boolean };
}

export async function createNotification(data: {
  title: string
  content?: string
  targetType: 'all' | 'admin' | 'teacher' | 'student' | 'parent' | 'medical' | 'accountant'
}) {
  const res = await apiFetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return (await res.json()) as { success: boolean; data?: any; error?: string };
}

export async function getSchoolYears() {
  const res = await apiFetch('/api/school-years');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : [];
}

export async function createSchoolYear(data: { year_name: string; start_date: string; end_date: string; is_current?: boolean }) {
  const res = await apiFetch('/api/school-years', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function updateSchoolYear(id: number, data: { year_name: string; start_date: string; end_date: string; is_current?: boolean }) {
  const res = await apiFetch(`/api/school-years/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function deleteSchoolYear(id: number) {
  const res = await apiFetch(`/api/school-years/${id}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function getDepartments() {
  const res = await apiFetch('/api/users/departments');
  const json = (await res.json()) as { success: boolean; data?: string[] };
  return json.success ? json.data ?? [] : [];
}

export async function getSubjects() {
  const res = await apiFetch('/api/timetables/subjects');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : [];
}

export async function createSubject(payload: { subject_name: string; subject_code?: string }) {
  const res = await apiFetch('/api/timetables/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as { success: boolean; data?: any; error?: string };
}

export interface ScheduleRule {
  subject_id: number;
  periods_per_week: number;
  session: 'morning' | 'afternoon' | 'any';
  double_period: number;
  teacher_id: number | null;
  enabled: boolean;
}

export async function getScheduleRules(): Promise<ScheduleRule[]> {
  const res = await apiFetch('/api/rules');
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; data?: any[] };
  const rows = (json.success ? json.data : []) ?? [];
  return rows.map((r) => ({
    subject_id: Number(r.subject_id),
    periods_per_week: Number(r.periods_per_week) || 0,
    session: (r.session || 'any') as ScheduleRule['session'],
    double_period: [1, 2, 3].includes(Number(r.double_period)) ? Number(r.double_period) : 1,
    teacher_id: r.teacher_id ? Number(r.teacher_id) : null,
    enabled: r.enabled !== false,
  }));
}

export async function saveScheduleRules(rules: ScheduleRule[]) {
  const res = await apiFetch('/api/rules/bulk', {
    method: 'PUT',
    body: JSON.stringify({ rules }),
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function getSemesters(schoolYearId?: number) {
  const qs = schoolYearId ? `?school_year_id=${schoolYearId}` : '';
  const res = await apiFetch(`/api/semesters${qs}`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : [];
}

export async function getCurrentSchoolYear() {
  try {
    const res = await apiFetch('/api/school-years/current');
    const json = (await res.json()) as { success: boolean; data?: any };
    return json.success ? json.data ?? null : null;
  } catch {
    return null;
  }
}

export async function getCurrentSemester() {
  try {
    const res = await apiFetch('/api/semesters/current');
    const json = (await res.json()) as { success: boolean; data?: any };
    return json.success ? json.data ?? null : null;
  } catch {
    return null;
  }
}

export async function setCurrentSchoolYear(id: number) {
  const res = await apiFetch(`/api/school-years/${id}/set-current`, { method: 'POST' });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function setActiveSemester(id: number) {
  const res = await apiFetch(`/api/semesters/${id}/set-active`, { method: 'POST' });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function createSemester(data: { school_year_id: number; semester_name: string; term_order?: number; is_active?: boolean; start_date?: string; end_date?: string }) {
  const res = await apiFetch('/api/semesters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function updateSemester(id: number, data: Partial<{ semester_name: string; term_order: number; is_active: boolean; start_date: string; end_date: string }>) {
  const res = await apiFetch(`/api/semesters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function deleteSemester(id: number) {
  const res = await apiFetch(`/api/semesters/${id}`, { method: 'DELETE' });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function getMyStudentInfo() {
  const res = await apiFetch('/api/student-self/my-info');
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getMyGrades(semesterId?: number) {
  const qs = semesterId ? `?semesterId=${semesterId}` : '';
  const res = await apiFetch(`/api/student-self/my-grades${qs}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any[] };
  return json.success ? json.data : [];
}

export async function getMyGradesYear() {
  const res = await apiFetch('/api/student-self/my-grades?mode=year');
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getMyAttendance() {
  const res = await apiFetch('/api/student-self/my-attendance');
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any[] };
  return json.success ? json.data : [];
}

export async function getMyActivities() {
  const res = await apiFetch('/api/student-self/my-activities');
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any[] };
  return json.success ? json.data : [];
}

export async function createTimetable(data: Record<string, any>) {
  const res = await apiFetch('/api/timetables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function bulkCreateTimetables(entries: any[], weekStart?: string) {
  const res = await apiFetch('/api/timetables/bulk', {
    method: 'POST',
    body: JSON.stringify({ entries, weekStart }),
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export interface AutoScheduleResult {
  semesterId: number;
  totalClasses: number;
  totalEntries: number;
  weekStarts: string[];
  teacherStats: Array<{ teacher_name: string; class_count: number; subject: string }>;
  warnings: string[];
}

export async function autoScheduleTimetables(params: {
  scope?: 'all' | 'selectedGrade';
  gradeLevel?: number;
  semesterId?: number;
  semesterIds?: number[];
  daysOf3Periods?: number;
  daysOf4Periods?: number;
  khtnPriority?: string | string[];
  examBlocks?: Array<{ classId?: number; gradeLevel?: number; dayOfWeek: string; session?: 'morning' | 'afternoon' | 'both' }>;
}) {
  const res = await apiFetch('/api/timetables/auto', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res.json() as Promise<{ success: boolean; data?: AutoScheduleResult; error?: string; code?: string }>;
}

// Exam schedule (Lịch thi) API
export interface ExamSchedulePayload {
  gradeLevel: number;
  examDate: string;
  session: 'morning' | 'afternoon' | 'both';
  dayOfWeek: string;
  subjectId: number;
  periods: number[];
  semesterId?: number;
  examName?: string;
  proctorsPerRoom?: number;
}

export async function createExamSchedule(payload: ExamSchedulePayload) {
  const res = await apiFetch('/api/timetables/exams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<{ success: boolean; data?: { scheduleIds: number[]; count: number; assignments?: any }; error?: string; code?: string }>;
}

export async function getGradeExams(params?: { gradeLevel?: number; semesterId?: number; weekStart?: string; date?: string }) {
  const qs = new URLSearchParams();
  if (params?.gradeLevel != null) qs.set('gradeLevel', String(params.gradeLevel));
  if (params?.semesterId != null) qs.set('semesterId', String(params.semesterId));
  if (params?.weekStart) qs.set('weekStart', params.weekStart);
  if (params?.date) qs.set('date', params.date);
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/timetables/exams${suffix}`);
  const json = (await res.json()) as { success: boolean; data?: { schedules: any[]; assignments: any[]; proctors: any[]; makeup: any[] } };
  return json.success ? json.data ?? { schedules: [], assignments: [], proctors: [], makeup: [] } : { schedules: [], assignments: [], proctors: [], makeup: [] };
}

export async function reassignExamProctors(scheduleId: number, proctorsPerRoom?: number) {
  const res = await apiFetch(`/api/timetables/exams/${scheduleId}/proctors`, {
    method: 'POST',
    body: JSON.stringify(proctorsPerRoom ? { proctorsPerRoom } : {}),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function deleteExamSchedule(scheduleId: number) {
  const res = await apiFetch(`/api/timetables/${scheduleId}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function deleteTimetable(scheduleId: number) {
  const res = await apiFetch(`/api/timetables/${scheduleId}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function clearGradeTimetable(gradeLevel: number, semesterId?: number, weekStart?: string) {
  const qs = new URLSearchParams();
  qs.set('gradeLevel', String(gradeLevel));
  if (semesterId) qs.set('semesterId', String(semesterId));
  if (weekStart) qs.set('weekStart', weekStart);
  const res = await apiFetch(`/api/timetables/grade?${qs.toString()}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; data?: { deleted: number }; error?: string }>;
}

export interface Room {
  room_id: number;
  room_name: string;
  room_type?: string | null;
}

export async function getRooms(): Promise<Room[]> {
  const res = await apiFetch('/api/rooms');
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; data?: Room[] };
  return json.success ? (json.data ?? []) : [];
}

export async function createRoom(data: { room_name: string; room_type?: string }) {
  const res = await apiFetch('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: Room; error?: string }>;
}

export async function updateRoom(id: number, data: { room_name?: string; room_type?: string | null }) {
  const res = await apiFetch(`/api/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: Room; error?: string }>;
}

export async function deleteRoom(id: number) {
  const res = await apiFetch(`/api/rooms/${id}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function getClassRooms(classId: number) {
  const res = await apiFetch(`/api/rooms/class/${classId}`);
  if (!res.ok) return { rooms: [] as Room[], fixed_room_id: null as number | null, fixedRoom: null as Room | null };
  const json = (await res.json()) as { success: boolean; data?: { rooms: Room[]; fixed_room_id: number | null; fixedRoom: Room | null } };
  return json.success ? json.data ?? { rooms: [], fixed_room_id: null, fixedRoom: null } : { rooms: [], fixed_room_id: null, fixedRoom: null };
}

export async function saveClassRooms(classId: number, roomIds: number[]) {
  const res = await apiFetch(`/api/rooms/class/${classId}`, {
    method: 'PUT',
    body: JSON.stringify({ room_ids: roomIds }),
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function setClassFixedRoom(classId: number, roomId: number | null) {
  const res = await apiFetch(`/api/rooms/class/${classId}/fixed`, {
    method: 'PUT',
    body: JSON.stringify({ fixed_room_id: roomId }),
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

export async function updateClass(classId: number, data: { homeroom_teacher_id?: number | null; class_name?: string; grade_level?: number }) {
  const res = await apiFetch(`/api/classes/${classId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function createClass(data: { class_name: string; grade_level?: number; school_year_id?: number; homeroom_teacher_id?: number | null }) {
  const res = await apiFetch('/api/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function deleteClass(classId: number) {
  const res = await apiFetch(`/api/classes/${classId}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function addStudentToClass(classId: number, studentData: { full_name?: string; student_code?: string; gender?: string; date_of_birth?: string; student_id?: number }) {
  const res = await apiFetch(`/api/classes/${classId}/students`, {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function removeStudentFromClass(classId: number, studentId: number) {
  const res = await apiFetch(`/api/classes/${classId}/students/${studentId}`, {
    method: 'DELETE',
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function logoutApi() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }
}

export async function getSecurityLogs(params?: { search?: string; action?: string; status?: string; role?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.action) qs.set('action', params.action);
  if (params?.status) qs.set('status', params.status);
  if (params?.role) qs.set('role', params.role);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/security-logs${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getSecurityLogStats() {
  const res = await apiFetch('/api/security-logs/stats');
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function askAiChatbot(question: string, provider: string = 'gemini') {
  const res = await apiFetch('/api/ai/chat/ask', {
    method: 'POST',
    body: JSON.stringify({ question, provider }),
  });
  return res.json() as Promise<{
    success: boolean;
    data?: {
      answer: string;
      citations?: any[];
      warnings?: string[];
      role?: string;
      userName?: string;
    };
    error?: string;
  }>;
}

export async function getYearTransitionOverview() {
  const res = await apiFetch('/api/year-transition/overview');
  const json = (await res.json()) as { success: boolean; data?: any };
  return json.success ? json.data : null;
}

export async function getYearTransitionPreview(fromYearId: number, toYearId: number) {
  const res = await apiFetch(`/api/year-transition/preview?fromYearId=${fromYearId}&toYearId=${toYearId}`);
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function getYearTransitionClasses(yearId: number) {
  const res = await apiFetch(`/api/year-transition/classes?yearId=${yearId}`);
  const json = (await res.json()) as { success: boolean; data?: any };
  return json.success ? json.data : [];
}

export async function applyYearTransition(fromYearId: number, toYearId: number, decisions: any[]) {
  const res = await apiFetch('/api/year-transition/apply', {
    method: 'POST',
    body: JSON.stringify({ fromYearId, toYearId, decisions }),
  });
  const json = (await res.json()) as { success: boolean; data?: any; error?: string };
  return json;
}

export async function activateSchoolYear(yearId: number) {
  const res = await apiFetch('/api/year-transition/activate', {
    method: 'POST',
    body: JSON.stringify({ yearId }),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}


