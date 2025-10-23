export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, redirect_uri } = req.body;
  
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '1408189180982591618',
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri || 'https://fevkalade-bot.vercel.app/dashboard.html'
      })
    });

    const tokenData = await response.json();
    
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }
    
    // Get user data
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    return res.status(200).json({ user: userData, token: tokenData });
  } catch (error) {
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}