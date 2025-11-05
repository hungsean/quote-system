import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">歡迎回來!</h1>
        <p className="text-muted-foreground mt-2">
          {session?.user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>商品管理</CardTitle>
            <CardDescription>管理您的商品資料</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/products">查看商品</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>建立估價</CardTitle>
            <CardDescription>為客戶建立新的估價單</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/quote">建立估價</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>歷史紀錄</CardTitle>
            <CardDescription>查看過去的估價紀錄</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/history">查看紀錄</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
