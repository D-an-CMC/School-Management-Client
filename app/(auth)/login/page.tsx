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
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('admin')

  const currentAccount = validAccounts.find((acc) => acc.role === selectedRole)

  const handleRoleChange = (role: 'admin' | 'teacher' | 'student') => {
    setSelectedRole(role)
    const account = validAccounts.find((acc) => acc.role === role)
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
    }
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Find matching account by email and password and selected role
      const account = validAccounts.find((acc) => acc.email === email && acc.password === password && acc.role === selectedRole)

      if (!account) {
        setError('Email hoặc mật khẩu không chính xác')
        setIsLoading(false)
        return
      }

      await login(email, password, account.role)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonColor = () => {
    switch (selectedRole) {
      case 'admin':
        return 'bg-red-600 hover:bg-red-700'
      case 'teacher':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'student':
        return 'bg-green-600 hover:bg-green-700'
      default:
        return 'bg-red-600 hover:bg-red-700'
    }
  }

  const getButtonText = () => {
    switch (selectedRole) {
      case 'admin':
        return 'Đăng nhập với vai trò Quản trị viên'
      case 'teacher':
        return 'Đăng nhập với vai trò Giáo viên'
      case 'student':
        return 'Đăng nhập với vai trò Học sinh'
      default:
        return 'Đăng nhập'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* SVG animated background pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Animated lines representing knowledge flow */}
          <path d="M 0 400 Q 300 200, 600 400 T 1200 400" stroke="url(#grad1)" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 1200 400 Q 900 600, 600 400 T 0 400" stroke="url(#grad1)" strokeWidth="2" fill="none" opacity="0.4" />
          
          {/* Animated network nodes */}
          <circle cx="200" cy="150" r="4" fill="white" opacity="0.8" />
          <circle cx="600" cy="100" r="4" fill="white" opacity="0.8" />
          <circle cx="1000" cy="200" r="4" fill="white" opacity="0.8" />
          <circle cx="150" cy="600" r="4" fill="white" opacity="0.8" />
          <circle cx="750" cy="650" r="4" fill="white" opacity="0.8" />
        </svg>

        {/* Animated gradient circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute right-1/3 bottom-1/4 w-72 h-72 bg-cyan-400/5 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Animated floating education icons with smooth movement */}
        <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce" style={{
          animation: 'bounce 4s infinite',
          transformOrigin: 'center bottom'
        }}>📚</div>
        
        <div className="absolute top-1/3 right-20 text-5xl opacity-15 animate-bounce" style={{
          animationDelay: '0.5s',
          animation: 'bounce 5s infinite',
          transformOrigin: 'center bottom'
        }}>🎓</div>
        
        <div className="absolute bottom-1/3 left-1/4 text-5xl opacity-15 animate-bounce" style={{
          animationDelay: '1s',
          animation: 'bounce 6s infinite',
          transformOrigin: 'center bottom'
        }}>✏️</div>
        
        <div className="absolute top-2/3 right-1/4 text-6xl opacity-20 animate-bounce" style={{
          animationDelay: '1.5s',
          animation: 'bounce 4.5s infinite',
          transformOrigin: 'center bottom'
        }}>🔬</div>

        {/* Additional animated elements */}
        <div className="absolute left-1/2 top-1/4 text-7xl opacity-10 animate-bounce" style={{
          animationDelay: '2s',
          animation: 'bounce 7s infinite',
          transformOrigin: 'center bottom'
        }}>🏫</div>

        <div className="absolute right-1/3 top-2/3 text-6xl opacity-12 animate-bounce" style={{
          animationDelay: '2.5s',
          animation: 'bounce 5.5s infinite',
          transformOrigin: 'center bottom'
        }}>💡</div>

        <div className="absolute left-1/3 bottom-1/4 text-5xl opacity-15 animate-bounce" style={{
          animationDelay: '1.2s',
          animation: 'bounce 6.5s infinite',
          transformOrigin: 'center bottom'
        }}>🎨</div>

        {/* Floating knowledge bubbles */}
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse" style={{
          animation: 'pulse 3s infinite',
          animationDelay: '0.3s'
        }}></div>

        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border-2 border-white/15 rounded-full animate-pulse" style={{
          animation: 'pulse 4s infinite',
          animationDelay: '0.8s'
        }}></div>

        <div className="absolute top-1/4 right-1/3 w-24 h-24 border border-white/10 rounded-full animate-pulse" style={{
          animation: 'pulse 3.5s infinite',
          animationDelay: '0.5s'
        }}></div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
        `}</style>
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
            Nền tảng quản trị giáo dục hiện đại, bảo mật và tối ưu hóa cho đội ngũ cần bộ Trường THCS CMC.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-white mb-2">Bảo mật RBAC</h3>
              <p className="text-sm opacity-80">Mã hóa dữ liệu 256-bit</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-white mb-2">AI Analytics</h3>
              <p className="text-sm opacity-80">Phân tích hành vi ứng dụng thực</p>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-center h-fit">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center">
            <div className="mb-6">
              <img
                src="/cmc-logo.png"
                alt="CMC Secondary School Logo"
                className="h-48 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-[#0B3D5C]">TRƯỜNG THCS CMC</h2>
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
                  placeholder="username@truong.edu.vn"
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
              disabled={isLoading}
              className={`w-full ${getButtonColor()} disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              {isLoading ? 'Đang đăng nhập...' : getButtonText()}
              <span>→</span>
            </button>
          </form>

          {/* Role Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {selectedRole !== 'teacher' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className="text-yellow-600 hover:text-yellow-700 font-medium hover:underline"
                  >
                    Nếu bạn là giáo viên?
                  </button>
                  {selectedRole !== 'student' && ' | '}
                </>
              )}
              {selectedRole !== 'student' && (
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  Nếu bạn là học sinh?
                </button>
              )}
              {selectedRole !== 'admin' && selectedRole !== 'teacher' && ' | '}
              {selectedRole !== 'admin' && (
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className="text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                  Nếu bạn là quản trị viên?
                </button>
              )}
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
