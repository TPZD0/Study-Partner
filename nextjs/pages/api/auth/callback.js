export default function handler(req, res) {
  const { token, redirect = '/dashboard', user_id, username, email, first_name, last_name } = req.query;
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  // Determine cookie security flags
  const proto = (req.headers['x-forwarded-proto'] || '').toString();
  const isSecure = proto.includes('https') || process.env.NODE_ENV === 'production';
  const cookie = [
    `sp_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isSecure ? 'Secure' : '',
    // 7 days
    `Max-Age=${7 * 24 * 3600}`,
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookie);

  // Also persist minimal user info in localStorage via an intermediate HTML (client will run this once)
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!doctype html>
  <html><head><meta charset="utf-8"><title>Signing in…</title></head>
  <body><script>
    try {
      ${user_id ? `localStorage.setItem('userId', ${JSON.stringify(user_id)});` : ''}
      ${username ? `localStorage.setItem('username', ${JSON.stringify(username)});` : ''}
      ${email ? `localStorage.setItem('userEmail', ${JSON.stringify(email)});` : ''}
      ${first_name ? `localStorage.setItem('firstName', ${JSON.stringify(first_name)});` : ''}
      ${last_name ? `localStorage.setItem('lastName', ${JSON.stringify(last_name)});` : ''}
    } catch (e) {}
    window.location.replace(${JSON.stringify(redirect)});
  </script></body></html>`);
}

