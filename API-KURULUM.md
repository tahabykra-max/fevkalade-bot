# Discord Bot Dashboard API Kurulumu

## 🔧 Gereksinimler

- Node.js (v16 veya üzeri)
- Discord Bot Application
- Web hosting (Netlify, Vercel, vs.)

## 📋 Adım Adım Kurulum

### 1. Discord Application Ayarları

1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. Botunuzu seçin veya yeni bir application oluşturun
3. **OAuth2** sekmesine gidin
4. **Redirects** kısmına sitenizin URL'ini ekleyin:
   ```
   https://yoursite.com/dashboard.html
   ```
5. **Client ID** ve **Client Secret**'i kopyalayın

### 2. Frontend Ayarları

`dashboard.js` dosyasında:
```javascript
const CLIENT_ID = 'YOUR_BOT_CLIENT_ID'; // Buraya Client ID'nizi yazın
```

### 3. Backend Kurulumu

#### Option 1: Node.js/Express (Önerilen)

1. Yeni bir klasör oluşturun:
```bash
mkdir bot-dashboard-api
cd bot-dashboard-api
```

2. Package.json oluşturun:
```bash
npm init -y
```

3. Gerekli paketleri yükleyin:
```bash
npm install express axios cors dotenv
```

4. `api-example.js` dosyasını `server.js` olarak kopyalayın

5. `.env` dosyası oluşturun:
```env
CLIENT_ID=your_bot_client_id
CLIENT_SECRET=your_bot_client_secret
REDIRECT_URI=https://yoursite.com/dashboard.html
PORT=3000
```

6. `server.js`'i güncelleyin:
```javascript
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
```

7. Sunucuyu başlatın:
```bash
node server.js
```

#### Option 2: Vercel Serverless Functions

1. `api` klasörü oluşturun
2. `api/discord/token.js` dosyası oluşturun:
```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { code } = req.body;
    // Token exchange kodu buraya...
}
```

#### Option 3: Netlify Functions

1. `netlify/functions` klasörü oluşturun
2. Her endpoint için ayrı dosya oluşturun
3. `netlify.toml` dosyası oluşturun

### 4. CORS Ayarları

Backend'de CORS'u etkinleştirin:
```javascript
const cors = require('cors');
app.use(cors({
    origin: 'https://yoursite.com',
    credentials: true
}));
```

### 5. Güvenlik Ayarları

- **HTTPS** kullanın (Let's Encrypt ücretsiz)
- **Environment variables** kullanın
- **Rate limiting** ekleyin
- **Input validation** yapın

## 🔗 API Endpoints

### POST /api/discord/token
Discord OAuth2 code'unu access token'a çevirir.

### GET /api/bot/stats/:guildId
Sunucu istatistiklerini getirir.

### POST /api/bot/settings/:guildId
Bot ayarlarını günceller.

### GET /api/bot/logs/:guildId
Moderasyon loglarını getirir.

## 🚀 Production Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Railway/Heroku
1. GitHub'a push edin
2. Platform'da repository'yi bağlayın
3. Environment variables'ları ayarlayın

## 🔒 Güvenlik Notları

- Client Secret'i asla frontend'de kullanmayın
- Access token'ları güvenli saklayın
- Rate limiting uygulayın
- Input validation yapın
- HTTPS kullanın

## 🐛 Sorun Giderme

### CORS Hatası
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'https://yoursite.com'],
    credentials: true
}));
```

### Token Expired
```javascript
// Refresh token kullanarak yenileyin
async function refreshAccessToken(refreshToken) {
    // Refresh token kodu...
}
```

### 404 API Hatası
- Backend sunucusunun çalıştığından emin olun
- URL'lerin doğru olduğunu kontrol edin
- Network sekmesinde hataları inceleyin

## 📞 Destek

Sorun yaşarsanız:
1. Console'da hata mesajlarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Discord Developer Portal'da ayarları kontrol edin