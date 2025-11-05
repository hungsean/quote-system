'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  category: string
  unit_price: number
  created_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('找不到商品')
          } else {
            setError('無法載入商品詳情')
          }
          return
        }

        const data = await response.json()
        setProduct(data)
        setError(null)
      } catch (err) {
        console.error('Fetch product error:', err)
        setError('載入商品時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個商品嗎？')) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        setError('無法刪除商品')
        return
      }

      router.push('/dashboard/products')
    } catch (err) {
      console.error('Delete product error:', err)
      setError('刪除商品時發生錯誤')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回商品列表
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || '找不到商品'}</p>
          </div>
        </div>
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(product.unit_price)

  const formattedDate = new Date(product.created_at).toLocaleDateString('zh-TW')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回按鈕 */}
        <Link href="/dashboard/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回商品列表
        </Link>

        {/* 商品詳情卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 標題區域 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-blue-100">創建於 {formattedDate}</p>
          </div>

          {/* 內容區域 */}
          <div className="p-6 space-y-6">
            {/* 單價 */}
            <div className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">單價</label>
              <p className="text-2xl font-bold text-blue-600">{formattedPrice}</p>
            </div>

            {/* 分類 */}
            <div className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">分類</label>
              <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-md inline-block">{product.category}</p>
            </div>

            {/* 描述 */}
            <div className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">描述</label>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* 商品 ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">商品 ID</label>
              <p className="text-gray-500 text-sm font-mono break-all">{product.id}</p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
            <Link href="/dashboard/products" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              關閉
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  刪除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  刪除商品
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
