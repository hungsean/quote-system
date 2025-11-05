import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/components/products/ProductList'
import { getByUser } from '@/lib/queries/products'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProductsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const products = await getByUser(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品管理</h1>
          <p className="text-muted-foreground mt-2">
            管理您的商品資料
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/add">新增商品</Link>
        </Button>
      </div>

      <ProductList products={products} />
    </div>
  )
}
