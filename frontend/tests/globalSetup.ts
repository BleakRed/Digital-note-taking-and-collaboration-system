import { execSync, spawn } from 'child_process'

export default async () => {
  try {
    execSync('fuser -k 8000/tcp 2>/dev/null; sleep 1')
    console.log('[globalSetup] Starting backend on port 8000...')

    const BE = '/home/bleakred/Documents/github-stuff/projects/notion-clone-project/backend'
    const child = spawn('npm', ['run', 'dev'], { cwd: BE, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } })
    child.stdout?.on('data', d => process.stdout.write(d))
    child.stderr?.on('data', d => process.stderr.write(d))

    // Poll until backend is ready
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'x', password: 'x' }),
        })
        if (res.ok || res.status === 400) {
          console.log('[globalSetup] Backend ready ✓')
          return
        }
      } catch {}
      await new Promise(r => setTimeout(r, 1000))
    }
    console.warn('[globalSetup] Backend may not be ready — continuing anyway')
  } catch (err) {
    console.error('[globalSetup] Warning:', err)
  }
}
