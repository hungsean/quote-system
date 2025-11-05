import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getByUser, create } from '@/lib/queries/products'
import { createProductSchema } from '@/lib/validations/product'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await getByUser(session.user.id)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET /api/products error:', error)
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
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: '驗證失敗',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { name, description, category, unit_price } = validation.data

    const product = await create({
      userId: session.user.id,
      name,
      description,
      category,
      unitPrice: unit_price,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
