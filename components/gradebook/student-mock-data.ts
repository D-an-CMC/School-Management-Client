export interface SubjectGrade {
  subject: string
  abbr: string
  color: string
  bgColor: string
  freq: number[]
  mid: number
  final: number
  aiPrediction: number
  average: number
}

export const STUDENT_MOCK_DATA: SubjectGrade[] = [
  { subject: 'Toán học', abbr: 'TOÁN', color: 'text-blue-800', bgColor: 'bg-blue-100', freq: [8.5, 9.0, 8.0, 8.5], mid: 8.5, final: 9.0, aiPrediction: 9.2, average: 8.8 },
  { subject: 'Ngữ văn', abbr: 'VĂN', color: 'text-rose-800', bgColor: 'bg-rose-100', freq: [7.5, 8.0, 8.0, 7.0], mid: 7.5, final: 8.5, aiPrediction: 8.4, average: 7.9 },
  { subject: 'Tiếng Anh', abbr: 'ANH', color: 'text-amber-800', bgColor: 'bg-amber-100', freq: [9.5, 10, 9.5, 9.0], mid: 9.5, final: 9.5, aiPrediction: 9.8, average: 9.6 },
  { subject: 'Vật lý', abbr: 'VẬT', color: 'text-cyan-800', bgColor: 'bg-cyan-100', freq: [8.0, 8.5, 7.5, 8.0], mid: 8.0, final: 8.0, aiPrediction: 8.2, average: 8.0 },
  { subject: 'Hóa học', abbr: 'HÓA', color: 'text-purple-800', bgColor: 'bg-purple-100', freq: [7.0, 7.5, 7.0, 8.0], mid: 7.5, final: 7.0, aiPrediction: 7.5, average: 7.3 },
  { subject: 'Sinh học', abbr: 'SINH', color: 'text-green-800', bgColor: 'bg-green-100', freq: [8.5, 8.0, 9.0, 8.5], mid: 8.5, final: 8.5, aiPrediction: 8.7, average: 8.5 },
  { subject: 'Lịch sử', abbr: 'SỬ', color: 'text-orange-800', bgColor: 'bg-orange-100', freq: [9.0, 8.5, 9.0, 9.5], mid: 9.0, final: 9.0, aiPrediction: 9.3, average: 9.1 },
  { subject: 'Địa lý', abbr: 'ĐỊA', color: 'text-emerald-800', bgColor: 'bg-emerald-100', freq: [8.0, 8.0, 8.5, 8.0], mid: 8.0, final: 8.0, aiPrediction: 8.1, average: 8.1 },
]
