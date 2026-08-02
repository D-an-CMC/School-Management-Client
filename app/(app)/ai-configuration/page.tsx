'use client'

import { useState } from 'react'

export default function AdminAIPage() {
  const [temperature, setTemperature] = useState(70)
  const [riskThreshold, setRiskThreshold] = useState(60)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSaveConfig = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 500)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
            Cấu hình AI
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            Tùy chỉnh hành vi và tham số của AI Chatbot & Dự báo Học tập
          </p>
        </div>
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-5 py-2.5 bg-[#001d36] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-900 transition flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between">
          <span>✓ Đã lưu thành công tham số cấu hình AI hệ thống!</span>
          <button onClick={() => setSaveSuccess(false)} className="text-green-700 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 lg:mb-8">
        {/* Chatbot Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-3xl">🤖</span>
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900">Trợ lý ảo AI Chatbot</h3>
              <p className="text-xs md:text-sm text-gray-600">Dự đoán nhiệt độ (Temperature)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Độ chính xác vs Sáng tạo
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-gray-900 mt-1 md:mt-2">
                <span>Chính xác (0.0)</span>
                <span className="font-bold text-blue-600">{(temperature / 100).toFixed(1)}</span>
                <span>Sáng tạo (1.0)</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <p className="text-[10px] md:text-sm text-gray-700">
                AI sẽ tạo phản hồi cân bằng giữa tính chính xác ({(1 - temperature / 100).toFixed(1)}) và sáng tạo ({(temperature / 100).toFixed(1)}).
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-3xl">📊</span>
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900">Phân tích học đường</h3>
              <p className="text-xs md:text-sm text-gray-600">Cấu hình dự báo học tập</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Độ nhạy cảnh báo rủi ro
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-gray-900 mt-1 md:mt-2">
                <span>Thấp (0.0)</span>
                <span className="font-bold text-blue-600">{(riskThreshold / 100).toFixed(1)}</span>
                <span>Cao (1.0)</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <p className="text-[10px] md:text-sm text-gray-700">
                Ngưỡng cảnh báo sẽ được kích hoạt khi điểm dự báo học tập giảm dưới {(riskThreshold / 10).toFixed(1)} điểm.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Tiến độ cấu hình hệ thống</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-gray-900">100%</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Hoàn thành</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-green-600">3</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Model đang chạy</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-blue-600">12</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Prompt templates</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-orange-600">2</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Cảnh báo rủi ro</div>
          </div>
        </div>
      </div>
    </div>
  )
}
