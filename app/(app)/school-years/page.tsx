'use client'

import { useEffect, useState } from 'react'
import { getSchoolYears, createSchoolYear, updateSchoolYear, deleteSchoolYear } from '@/lib/api'

interface SchoolYear {
  school_year_id: number
  year_name: string
  start_date: string
  end_date: string
}

interface ApiResult { success: boolean; data?: SchoolYear; error?: string }

const emptyForm = { year_name: '', start_date: '', end_date: '' }

export default function SchoolYearsPage() {
  const [items, setItems] = useState<SchoolYear[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ year_name: '', start_date: '', end_date: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = (await getSchoolYears()) as SchoolYear[]
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (row: SchoolYear) => {
    setEditingId(row.school_year_id)
    setForm({ year_name: row.year_name, start_date: row.start_date, end_date: row.end_date })
    setError('')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Ban co chac chan muon xoa nam hoc nay?')) return
    await deleteSchoolYear(id)
    setItems(prev => prev.filter(i => i.school_year_id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.year_name || !form.start_date || !form.end_date) {
      setError('Vui long dien day du thong tin')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res: ApiResult = editingId
        ? await updateSchoolYear(editingId, form)
        : await createSchoolYear(form)
      if (!res.success) {
        setError(res.error || 'Co loi xay ra')
        setSubmitting(false)
        return
      }
      if (res.data) {
        setItems(prev => {
          const idx = prev.findIndex(i => i.school_year_id === res.data!.school_year_id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = res.data!
            return next
          }
          return [...prev, res.data!]
        })
      }
      setShowModal(false)
    } catch (err: any) {
      setError(err.message || 'Co loi xay ra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900">Quan ly nam hoc</h1>
          <p className="text-xs md:text-sm text-gray-900 mt-1">Quan ly cac nam hoc trong he thong</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Them nam hoc
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Dang tai...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chua co nam hoc nao</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left font-semibold text-gray-900">STT</th>
                  <th className="px-3 md:px-6 py-3 text-left font-semibold text-gray-900">Nam hoc</th>
                  <th className="px-3 md:px-6 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Tu ngay</th>
                  <th className="px-3 md:px-6 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">Den ngay</th>
                  <th className="px-3 md:px-6 py-3 text-left font-semibold text-gray-900">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={row.school_year_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 text-gray-900">{idx + 1}</td>
                    <td className="px-3 md:px-6 py-3 font-medium text-gray-900">{row.year_name}</td>
                    <td className="px-3 md:px-6 py-3 text-gray-900 hidden md:table-cell">
                      {row.start_date ? new Date(row.start_date).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 text-gray-900 hidden md:table-cell">
                      {row.end_date ? new Date(row.end_date).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="px-2 py-1 text-xs rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Sua
                        </button>
                        <button
                          onClick={() => handleDelete(row.school_year_id)}
                          className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Xoa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Sua nam hoc' : 'Them nam hoc'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nam hoc (vi du: 2024-2025)</label>
                <input
                  type="text"
                  value={form.year_name}
                  onChange={(e) => setForm(f => ({ ...f, year_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                  placeholder="2024-2025"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tu ngay</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Den ngay</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Huy
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Dang luu...' : editingId ? 'Cap nhat' : 'Tao moi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
