export const runtime = 'edge';

export default async function handler() {
  try {
    // Test what env vars are available
    const envKeys = Object.keys(process.env).filter(k => 
      k.includes('GITHUB') || k.includes('JWT') || k.includes('BASE_URL')
    );
    
    return new Response(JSON.stringify({
      message: 'Test endpoint working',
      envKeysFound: envKeys,
      hasGithubClientId: !!process.env.GITHUB_CLIENT_ID,
      nodeEnv: process.env.NODE_ENV,
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Test error: ' + String(error), { status: 500 });
  }
}
