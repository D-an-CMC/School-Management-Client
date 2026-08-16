'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
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
  execute_write: 'Ghi dữ liệu',
  rag_search: 'Tìm tài liệu',
  get_db_schema: 'Xem cấu trúc CSDL',
}

function timeNow(): string {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function MarkdownView({ text }: { text: string }) {
  return (
    <div className="md-body whitespace-pre-wrap">
      <ReactMarkdown
        components={{
        a: ({ node, ...props }) => (
          <a {...props} className="text-blue-700 underline underline-offset-2 break-all" target="_blank" rel="noopener noreferrer" />
        ),
        table: ({ node, ...props }) => (
          <div className="my-2 overflow-x-auto rounded border border-gray-300">
            <table {...props} className="w-full text-[11px] border-collapse" />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead {...props} className="bg-gray-100 text-gray-700" />
        ),
        th: ({ node, ...props }) => (
          <th {...props} className="px-2 py-1.5 text-left font-semibold whitespace-nowrap" />
        ),
        td: ({ node, ...props }) => (
          <td {...props} className="px-2 py-1 border-t border-gray-200 text-gray-700 align-top" />
        ),
        code: ({ node, className, children, ...props }) => {
          const inline = !className
          return (
            <code
              {...props}
              className={
                inline
                  ? 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[10.5px] font-mono'
                  : 'block bg-gray-100 text-gray-800 p-2 rounded text-[10.5px] font-mono overflow-x-auto my-1.5 whitespace-pre'
              }
            >
              {children}
            </code>
          )
        },
        strong: ({ node, ...props }) => <strong {...props} className="font-bold text-gray-900" />,
        ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-1 space-y-0.5" />,
        ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-1 space-y-0.5" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-sm font-bold mt-2 mb-1" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-[13px] font-bold mt-2 mb-1" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-xs font-bold mt-1.5 mb-0.5" />,
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-2 border-gray-300 pl-2 my-1 text-gray-600 italic" />
        ),
      }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

function cellText(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

// Bảng dữ liệu tối giản (không màu, không biểu đồ)
function StepDataTable({ data, maxRows }: { data: AiToolStepData; maxRows?: number }) {
  if (!data?.columns || !data?.rows || data.rows.length === 0) return null
  const cols = data.columns
  const rows = maxRows ? data.rows.slice(0, maxRows) : data.rows
  return (
    <div className="mt-2 rounded border border-gray-300 overflow-hidden">
      <div className="max-h-40 overflow-auto">
        <table className="w-full text-[10px]">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              {cols.map((c) => (
                <th key={c} className="px-2 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{c}</th>
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
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <p className="text-sm font-bold text-gray-900">Kết quả dữ liệu</p>
            {hasData && (
              <p className="text-[10px] text-gray-500">
                {data.rowCount ?? data.rows!.length} dòng{data.limited && data.rows!.length >= data.limited ? ` (giới hạn ${data.limited})` : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
            Đóng
          </button>
        </div>
        <div className="p-3 overflow-auto">
          {data?.error && !hasData && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{data.error}</div>
          )}
          {hasData && <StepDataTable data={data} />}
          {!hasData && !data?.error && (
            <p className="text-xs text-gray-500">Không có dữ liệu để hiển thị.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Huy hiệu gọi tool — tối giản, không màu, không icon
function ToolBadge({ step }: { step: AiToolStep }) {
  const data = step.data
  const hasData = !!data && !!data.columns && !!data.rows && data.rows.length > 0
  const err = !!data?.error
  return (
    <div className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600">
      <span className="border border-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">
        {TOOL_LABEL[step.tool] || step.tool}
      </span>
      <span>{step.summary}</span>
      {hasData && (
        <span className="text-gray-400">({data.rowCount ?? data.rows!.length} dòng)</span>
      )}
      {err && <span className="text-red-600">— có lỗi, AI đang thử lại</span>}
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
  // M4: bỏ qua phản hồi của câu hỏi nếu người dùng đã chuyển/tạo hội thoại khác trong lúc chờ.
  const convIdRef = useRef<number | undefined>(undefined)

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
    convIdRef.current = conv.conversation_id
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
    convIdRef.current = undefined
    setConversationId(undefined)
    setActiveConv(null)
    setMessages([])
    setHistoryOpen(false)
  }

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    const sendConvId = convIdRef.current
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
      // M4: user đã chuyển hội thoại giữa chừng → không đổ câu trả lời vào chat hiện tại.
      const stillCurrent = convIdRef.current === sendConvId
      if (res.success && res.data && stillCurrent) {
        const d = res.data
        setConversationId(d.conversationId)
        convIdRef.current = d.conversationId
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
      } else if (stillCurrent) {
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
      if (convIdRef.current === sendConvId) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a${Date.now()}`,
            sender: 'ai',
            text: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối và thử lại!',
            timestamp: timeNow(),
          },
        ])
      }
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
          className="bg-white border border-gray-300 hover:border-gray-400 shadow-lg px-4 py-2.5 rounded-lg text-left cursor-pointer"
          title="Mở Trợ lý AI Trường học"
        >
          <p className="text-xs font-bold text-gray-900">Trợ lý AI Trường học</p>
          <p className="text-[10px] text-gray-500">Hỏi số liệu, quy chế, điểm, TKB...</p>
        </button>
      )}

      {isOpen && (
        <div className="w-[370px] sm:w-[440px] h-[580px] bg-white rounded-lg shadow-xl border border-gray-300 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Trợ lý AI Trường học</h3>
              <p className="text-[10px] text-gray-500">Quyền truy cập: {roleName}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={newSession}
                className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                title="Phiên mới"
              >
                Phiên mới
              </button>
              <button
                onClick={openHistory}
                className={`font-medium cursor-pointer ${historyOpen ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                title="Lịch sử hội thoại"
              >
                Lịch sử
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                title="Đóng"
              >
                Đóng
              </button>
            </div>
          </div>

          {activeConv && (
            <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[11px] text-gray-600 shrink-0">
              <span className="truncate font-medium">{activeConv.title || 'Hội thoại'}</span>
              <button
                onClick={() => removeConversation(activeConv.conversation_id)}
                className="text-gray-500 hover:text-red-600 font-medium shrink-0 ml-2 cursor-pointer"
              >
                Xóa
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
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
                >
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

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-lg text-xs sm:text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-gray-200 border-gray-300 text-gray-900'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <p className="md-body prose-p:my-0.5 max-w-full overflow-x-auto">
                    <MarkdownView text={msg.text} />
                  </p>

                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 space-y-1.5">
                      {msg.steps.map((s, i) => (
                        <div key={i} className="text-[10px] text-gray-500">
                          <div className="flex flex-col gap-0.5">
                            <ToolBadge step={s} />
                            {s.tool === 'execute_sql' && s.data && (
                              <>
                                {s.data?.error ? (
                                  <p className="mt-0.5 text-red-600">{s.data.error}</p>
                                ) : (
                                  <>
                                    <StepDataTable data={s.data} maxRows={8} />
                                    {s.data.rows && s.data.rows.length > 8 && (
                                      <button
                                        onClick={() => setModalStep(s)}
                                        className="mt-1 text-[10px] font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2 cursor-pointer self-start"
                                      >
                                        Xem đầy đủ ({s.data.rows.length} dòng)
                                      </button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                      <p className="font-semibold mb-0.5">Nguồn tham khảo:</p>
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
                    <div className="mt-2 text-[10px] text-gray-600">
                      {msg.warnings.map((w, i) => (
                        <p key={i}>Lưu ý: {w}</p>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-white border border-gray-300 text-gray-600 p-3 rounded-lg max-w-[85%] text-xs">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]" />
                </span>
                <span>Đang truy vấn dữ liệu...</span>
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
                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 transition-colors cursor-pointer"
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
                className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:bg-white transition-all text-gray-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-3.5 h-9 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                Gửi
              </button>
            </form>
            <p className="text-[9px] text-gray-400 text-center mt-1.5 font-medium">
              AI truy vấn dữ liệu theo đúng quyền của bạn
            </p>
          </div>
        </div>
      )}

      {modalStep && <DataModal step={modalStep} onClose={() => setModalStep(null)} />}
    </div>
  )
}