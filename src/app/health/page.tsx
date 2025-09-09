export default function HealthPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Health Check</h1>
      <div className="space-y-2">
        <p>Status: OK</p>
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>Environment Variables:</p>
        <ul className="ml-4">
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}</li>
          <li>DATABASE_URL: {process.env.DATABASE_URL ? 'SET' : 'MISSING'}</li>
        </ul>
      </div>
    </div>
  )
}