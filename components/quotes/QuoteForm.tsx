'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Product } from '@/lib/types'

interface QuoteFormProps {
  onSuccess?: () => void
}

export function QuoteForm({ onSuccess }: QuoteFormProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')

        if (!response.ok) {
          setError('無法載入商品清單')
          return
        }

        const data = await response.json()
        setProducts(data.products || [])

        if (data.products && data.products.length > 0) {
          setSelectedProduct(data.products[0])
        }
      } catch (err) {
        console.error('Fetch products error:', err)
        setError('載入商品時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value
    const product = products.find((p) => p.id === productId)
    setSelectedProduct(product || null)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, Math.min(999999, value)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedProduct) {
      setError('請選擇商品')
      return
    }

    if (quantity < 1) {
      setError('數量必須至少為 1')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          quantity,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '無法建立報價')
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/history')
      }
    } catch (err) {
      console.error('Submit quote error:', err)
      setError('建立報價時發生錯誤')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">您還沒有建立任何商品，請先新增商品</p>
      </div>
    )
  }

  const quoteValue = selectedProduct
    ? Number((selectedProduct.unit_price * quantity).toFixed(2))
    : 0

  const formattedUnitPrice = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(selectedProduct?.unit_price || 0)

  const formattedQuoteValue = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(quoteValue)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 商品選擇 */}
      <div className="space-y-2">
        <Label htmlFor="product">選擇商品 *</Label>
        <select
          id="product"
          value={selectedProduct?.id || ''}
          onChange={handleProductChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- 請選擇商品 --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (NT${product.unit_price.toLocaleString('zh-TW', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })})
            </option>
          ))}
        </select>
      </div>

      {/* 商品詳情 */}
      {selectedProduct && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600">商品名稱</p>
            <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">分類</p>
            <p className="text-gray-700">{selectedProduct.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">單價</p>
            <p className="text-lg font-bold text-blue-600">{formattedUnitPrice}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">描述</p>
            <p className="text-gray-700 line-clamp-2">{selectedProduct.description}</p>
          </div>
        </div>
      )}

      {/* 數量輸入 */}
      <div className="space-y-2">
        <Label htmlFor="quantity">數量 *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max="999999"
          value={quantity}
          onChange={handleQuantityChange}
          className="text-lg"
          required
        />
      </div>

      {/* 報價計算結果 */}
      {selectedProduct && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {formattedUnitPrice} × {quantity} =
            </span>
            <span className="text-2xl font-bold text-blue-600">{formattedQuoteValue}</span>
          </div>
        </div>
      )}

      {/* 提交按鈕 */}
      <Button
        type="submit"
        disabled={submitting || !selectedProduct}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            建立報價中...
          </>
        ) : (
          '建立報價'
        )}
      </Button>
    </form>
  )
}
