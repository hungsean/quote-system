import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getByUser, create } from '@/lib/queries/quotes'
import { getById as getProductById } from '@/lib/queries/products'
import { z } from 'zod'

const createQuoteSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999999, 'Quantity must not exceed 999999'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotes = await getByUser(session.user.id)
    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('GET /api/quotes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createQuoteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '驗證失敗',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { product_id, quantity } = validation.data

    // Verify product exists and belongs to user
    const product = await getProductById(product_id, session.user.id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }

    // Calculate quote value
    const quoteValue = Number((Number(product.unit_price) * quantity).toFixed(2))

    // Create quote
    const quote = await create({
      userId: session.user.id,
      productId: product_id,
      quantity,
      quoteValue,
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('POST /api/quotes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
