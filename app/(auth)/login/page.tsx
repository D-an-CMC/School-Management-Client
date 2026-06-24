'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full relative z-10">
        {/* Left Section */}
        <div className="flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Hệ thống quản lý trường học thông minh tích hợp AI
          </h1>
          <p className="text-lg opacity-90">
            Nền tảng quản trị giáo dục hiện đại, bảo mật và tối ưu hóa cho đội ngũ cần bộ CMC University.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Bảo mật RBAC</h3>
              <p className="text-sm opacity-80">Mã hóa dữ liệu 256-bit</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">AI Analytics</h3>
              <p className="text-sm opacity-80">Phân tích hành vi ứng dụng thực</p>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">CMC</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-[#0B3D5C] mb-2">TRƯỜNG THPT CHUYÊN CMC</h2>
            <p className="text-center text-gray-600 text-sm">Trường THPT Chuyên CMC</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TÊN ĐĂNG NHẬP HOẶC EMAIL
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">👤</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">MẬT KHẨU</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">🔒</span>
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
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-[#0066CC] rounded focus:ring-[#0066CC]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Ghi nhớ đăng nhập
              </label>
              <Link href="#" className="ml-auto text-sm text-[#0066CC] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              <span className="inline-flex items-center gap-1">
                🔒
              </span>
              Hệ thống được bảo mật bằng cơ chế mã hóa JWT & Phân quyền RBAC
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
