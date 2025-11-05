'use client'

import Link from 'next/link'
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

interface QuoteListProps {
  quotes: Array<{
    id: string
    product_id: string
    quantity: number
    quote_value: number | string
    created_at: Date | string
    user_id: string
    product: Product
  }>
}

export function QuoteList({ quotes }: QuoteListProps) {
  if (quotes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 mb-4">還沒有建立任何報價</p>
        <Link href="/dashboard/quote" className="text-blue-600 hover:text-blue-700 font-semibold">
          建立第一個報價
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">商品名稱</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">分類</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">單價</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">數量</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">報價金額</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">建立日期</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote, index) => (
              <tr
                key={quote.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{quote.product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{quote.product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatTWD(Number(quote.product.unit_price))}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{quote.quantity}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-bold text-right">{formatTWD(Number(quote.quote_value))}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(quote.created_at).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/dashboard/quote/${quote.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    查看
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
