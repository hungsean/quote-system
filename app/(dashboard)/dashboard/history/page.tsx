import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuoteList } from '@/components/quotes/QuoteList'
import { getByUser } from '@/lib/queries/quotes'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function QuoteHistoryPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const quotes = await getByUser(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">報價歷史</h1>
          <p className="text-muted-foreground mt-2">
            查看所有的報價記錄
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quote">新增報價</Link>
        </Button>
      </div>

      <QuoteList quotes={quotes} />
    </div>
  )
}
