'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

const validAccounts = [
  { email: 'admin@cmc.edu.vn', password: '12345a', role: 'admin', name: 'Quản lí' },
  { email: 'teacher@cmc.edu.vn', password: '12345a', role: 'teacher', name: 'Giáo viên' },
  { email: 'student@cmc.edu.vn', password: '12345a', role: 'student', name: 'Học sinh' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | null>(null)

  const handleLogin = async (e: React.FormEvent, role?: 'admin' | 'teacher' | 'student') => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const targetRole = role || selectedRole
      const account = validAccounts.find((acc) => acc.role === targetRole)

      if (!account) {
        setError('Vui lòng chọn vai trò hợp lệ')
        setIsLoading(false)
        return
      }

      // Validate credentials
      if (email !== account.email || password !== account.password) {
        setError('Email hoặc mật khẩu không chính xác')
        setIsLoading(false)
        return
      }

      await login(email, password, targetRole)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Animated floating shapes - education related */}
        <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce">📚</div>
        <div className="absolute top-1/3 right-20 text-5xl opacity-15 animate-bounce" style={{ animationDelay: '0.5s' }}>🎓</div>
        <div className="absolute bottom-1/3 left-1/4 text-5xl opacity-15 animate-bounce" style={{ animationDelay: '1s' }}>✏️</div>
        <div className="absolute top-2/3 right-1/4 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>🔬</div>
      </div>

      {/* AI Feature Badge */}
      <div className="absolute top-8 left-8 z-20">
        <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 text-white text-sm font-medium flex items-center gap-2">
          <span>✨</span>
          Tích hợp AI cho giáo dục
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full relative z-10">
        {/* Left Section */}
        <div className="flex flex-col justify-center text-white">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Hệ thống quản lý trường học thông minh tích hợp <span className="text-blue-300">AI</span>
          </h1>
          <p className="text-lg opacity-90 mb-12">
            Nền tảng quản trị giáo dục hiện đại, bảo mật và tối ưu hóa cho đội ngũ cần bộ Trường THPT Chuyên CMC.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Bảo mật RBAC</h3>
              <p className="text-sm opacity-80">Mã hóa dữ liệu 256-bit</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">AI Analytics</h3>
              <p className="text-sm opacity-80">Phân tích hành vi ứng dụng thực</p>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-center h-fit">
          {/* Header */}
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">CMC</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#0B3D5C] mb-2">TRƯỜNG THPT CHUYÊN CMC</h2>
            <p className="text-center text-gray-600 text-sm">Trường THPT Chuyên CMC</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">CHỌN VAI TRÒ</label>
            <div className="grid grid-cols-3 gap-2">
              {validAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => {
                    setSelectedRole(account.role as any)
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedRole === account.role
                      ? 'bg-[#0066CC] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">TÊN ĐĂNG NHẬP HOẶC EMAIL</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-600">👤</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@school.edu.vn"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">MẬT KHẨU</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-600">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-[#0066CC] rounded focus:ring-[#0066CC]" />
                <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="#" className="text-sm text-[#0066CC] hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedRole}
              onClick={(e) => handleLogin(e, selectedRole as any)}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Đang đăng nhập...' : `Đăng nhập với vai trò ${validAccounts.find(a => a.role === selectedRole)?.name || ''}`}
              <span>→</span>
            </button>
          </form>

          {/* Role Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Nếu bạn là giáo viên |{' '}
              <button
                onClick={() => {
                  setSelectedRole('student')
                  setEmail('student@cmc.edu.vn')
                  setPassword('12345a')
                }}
                className="text-[#0066CC] hover:underline font-medium"
              >
                Nếu bạn là học sinh?
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
            <p>
              🔒 Hệ thống được bảo mật bằng cơ chế mã hóa JWT & Phân quyền RBAC
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
