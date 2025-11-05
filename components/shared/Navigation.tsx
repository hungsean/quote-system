'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  readonly isAuthenticated: boolean
}

export function Navigation({ isAuthenticated }: NavigationProps) {
  const pathname = usePathname()

  if (!isAuthenticated) {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            估價系統
          </Link>
          <div className="flex gap-2">
            <Button asChild variant={pathname === '/login' ? 'default' : 'ghost'}>
              <Link href="/login">登入</Link>
            </Button>
            <Button asChild variant={pathname === '/register' ? 'default' : 'outline'}>
              <Link href="/register">註冊</Link>
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold">
          估價系統
        </Link>
        <div className="flex gap-4">
          <Button asChild variant={pathname.startsWith('/dashboard/products') ? 'default' : 'ghost'}>
            <Link href="/dashboard/products">商品管理</Link>
          </Button>
          <Button asChild variant={pathname.startsWith('/dashboard/quote') ? 'default' : 'ghost'}>
            <Link href="/dashboard/quote">建立估價</Link>
          </Button>
          <Button asChild variant={pathname.startsWith('/dashboard/history') ? 'default' : 'ghost'}>
            <Link href="/dashboard/history">歷史紀錄</Link>
          </Button>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="outline">
              登出
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
