// Backend API örneği (Node.js/Express)
// Bu dosyayı backend sunucunuzda kullanabilirsiniz

const express = require('express');
const axios = require('axios');
const app = express();

// Discord OAuth2 ayarları
const CLIENT_ID = 'YOUR_BOT_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_BOT_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/dashboard.html'; // Sitenizin URL'i

app.use(express.json());
app.use(express.static('public')); // Static dosyalar için

// Discord token exchange endpoint
app.post('/api/discord/token', async (req, res) => {
    const { code } = req.body;
    
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds'
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        res.json(tokenResponse.data);
    } catch (error) {
        console.error('Token exchange error:', error.response?.data);
        res.status(400).json({ error: 'Token exchange failed' });
    }
});

// Bot istatistikleri endpoint
app.get('/api/bot/stats/:guildId', async (req, res) => {
    const { guildId } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
    }
    
    try {
        // Burada bot veritabanınızdan sunucu istatistiklerini alabilirsiniz
        // Örnek veri:
        const stats = {
            memberCount: 123,
            messageCount: 1234,
            activeBans: 5,
            activeMutes: 2,
            recentActivity: [
                {
                    type: 'member_join',
                    user: 'Kullanıcı#1234',
                    timestamp: new Date().toISOString()
                },
                {
                    type: 'ban',
                    user: 'Spam#5678',
                    moderator: 'Admin#1234',
                    reason: 'Spam mesajlar',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
                }
            ]
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Bot ayarları güncelleme endpoint
app.post('/api/bot/settings/:guildId', async (req, res) => {
    const { guildId } = req.params;
    const { prefix, welcomeChannel, logChannel, autoMod } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
    }
    
    try {
        // Burada bot veritabanınızda ayarları güncelleyebilirsiniz
        // Veritabanı güncelleme kodu...
        
        res.json({ success: true, message: 'Ayarlar güncellendi' });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Moderasyon logları endpoint
app.get('/api/bot/logs/:guildId', async (req, res) => {
    const { guildId } = req.params;
    const { type, date } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
    }
    
    try {
        // Burada bot veritabanınızdan logları alabilirsiniz
        // Örnek veri:
        const logs = [
            {
                id: 1,
                type: 'ban',
                user: 'Spam#5678',
                moderator: 'Admin#1234',
                reason: 'Spam mesajlar',
                timestamp: '2025-01-22T14:30:00Z'
            },
            {
                id: 2,
                type: 'mute',
                user: 'Troll#9999',
                moderator: 'Mod#4567',
                duration: '1 saat',
                timestamp: '2025-01-22T13:15:00Z'
            }
        ];
        
        res.json(logs);
    } catch (error) {
        console.error('Logs fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

app.listen(3000, () => {
    console.log('API server running on port 3000');
});

module.exports = app;