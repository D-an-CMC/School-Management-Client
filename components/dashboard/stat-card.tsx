interface StatCardProps {
  icon?: string
  title: string
  badge?: string
  action?: string
  content?: React.ReactNode
}

export function StatCard({
  icon,
  title,
  badge,
  action,
  content,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{badge}</span>}
          </div>
        </div>
        {action && (
          <a href="#" className="text-xs text-blue-600 font-medium hover:underline">
            {action}
          </a>
        )}
      </div>
      <div className="px-6 py-4">{content}</div>
    </div>
  )
}
