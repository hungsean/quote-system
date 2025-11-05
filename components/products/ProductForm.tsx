'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProductForm() {
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
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      unit_price: Number.parseFloat(formData.get('unit_price') as string),
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          setFieldErrors(result.details)
        }
        throw new Error(result.error || '建立商品失敗')
      }

      // 成功建立,導向商品列表
      router.push('/dashboard/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立商品失敗,請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新增商品</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">商品名稱</Label>
            <Input
              id="name"
              name="name"
              placeholder="請輸入商品名稱"
              required
              maxLength={255}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">商品描述</Label>
            <textarea
              id="description"
              name="description"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="請輸入商品描述"
              required
              maxLength={2000}
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.description[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">商品類別</Label>
            <Input
              id="category"
              name="category"
              placeholder="例如: 傢俱、電子產品、辦公用品"
              required
              maxLength={100}
            />
            {fieldErrors.category && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.category[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="unit_price">單價 (NT$)</Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
            />
            {fieldErrors.unit_price && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.unit_price[0]}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '建立中...' : '建立商品'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
