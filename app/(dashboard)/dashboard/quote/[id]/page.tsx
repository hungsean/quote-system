'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { formatTWD } from '@/lib/currency'
import type { Quote, Product } from '@/lib/types'

interface QuoteWithProduct {
  id: string
  product_id: string
  quantity: number
  quote_value: number
  created_at: string
  product: Product
}

export default function QuoteDetailPage() {
  const params = useParams()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<QuoteWithProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/quotes/${quoteId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('找不到報價')
          } else {
            setError('無法載入報價詳情')
          }
          return
        }

        const data = await response.json()
        setQuote(data)
        setError(null)
      } catch (err) {
        console.error('Fetch quote error:', err)
        setError('載入報價時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    if (quoteId) {
      fetchQuote()
    }
  }, [quoteId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard/history" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回報價歷史
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || '找不到報價'}</p>
          </div>
        </div>
      </div>
    )
  }

  const formattedUnitPrice = formatTWD(Number(quote.product.unit_price))
  const formattedQuoteValue = formatTWD(Number(quote.quote_value))
  const formattedDate = new Date(quote.created_at).toLocaleDateString('zh-TW')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 返回按鈕 */}
        <Link href="/dashboard/history" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回報價歷史
        </Link>

        {/* 報價詳情卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 標題區域 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{quote.product.name}</h1>
            <p className="text-blue-100">報價編號: {quote.id.slice(0, 8)} | 建立於 {formattedDate}</p>
          </div>

          {/* 內容區域 */}
          <div className="p-6 space-y-6">
            {/* 商品分類 */}
            <div className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">分類</label>
              <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-md inline-block">{quote.product.category}</p>
            </div>

            {/* 商品描述 */}
            <div className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">描述</label>
              <p className="text-gray-700 leading-relaxed">{quote.product.description}</p>
            </div>

            {/* 計算區域 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                {/* 單價 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">單價:</span>
                  <span className="text-lg font-semibold text-blue-600">{formattedUnitPrice}</span>
                </div>

                {/* 數量 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">數量:</span>
                  <span className="text-lg font-semibold text-blue-600">{quote.quantity} 件</span>
                </div>

                {/* 分隔線 */}
                <div className="border-t-2 border-blue-200 my-2"></div>

                {/* 總價 */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold text-lg">總額:</span>
                  <span className="text-3xl font-bold text-green-600">{formattedQuoteValue}</span>
                </div>

                {/* 計算式 */}
                <div className="text-center text-xs text-gray-500 mt-3">
                  {formattedUnitPrice} × {quote.quantity} = {formattedQuoteValue}
                </div>
              </div>
            </div>

            {/* 報價編號 */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">報價編號</label>
              <p className="text-gray-500 text-sm font-mono break-all">{quote.id}</p>
            </div>

            {/* 建立時間 */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">建立時間</label>
              <p className="text-gray-600 text-sm">
                {new Date(quote.created_at).toLocaleString('zh-TW')}
              </p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
            <Link href="/dashboard/history" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              返回列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
