# 🏠 Local Development Kurulumu

## 📋 Hızlı Başlangıç

### 1. Node.js Kurulumu
[Node.js](https://nodejs.org/) indirin ve kurun (v16+)

### 2. Proje Kurulumu
```bash
# Proje klasörüne gidin
cd "fevkalade site"

# Bağımlılıkları yükleyin
npm install

# Siteyi başlatın
npm start
```

Site şu adreste çalışacak: **http://localhost:3000**

## 🔧 Discord Bot Ayarları

### Discord Developer Portal
1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. Botunuzu seçin
3. **OAuth2 > General** sekmesine gidin
4. **Redirects** kısmına ekleyin:
   ```
   http://localhost:3000/dashboard.html
   ```
5. **Client ID**'yi kopyalayın

### dashboard.js Güncelleme
`dashboard.js` dosyasında:
```javascript
const CLIENT_ID = 'BURAYA_CLIENT_ID_YAZIN';
```

## 🚀 Test Etme

1. Siteyi başlatın: `npm start`
2. **http://localhost:3000** adresine gidin
3. **Dashboard** butonuna tıklayın
4. **Discord ile Devam Et** butonunu test edin

## 📁 Dosya Yapısı
```
fevkalade site/
├── index.html          # Ana sayfa
├── dashboard.html       # Dashboard sayfası
├── style.css           # Tüm stiller
├── script.js           # Ana sayfa JS
├── dashboard.js        # Dashboard JS
├── server.js           # Local server
├── package.json        # Node.js ayarları
└── images/             # Resimler
    ├── logo.png
    └── favicon.png
```

## 🔄 Değişiklik Yapma

1. HTML/CSS/JS dosyalarını düzenleyin
2. Tarayıcıyı yenileyin (F5)
3. Değişiklikler anında görünür

## 🌐 Production'a Geçiş

Domain aldığınızda:

1. **dashboard.js**'te URL'leri güncelleyin:
```javascript
const REDIRECT_URI = 'https://yoursite.com/dashboard.html';
const API_BASE_URL = 'https://api.yoursite.com';
```

2. **Discord Developer Portal**'da redirect URI'yi güncelleyin

3. Hosting platformuna deploy edin (Netlify, Vercel, vs.)

## 🐛 Sorun Giderme

### Port 3000 kullanımda hatası
```bash
# Farklı port kullanın
PORT=3001 npm start
```

### Node.js bulunamadı
- Node.js'in kurulu olduğundan emin olun
- Terminal'i yeniden başlatın

### npm install hatası
```bash
# Cache temizleyin
npm cache clean --force
npm install
```

## 📞 Yardım

Sorun yaşarsanız:
1. Terminal'deki hata mesajlarını kontrol edin
2. Tarayıcı console'unu açın (F12)
3. Port'un boş olduğundan emin olun