// Database entity types matching data-model.md

export interface User {
  id: string
  email: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: string
  user_id: string
  name: string
  description: string
  category: string
  unit_price: number
  created_at: Date
  updated_at: Date
}

export interface Quote {
  id: string
  product_id: string
  user_id: string
  quantity: number
  quote_value: number
  created_at: Date
}

export interface QuoteWithProduct extends Quote {
  product: Product
}

// Type for user without password hash (for API responses)
export type SafeUser = Omit<User, 'password_hash'>
