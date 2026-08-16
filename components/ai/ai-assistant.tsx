'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  askAi,
  getAiConversations,
  getAiConversationMessages,
  deleteAiConversation,
  AiCitation,
  AiToolStep,
  AiToolStepData,
  AiConversation,
} from '@/lib/api'
import { Bot, Send, Plus, Trash2, History, X, Loader2, BookOpen, Database, Search, MessageSquareText, Table2, BarChart3 } from 'lucide-react'

interface LocalMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  citations?: AiCitation[]
  steps?: AiToolStep[]
  warnings?: string[]
  timestamp: string
}

const ROLE_NAME: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh',
}

const SUGGESTIONS: Record<string, string[]> = {
  admin: [
    'Sĩ số từng khối năm nay',
    'Top 10 học sinh có điểm trung bình cao nhất',
    'Thống kê điểm danh theo từng khối',
  ],
  teacher: [
    'Lớp tôi chủ nhiệm có bao nhiêu học sinh?',
    'Điểm trung bình môn tôi dạy',
    'Quy chế đánh giá và xếp loại học sinh',
  ],
  student: [
    'Điểm học kỳ 1 của em',
    'Thời khóa biểu của em',
    'Em đã vắng bao nhiêu buổi?',
  ],
}

const TOOL_LABEL: Record<string, string> = {
  execute_sql: 'Truy vấn dữ liệu',
  rag_search: 'Tìm tài liệu',
  get_db_schema: 'Xem cấu trúc CSDL',
}

function timeNow(): string {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function cellText(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

// Kiểm tra dữ liệu dạng (nhãn, số) để vẽ bar chart
function chartable(data: AiToolStepData): boolean {
  if (!data?.columns || !data?.rows || data.columns.length < 2 || data.rows.length < 2) return false
  const v = data.rows[0][1]
  return typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v)))
}

function MiniBarChart({ data }: { data: AiToolStepData }) {
  if (!data?.columns || !data?.rows) return null
  const [labelCol, valueCol] = data.columns
  const vals = data.rows.map((r) => ({ label: cellText(r[0]), value: Number(r[1]) }))
  const max = Math.max(...vals.map((v) => v.value), 1)
  return (
    <div className="mt-2 space-y-1">
      <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
        <BarChart3 size={11} /> Biểu đồ: {labelCol} theo {valueCol}
      </p>
      <div className="space-y-1">
        {vals.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-20 text-[9px] text-gray-500 truncate text-right shrink-0">{v.label}</span>
            <div className="flex-1 h-3 rounded bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded bg-[#003366]"
                style={{ width: `${Math.max((v.value / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-8 text-[9px] text-gray-600 font-semibold shrink-0">{v.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepDataTable({ data, maxRows }: { data: AiToolStepData; maxRows?: number }) {
  if (!data?.columns || !data?.rows || data.rows.length === 0) return null
  const cols = data.columns
  const rows = maxRows ? data.rows.slice(0, maxRows) : data.rows
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <div className="max-h-40 overflow-auto">
        <table className="w-full text-[10px]">
          <thead className="sticky top-0 bg-[#003366] text-white">
            <tr>
              {cols.map((c) => (
                <th key={c} className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                {cols.map((c, j) => (
                  <td key={j} className="px-2 py-1 text-gray-700 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                    {cellText(r[j])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DataModal({ step, onClose }: { step: AiToolStep; onClose: () => void }) {
  const data = step.data
  const hasData = !!data && !!data.columns && !!data.rows && data.rows.length > 0
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 bg-[#003366] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Table2 size={16} />
            <p className="text-sm font-bold">Dữ liệu truy vấn</p>
            {hasData && (
              <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded">
                {data.rowCount ?? data.rows!.length} dòng {data.limited && data.rows!.length >= data.limited ? `(giới hạn ${data.limited})` : ''}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-3 overflow-auto">
          {data?.error && !hasData && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{data.error}</div>
          )}
          {hasData && chartable(data) && <MiniBarChart data={data} />}
          {hasData && <StepDataTable data={data} />}
          {!hasData && !data?.error && (
            <p className="text-xs text-gray-500">Không có dữ liệu để hiển thị.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBadges({ step }: { step: AiToolStep }) {
  const data = step.data
  const hasData = !!data && !!data.columns && !!data.rows && data.rows.length > 0
  const err = !!data?.error
  if (!hasData) return null
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
        {data.rowCount ?? data.rows!.length} dòng
      </span>
      {chartable(data) && (
        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
          <BarChart3 size={9} className="inline mr-0.5" /> Chart
        </span>
      )}
      {err && (
        <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
          Có lỗi — AI đang thử lại
        </span>
      )}
    </div>
  )
}

export function AiAssistant() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [conversationId, setConversationId] = useState<number | undefined>(undefined)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [activeConv, setActiveConv] = useState<AiConversation | null>(null)
  const [modalStep, setModalStep] = useState<AiToolStep | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const role = user?.role || 'student'
  const roleName = ROLE_NAME[role] || 'Người dùng'

  useEffect(() => {
    if (isOpen && messages.length === 0 && !activeConv) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Xin chào ${user?.name || 'bạn'}! Tôi là Trợ lý AI Trường học — có thể truy vấn dữ liệu thật (điểm, TKB, điểm danh, sĩ số...) theo vai trò **${roleName}** và tra cứu tài liệu, quy chế của trường. Bạn cần hỗ trợ gì?`,
          timestamp: timeNow(),
        },
      ])
    }
  }, [isOpen, messages.length, activeConv, user?.name, roleName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadConversations = async () => {
    const list = await getAiConversations()
    setConversations(list)
  }

  const openHistory = () => {
    setHistoryOpen((v) => {
      const next = !v
      if (next) void loadConversations()
      return next
    })
  }

  const openConversation = async (conv: AiConversation) => {
    setHistoryOpen(false)
    setLoading(true)
    try {
      const msgs = await getAiConversationMessages(conv.conversation_id)
      const converted: LocalMessage[] = msgs.map((m) => ({
        id: String(m.message_id),
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
        citations: (m.citations || []) as AiCitation[],
        steps: (m.tools_used || []) as AiToolStep[],
        timestamp: new Date(m.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
      setMessages(converted)
      setConversationId(conv.conversation_id)
      setActiveConv(conv)
    } finally {
      setLoading(false)
    }
  }

  const removeConversation = async (id: number) => {
    await deleteAiConversation(id)
    await loadConversations()
    if (activeConv?.conversation_id === id) {
      setActiveConv(null)
      setConversationId(undefined)
      setMessages([])
    }
  }

  const newSession = () => {
    setConversationId(undefined)
    setActiveConv(null)
    setMessages([])
    setHistoryOpen(false)
  }

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    const userMsg: LocalMessage = {
      id: `u${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeNow(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await askAi(text, conversationId)
      if (res.success && res.data) {
        const d = res.data
        setConversationId(d.conversationId)
        setActiveConv((prev) =>
          ({ conversation_id: d.conversationId!, title: prev?.title || text.slice(0, 60), created_at: prev?.created_at || '', updated_at: '' })
        )
        setMessages((prev) => [
          ...prev,
          {
            id: `a${Date.now()}`,
            sender: 'ai',
            text: d.answer,
            citations: d.citations,
            steps: d.steps,
            warnings: d.warnings,
            timestamp: timeNow(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a${Date.now()}`,
            sender: 'ai',
            text: res.error || 'Rất tiếc, đã có lỗi xử lý. Vui lòng thử lại sau!',
            timestamp: timeNow(),
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          sender: 'ai',
          text: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối và thử lại!',
          timestamp: timeNow(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = SUGGESTIONS[role] || SUGGESTIONS.student

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#003366] hover:bg-[#002244] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border-2 border-white/20"
          title="Mở Trợ lý AI Trường học"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-300 group-hover:rotate-12 transition-transform">
            <Bot size={18} />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Trợ lý AI</p>
            <p className="text-[10px] text-blue-200">Hỏi dữ liệu & quy chế trường</p>
          </div>
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[370px] sm:w-[440px] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Trợ lý AI Trường Học
                  <span className="text-[9px] font-semibold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-300/30">
                    AGENT + RAG
                  </span>
                </h3>
                <p className="text-[10px] text-blue-200 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sẵn sàng • Vai trò: {roleName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={newSession}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                title="Phiên mới"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={openHistory}
                className={`w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors ${historyOpen ? 'bg-white/15 text-white' : 'text-white/80'}`}
                title="Lịch sử hội thoại"
              >
                <History size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {activeConv && (
            <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[11px] text-gray-600 shrink-0">
              <span className="truncate font-medium">💬 {activeConv.title || 'Hội thoại'}</span>
              <button
                onClick={() => removeConversation(activeConv.conversation_id)}
                className="text-red-500 hover:text-red-700 flex items-center gap-0.5 shrink-0 ml-2"
              >
                <Trash2 size={12} /> Xóa
              </button>
            </div>
          )}

          {historyOpen && (
            <div className="border-b border-gray-200 bg-gray-50 max-h-44 overflow-y-auto shrink-0">
              <p className="px-4 pt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Lịch sử hội thoại
              </p>
              {conversations.length === 0 && (
                <p className="px-4 py-2 text-xs text-gray-400">Chưa có hội thoại nào.</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.conversation_id}
                  onClick={() => openConversation(c)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <MessageSquareText size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate flex-1 text-xs text-gray-700">
                    {c.title || 'Hội thoại'}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(c.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#003366] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-2">
                      {msg.steps.map((s, i) => (
                        <div key={i} className="text-[10px] text-gray-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            {s.tool === 'rag_search' ? (
                              <Search size={11} className="text-emerald-500" />
                            ) : s.tool === 'execute_sql' ? (
                              <Database size={11} className="text-blue-500" />
                            ) : (
                              <BookOpen size={11} className="text-amber-500" />
                            )}
                            <span className="text-gray-400">
                              {TOOL_LABEL[s.tool] || s.tool}:
                            </span>
                            <span className="truncate">{s.summary}</span>
                          </div>
                          {s.tool === 'execute_sql' && s.data && (
                            <>
                              <StepBadges step={s} />
                              {s.data?.error ? (
                                <p className="mt-1 text-red-500">⚠️ {s.data.error}</p>
                              ) : (
                                <>
                                  <StepDataTable data={s.data} maxRows={8} />
                                  {s.data.rows && s.data.rows.length > 8 && (
                                    <button
                                      onClick={() => setModalStep(s)}
                                      className="mt-1.5 text-[10px] font-bold text-[#003366] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <Table2 size={10} /> Xem đầy đủ ({s.data.rows.length} dòng)
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                      <p className="font-bold text-[#003366] mb-1 flex items-center gap-1">
                        <BookOpen size={12} />
                        Nguồn tham khảo:
                      </p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        {msg.citations.slice(0, 4).map((c, i) => (
                          <li key={i} className="truncate">
                            {c.source_file || c.title || 'Tài liệu trường'}
                            {c.chunk_index != null ? ` (đoạn ${c.chunk_index})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.warnings && msg.warnings.length > 0 && (
                    <div className="mt-2 text-[10px] text-amber-600">
                      {msg.warnings.map((w, i) => (
                        <p key={i}>⚠️ {w}</p>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col gap-1.5 bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none max-w-[85%] text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#003366]" />
                  <span>Agent đang phân tích & truy vấn...</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366] animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 bg-white flex flex-wrap gap-1.5 shrink-0 border-t border-gray-100">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-[#003366] hover:text-white text-gray-600 border border-gray-200 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi: điểm số, TKB, sĩ số, quy chế..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all text-gray-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-[9px] text-gray-400 text-center mt-1.5 font-medium">
              Agentic AI + RAG • NVIDIA NIM • Đúng vai trò của bạn
            </p>
          </div>
        </div>
      )}

      {modalStep && <DataModal step={modalStep} onClose={() => setModalStep(null)} />}
    </div>
  )
}