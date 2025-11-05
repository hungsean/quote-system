'use client'

import { useState } from 'react'
import { QuoteForm } from '@/components/quotes/QuoteForm'
import { QuoteResult } from '@/components/quotes/QuoteResult'
import type { Quote, Product } from '@/lib/types'

export default function CreateQuotePage() {
  const [createdQuote, setCreatedQuote] = useState<(Quote & { product: Product }) | null>(null)

  const handleQuoteCreated = async () => {
    // Fetch the latest quote to display the result
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        const quote = data.quotes[0] // Get the most recent quote
        setCreatedQuote(quote)
      }
    } catch (error) {
      console.error('Fetch latest quote error:', error)
    }
  }

  const handleCreateAnother = () => {
    setCreatedQuote(null)
  }

  if (createdQuote) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">報價結果</h1>
        </div>
        <QuoteResult
          quote={createdQuote}
          onCreateAnother={handleCreateAnother}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">建立報價</h1>
        <p className="text-muted-foreground mt-2">
          選擇商品和數量，系統將自動計算報價金額
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <QuoteForm onSuccess={handleQuoteCreated} />
      </div>
    </div>
  )
}
