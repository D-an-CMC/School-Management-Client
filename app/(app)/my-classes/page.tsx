'use client'

import { mockClasses } from '@/lib/mock-data'

export default function MyClassesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách lớp phụ trách</h1>
      <p className="text-gray-700 mb-8">Xem tất cả các lớp quản lý được sắp xếp theo mã lớp & chuyên ngành</p>

      <div className="text-sm text-blue-600 mb-6">
        <a href="#" className="hover:underline">Xem tất cả →</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{classItem.code}</h3>
                  <p className="text-sm text-gray-700">{classItem.name}</p>
                </div>
                <div className="text-3xl font-bold text-blue-500">{classItem.students}</div>
              </div>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-900">👨‍🏫</span>
                <span className="text-gray-900 font-medium">{classItem.instructor}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-900">📅</span>
                <span className="text-gray-900">{classItem.schedule}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-900">📍</span>
                <span className="text-gray-900">{classItem.room}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-900">🎓</span>
                <span className="text-gray-900">{classItem.credits} credits</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition-colors text-sm">
                View Class
              </button>
              <button className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors text-sm">
                More Info
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Classes Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{mockClasses.length}</div>
          <div className="text-gray-900">Tổng số lớp</div>
          <div className="text-sm text-gray-700 mt-2">Được giao cho bạn</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {mockClasses.reduce((sum, c) => sum + c.students, 0)}
          </div>
          <div className="text-gray-900">Tổng số học sinh</div>
          <div className="text-sm text-gray-700 mt-2">Trên tất cả các lớp</div>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {mockClasses.reduce((sum, c) => sum + c.credits, 0)}
          </div>
          <div className="text-gray-900">Tổng số tín chỉ</div>
          <div className="text-sm text-gray-700 mt-2">Cộng các tín chỉ</div>
        </div>
      </div>
    </div>
  )
}
