import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/password'
import { create, getByEmail } from '@/lib/queries/users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: '驗證失敗',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Check if email already exists
    const existingUser = await getByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件已被註冊' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await create(email, passwordHash)

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        message: '註冊成功,請登入'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '註冊失敗,請稍後再試' },
      { status: 500 }
    )
  }
}
