import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DebugPage() {
  const session = await getServerSession(authOptions);

  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
    NODE_ENV: process.env.NODE_ENV || "not set",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ set" : "❌ not set",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ set" : "❌ not set",
    INTERNAL_BACKEND_URL: process.env.INTERNAL_BACKEND_URL || "not set",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">NextAuth Debug Page</h1>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Environment Variables</h2>
          <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Session Status</h2>
          <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
            {session ? JSON.stringify(session, null, 2) : "❌ No active session"}
          </pre>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">OAuth URLs</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Expected Callback URL:</strong>
              <code className="block bg-muted p-2 rounded mt-1">
                {envVars.NEXTAUTH_URL}/api/auth/callback/google
              </code>
            </div>
            <div className="mt-4">
              <strong>Required in Google Console:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Go to: <a href="https://console.cloud.google.com/apis/credentials" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Add this exact URI to "Authorized redirect URIs"</li>
                <li>Remove any old URIs with different ALB DNS</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Test Login</h2>
          <a 
            href="/api/auth/signin/google"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Test Google Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
