export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-green">
      <h1>Privacy Policy</h1>
      <p>Last updated: September 5, 2025</p>

      <p>
        GreensWeveSeen ("we", "us", or "our") operates a personal golf score tracking
        application. This Privacy Policy explains how we collect, use, and protect your
        information when you use our website and services.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Account information: email address and basic profile data from your sign-in provider.</li>
        <li>Usage data: rounds, courses, and related statistics you enter into the app.</li>
        <li>Technical data: device, browser, and log information to improve reliability.</li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>Provide, maintain, and improve the app experience.</li>
        <li>Authenticate users and protect against abuse and fraud.</li>
        <li>Analyze aggregated, anonymized usage to improve performance and features.</li>
      </ul>

      <h2>Data Storage and Security</h2>
      <p>
        We store data using Supabase (Postgres + Auth). We apply Row Level Security (RLS) so that
        only you can access your own data. We do not sell your personal information.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        We may use third-party services such as Supabase and hosting providers to power the app.
        These services process data on our behalf in accordance with their own privacy policies.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access, correction, export, or deletion of your account data by contacting us.
        Deleting your account removes your profile and associated rounds from our database.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy-related requests or questions, please contact: support@greensweveseen.com
      </p>
    </main>
  )
}
