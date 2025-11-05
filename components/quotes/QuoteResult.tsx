'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatTWD } from '@/lib/currency'
import type { Quote, Product } from '@/lib/types'

interface QuoteResultProps {
  quote: Quote & { product: Product }
  onCreateAnother?: () => void
}

export function QuoteResult({ quote, onCreateAnother }: QuoteResultProps) {
  const formattedUnitPrice = formatTWD(Number(quote.product.unit_price))
  const formattedQuoteValue = formatTWD(Number(quote.quote_value))

  return (
    <div className="space-y-6">
      {/* 成功提示 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-700 font-semibold">報價建立成功！</p>
      </div>

      {/* 報價詳情卡片 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* 標題區域 */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h2 className="text-2xl font-bold">報價詳情</h2>
          <p className="text-green-100 text-sm mt-1">報價編號: {quote.id.slice(0, 8)}</p>
        </div>

        {/* 內容區域 */}
        <div className="p-6 space-y-4">
          {/* 商品名稱 */}
          <div className="border-b pb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">商品名稱</label>
            <p className="text-lg font-semibold text-gray-900">{quote.product.name}</p>
          </div>

          {/* 商品分類 */}
          <div className="border-b pb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">分類</label>
            <p className="text-gray-700">{quote.product.category}</p>
          </div>

          {/* 商品描述 */}
          <div className="border-b pb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">描述</label>
            <p className="text-gray-700 leading-relaxed">{quote.product.description}</p>
          </div>

          {/* 計算區域 */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="space-y-3">
              {/* 單價 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">單價:</span>
                <span className="text-lg font-semibold text-blue-600">{formattedUnitPrice}</span>
              </div>

              {/* 數量 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">數量:</span>
                <span className="text-lg font-semibold text-blue-600">{quote.quantity} 件</span>
              </div>

              {/* 分隔線 */}
              <div className="border-t-2 border-blue-200 my-2"></div>

              {/* 總價 */}
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-semibold">總額:</span>
                <span className="text-3xl font-bold text-green-600">{formattedQuoteValue}</span>
              </div>

              {/* 計算式 */}
              <div className="text-center text-xs text-gray-500 mt-3">
                {formattedUnitPrice} × {quote.quantity} = {formattedQuoteValue}
              </div>
            </div>
          </div>

          {/* 建立時間 */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">建立時間</label>
            <p className="text-gray-600 text-sm">
              {new Date(quote.created_at).toLocaleString('zh-TW')}
            </p>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-between border-t">
          <Button asChild variant="outline">
            <Link href="/dashboard/history">查看報價歷史</Link>
          </Button>
          <button
            onClick={onCreateAnother}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            建立新報價
          </button>
        </div>
      </div>
    </div>
  )
}
