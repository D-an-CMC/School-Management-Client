export interface StudentGradeRow {
  id: string
  name: string
  classCode: string
  avatarLetter: string
  avatarBg: string
  avatarText: string
  scores: {
    freq: string[]       // 4 regular assessment scores
    midTerm: string      // mid-term score
    finalTerm: string    // final-term score
  }
  aiPrediction: string
  average: string
}

export const TEACHER_MOCK_CLASS = {
  name: '6A1',
  studentCount: 5,
  subject: 'Toán học',
  semester: 'Học kỳ I',
  year: '2023 - 2024',
  school: 'Trường THPT Chuyên CMC',
}

export const TEACHER_MOCK_STUDENTS: StudentGradeRow[] = [
  {
    id: '1',
    name: 'Dang Mai',
    classCode: '6A1-01',
    avatarLetter: 'D',
    avatarBg: 'bg-secondary-fixed',
    avatarText: 'text-on-secondary-fixed',
    scores: { freq: ['-', '-', '-', '-'], midTerm: '-', finalTerm: '-' },
    aiPrediction: '-',
    average: '-',
  },
  {
    id: '2',
    name: 'Do An',
    classCode: '6A1-04',
    avatarLetter: 'D',
    avatarBg: 'bg-primary-fixed-dim',
    avatarText: 'text-on-primary-fixed',
    scores: { freq: ['-', '-', '-', '-'], midTerm: '-', finalTerm: '-' },
    aiPrediction: '-',
    average: '-',
  },
  {
    id: '3',
    name: 'Do Huy',
    classCode: '6A1-03',
    avatarLetter: 'D',
    avatarBg: 'bg-tertiary-fixed-dim',
    avatarText: 'text-on-tertiary-fixed',
    scores: { freq: ['-', '-', '-', '-'], midTerm: '-', finalTerm: '-' },
    aiPrediction: '-',
    average: '-',
  },
  {
    id: '4',
    name: 'Huynh Dat',
    classCode: '6A1-02',
    avatarLetter: 'H',
    avatarBg: 'bg-surface-container-highest',
    avatarText: 'text-on-surface',
    scores: { freq: ['-', '-', '-', '-'], midTerm: '-', finalTerm: '-' },
    aiPrediction: '-',
    average: '-',
  },
  {
    id: '5',
    name: 'Nguyen Lan',
    classCode: '6A1-05',
    avatarLetter: 'N',
    avatarBg: 'bg-green-200',
    avatarText: 'text-green-800',
    scores: { freq: ['-', '-', '-', '-'], midTerm: '-', finalTerm: '-' },
    aiPrediction: '-',
    average: '-',
  },
]
