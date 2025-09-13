import { NewRoundForm } from '@/components/rounds/new-round-form'

// Ensure this page is rendered dynamically at request time to avoid static export
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default function NewRoundPage() {
  return (
    <div className="p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">New Round</h1>
          <p className="text-lg text-muted-foreground">Record your latest golf round and track your progress</p>
        </div>

        <NewRoundForm />
      </div>
    </div>
  )
}
