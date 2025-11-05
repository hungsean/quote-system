'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          setFieldErrors(data.details)
        }
        throw new Error(data.error || '註冊失敗')
      }

      // 註冊成功,導向登入頁面
      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗,請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>註冊帳號</CardTitle>
        <CardDescription>建立一個新的帳號開始使用估價系統</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">電子郵件</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="至少 8 個字元"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              密碼必須包含至少 8 個字元,包括大寫、小寫字母和數字
            </p>
            {fieldErrors.password && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '註冊中...' : '註冊'}
          </Button>

          <div className="text-center text-sm">
            已經有帳號了嗎?{' '}
            <Link href="/login" className="text-primary hover:underline">
              登入
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
