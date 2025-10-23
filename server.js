const express = require('express');
const path = require('path');
const app = express();

// Static dosyaları serve et
app.use(express.static(__dirname));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Dashboard sayfası
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Site çalışıyor: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});