// Simple test page to bypass all middleware and authentication
export const runtime = 'edge'

export default function TestPage() {
  const envStatus = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING', 
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING'
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Page</h1>
      <p>Timestamp: {new Date().toISOString()}</p>
      <h2>Environment Variables:</h2>
      <pre>{JSON.stringify(envStatus, null, 2)}</pre>
      <p>If you can see this page, the basic deployment is working.</p>
    </div>
  )
}