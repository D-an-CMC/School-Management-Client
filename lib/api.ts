const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

export async function getMe(): Promise<{ id: number; email: string; role: string; name: string } | null> {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.success || !json?.data?.id) return null;
  const u = json.data;
  return { id: u.id, email: u.email, role: u.role, name: u.name };
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

export async function getTeachers(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/teachers${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getTeacherStats() {
  const res = await apiFetch('/api/teachers/stats/summary');
  const json = (await res.json()) as any;
  return json.data ?? json;
}

export async function getClasses(params?: { teacherId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
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

export async function getClassesCount() {
  const res = await apiFetch('/api/classes');
  if (!res.ok) return 0;
  const json = (await res.json()) as PaginatedResponse<any>;
  return json.total || 0;
}

export async function getGradeStats() {
  const res = await apiFetch('/api/classes/stats/by-grade');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getGradesByClass(classId: number) {
  const res = await apiFetch(`/api/grades/class/${classId}`);
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

export async function getAttendanceSessions(params?: { teacherId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/attendance/sessions${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function createAttendanceSession(data: { teacherId?: number; sessionDate?: string }) {
  const res = await apiFetch('/api/attendance/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function getAttendanceSession(sessionId: number) {
  const res = await apiFetch(`/api/attendance/sessions/${sessionId}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success: boolean; data: any };
  return json.success ? json.data : null;
}

export async function getTimetables(params?: { teacherId?: number; classId?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.teacherId) qs.set('teacherId', String(params.teacherId));
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/timetables${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getExamSchedules(params?: { classId?: number; semesterId?: number }) {
  const qs = new URLSearchParams();
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.semesterId) qs.set('semesterId', String(params.semesterId));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/exam-schedules${suffix}`);
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : null;
}

export async function getRiskStats() {
  const res = await apiFetch('/api/ai/risk-warnings/stats');
  const json = (await res.json()) as { success: boolean; data?: any };
  return json.success ? json.data : null;
}

export async function getRiskWarnings(params?: { classId?: number; studentId?: number }) {
  const qs = new URLSearchParams();
  if (params?.classId) qs.set('classId', String(params.classId));
  if (params?.studentId) qs.set('studentId', String(params.studentId));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/ai/risk-warnings${suffix}`);
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

export async function getMyNotifications(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const res = await apiFetch(`/api/notifications/my${suffix}`);
  const json = (await res.json()) as PaginatedResponse<any>;
  return json;
}

export async function getSchoolYears() {
  const res = await apiFetch('/api/school-years');
  const json = (await res.json()) as { success: boolean; data?: any[] };
  return json.success ? json.data : [];
}

export async function createSchoolYear(data: { year_name: string; start_date: string; end_date: string }) {
  const res = await apiFetch('/api/school-years', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ success: boolean; data?: any; error?: string }>;
}

export async function updateSchoolYear(id: number, data: { year_name: string; start_date: string; end_date: string }) {
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
