'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClassMaganementRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/class-management')
  }, [router])

  return (
    <div className="p-8 text-center text-gray-500">
      Đang chuyển hướng sang trang Quản lý lớp...
    </div>
  )
}
