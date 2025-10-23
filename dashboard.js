// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Discord OAuth2 configuration
    const CLIENT_ID = '1408189180982591618';
    const REDIRECT_URI = encodeURIComponent('https://fevkalade.netlify.app/dashboard.html');
    const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20guilds`;

    // Discord login
    const loginBtn = document.querySelector('.btn-discord-login');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = DISCORD_OAUTH_URL;
        });
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        exchangeCodeForToken(code);
    }

    // Check if user is already logged in
    checkExistingSession();

    // Settings functionality
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }

    // Toggle switches
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(switchEl => {
        switchEl.addEventListener('change', () => {
            const settingName = switchEl.closest('.setting-item').querySelector('h4').textContent;
            const status = switchEl.checked ? 'açıldı' : 'kapatıldı';
            console.log(`${settingName} ${status}`);
        });
    });

    loadSettings();
});

async function exchangeCodeForToken(code) {
    try {
        const response = await fetch('/.netlify/functions/discord-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('discord_access_token', data.access_token);
            await loadUserData(data.access_token);
        } else {
            console.error('Token exchange failed');
            showError('Discord girişi başarısız. Lütfen tekrar deneyin.');
        }
    } catch (error) {
        console.error('OAuth error:', error);
        showError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
    
    window.history.replaceState({}, document.title, '/dashboard.html');
}

async function loadUserData(accessToken) {
    try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const userData = await userResponse.json();
        
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const guildsData = await guildsResponse.json();
        
        // Save session data
        saveSession(userData, guildsData);
        
        updateUIWithUserData(userData, guildsData);
        
    } catch (error) {
        console.error('Failed to load user data:', error);
        alert('Kullanıcı verileri yüklenemedi! Lütfen tekrar giriş yapın.');
        localStorage.removeItem('discord_access_token');
        window.location.reload();
    }
}

function updateUIWithUserData(userData, guildsData) {
    const authSection = document.querySelector('.auth-section');
    const dashboardContent = document.querySelector('.dashboard-content');
    
    authSection.style.display = 'none';
    dashboardContent.style.display = 'grid';
    
    document.getElementById('userName').textContent = userData.username;
    document.getElementById('userTag').textContent = `#${userData.discriminator}`;
    document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
    
    updateServerList(guildsData);
}

async function updateServerList(guilds) {
    const serverList = document.querySelector('.server-list');
    serverList.innerHTML = '';
    
    // Bot istatistiklerini güncelle
    const isBotOnline = await updateBotStatsDisplay();
    
    // Sadece yönetici olan sunucuları filtrele
    const adminGuilds = guilds.filter(guild => 
        (guild.permissions & 0x8) === 0x8 || guild.owner
    );
    
    if (!isBotOnline) {
        // Bot çevrimdışı ise hiçbir sunucu gösterme
        serverList.innerHTML = `
            <div class="no-servers">
                <i class="fas fa-robot"></i>
                <p>Bot şu anda çevrimdışı</p>
                <small>Bot aktif olduğunda sunucularınız burada görünecek</small>
            </div>
        `;
        return;
    }
    
    // Bot çevrimici ise, bot'un olduğu sunucuları kontrol et
    const botGuilds = [];
    
    for (const guild of adminGuilds) {
        const botInGuild = await checkBotInGuild(guild.id);
        if (botInGuild) {
            botGuilds.push(guild);
        }
    }
    
    if (botGuilds.length === 0) {
        serverList.innerHTML = `
            <div class="no-servers">
                <i class="fas fa-robot"></i>
                <p>Bot'un bulunduğu sunucu yok</p>
                <small>Bot'u sunucunuza eklemek için davet linkini kullanın</small>
            </div>
        `;
        return;
    }
    
    // Bot'un olduğu sunucuları listele
    for (const guild of botGuilds) {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';
        serverItem.setAttribute('data-server', guild.id);
        
        const iconUrl = guild.icon 
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        
        const memberCount = guild.approximate_member_count || guild.member_count || 0;
        
        serverItem.innerHTML = `
            <div class="server-icon">
                <img src="${iconUrl}" alt="${guild.name}" style="width: 100%; height: 100%; border-radius: 10px;">
            </div>
            <div class="server-info">
                <h4>${guild.name}</h4>
                <p>${memberCount.toLocaleString()} üye</p>
                <small>Bot: Aktif</small>
            </div>
            <div class="server-status online">
                <i class="fas fa-circle"></i>
            </div>
        `;
        
        serverItem.addEventListener('click', () => {
            document.querySelectorAll('.server-item').forEach(s => s.classList.remove('selected'));
            serverItem.classList.add('selected');
            updateDashboardForServer(guild.id, true);
        });
        
        serverList.appendChild(serverItem);
    }
    
    // İlk sunucuyu otomatik seç
    if (botGuilds.length > 0) {
        const firstServer = serverList.querySelector('.server-item');
        if (firstServer) {
            firstServer.click();
        }
    }
}

function showDashboard(userData) {
    const authSection = document.querySelector('.auth-section');
    const dashboardContent = document.querySelector('.dashboard-content');
    
    authSection.style.display = 'none';
    dashboardContent.style.display = 'grid';
    
    document.getElementById('userName').textContent = userData.username;
    document.getElementById('userTag').textContent = `#${userData.discriminator}`;
    
    if (userData.avatar) {
        document.getElementById('userAvatar').src = userData.avatar;
    }

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

async function updateDashboardForServer(serverId, botActive = false) {
    console.log('Sunucu seçildi:', serverId, 'Bot aktif:', botActive);
    
    // Sunucu bilgilerini güncelle
    await updateServerStats(serverId, botActive);
    
    // Ayarları yükle
    loadServerSettings(serverId);
    
    // Logları yükle
    if (botActive) {
        await loadServerLogs(serverId);
    } else {
        showNoLogsMessage();
    }
}

function saveSettings() {
    const selectedServer = document.querySelector('.server-item.selected')?.getAttribute('data-server') || 'default';
    
    const botPrefix = document.querySelector('input[placeholder="Bot prefix\'ini girin"]')?.value;
    
    const settings = {
        botPrefix,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`settings_${selectedServer}`, JSON.stringify(settings));
    showNotification('Ayarlar başarıyla kaydedildi!', 'success');
}

function loadSettings() {
    const selectedServer = document.querySelector('.server-item.selected')?.getAttribute('data-server') || 'default';
    loadServerSettings(selectedServer);
}

function loadServerSettings(serverId) {
    const savedSettings = localStorage.getItem(`settings_${serverId}`);
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        const prefixInput = document.querySelector('input[placeholder="Bot prefix\'ini girin"]');
        if (prefixInput && settings.botPrefix) {
            prefixInput.value = settings.botPrefix;
        }
    }
}

function resetSettings() {
    const selectedServer = document.querySelector('.server-item.selected')?.getAttribute('data-server') || 'default';
    
    localStorage.removeItem(`settings_${selectedServer}`);
    
    const inputs = document.querySelectorAll('#settings input');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    const prefixInput = document.querySelector('input[placeholder="Bot prefix\'ini girin"]');
    if (prefixInput) prefixInput.value = '!';
    
    showNotification('Ayarlar sıfırlandı!', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Bot API Functions
const BOT_API_BASE = 'https://api.fevkalade.com'; // Bot API base URL (developer tarafından sağlanacak)

async function checkBotStatus() {
    try {
        const response = await fetch(`${BOT_API_BASE}/bot/status`);
        if (response.ok) {
            const data = await response.json();
            return data.online || false;
        }
    } catch (error) {
        console.log('Bot API bağlantı hatası:', error);
    }
    return false; // API ulaşılamazsa çevrimdışı kabul et
}

async function getBotStats() {
    try {
        const response = await fetch(`${BOT_API_BASE}/bot/stats`);
        if (response.ok) {
            const data = await response.json();
            return {
                servers: data.servers || 0,
                users: data.users || 0,
                uptime: data.uptime || '0s'
            };
        }
    } catch (error) {
        console.log('Bot stats API hatası:', error);
    }
    return { servers: 0, users: 0, uptime: '0s' };
}

async function checkBotInGuild(guildId) {
    try {
        const response = await fetch(`${BOT_API_BASE}/bot/guild/${guildId}`);
        if (response.ok) {
            const data = await response.json();
            return data.exists && data.active;
        }
    } catch (error) {
        console.log('Guild check API hatası:', error);
    }
    return false;
}

async function getBotLogs(guildId) {
    try {
        const response = await fetch(`${BOT_API_BASE}/bot/logs/${guildId}`);
        if (response.ok) {
            const data = await response.json();
            return data.logs || [];
        }
    } catch (error) {
        console.log('Bot logs API hatası:', error);
    }
    return [];
}

async function updateBotStatsDisplay() {
    const totalServers = document.getElementById('totalServers');
    const totalUsers = document.getElementById('totalUsers');
    const botStatus = document.getElementById('botStatus');
    const uptime = document.getElementById('uptime');
    
    // Bot durumunu kontrol et
    const isOnline = await checkBotStatus();
    
    if (isOnline) {
        // Bot çevrimici - gerçek istatistikleri al
        const stats = await getBotStats();
        
        if (totalServers) totalServers.textContent = stats.servers;
        if (totalUsers) totalUsers.textContent = stats.users.toLocaleString();
        if (botStatus) {
            botStatus.textContent = 'Çevrimici';
            botStatus.style.color = '#00ff88';
        }
        if (uptime) uptime.textContent = stats.uptime;
    } else {
        // Bot çevrimdışı - sıfır değerler
        if (totalServers) totalServers.textContent = '0';
        if (totalUsers) totalUsers.textContent = '0';
        if (botStatus) {
            botStatus.textContent = 'Çevrimdışı';
            botStatus.style.color = '#ff4757';
        }
        if (uptime) uptime.textContent = '0s';
    }
    
    return isOnline;
}

async function updateServerStats(serverId, botActive) {
    const statCards = document.querySelectorAll('.stat-info h3');
    
    if (botActive) {
        // Gerçek istatistikleri al (bot API'sinden)
        // Şimdilik örnek veriler
        if (statCards[0]) statCards[0].textContent = '1,250';
        if (statCards[1]) statCards[1].textContent = '45';
        if (statCards[2]) statCards[2].textContent = '3';
        if (statCards[3]) statCards[3].textContent = '1';
    } else {
        // Bot aktif değilse sıfır göster
        if (statCards[0]) statCards[0].textContent = '---';
        if (statCards[1]) statCards[1].textContent = '0';
        if (statCards[2]) statCards[2].textContent = '0';
        if (statCards[3]) statCards[3].textContent = '0';
    }
}

async function loadServerLogs(serverId) {
    const logList = document.querySelector('.log-list');
    
    try {
        // Bot API'sinden gerçek logları al
        const logs = await getBotLogs(serverId);
        
        if (logs.length === 0) {
            logList.innerHTML = `
                <div class="no-logs">
                    <i class="fas fa-info-circle"></i>
                    <p>Bu sunucu için henüz log kaydı bulunmuyor</p>
                </div>
            `;
            return;
        }
        
        logList.innerHTML = '';
        
        logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            
            const iconClass = getLogIconClass(log.type);
            const logTime = new Date(log.timestamp).toLocaleString('tr-TR');
            
            logItem.innerHTML = `
                <div class="log-icon ${log.type}">
                    <i class="fas fa-${iconClass}"></i>
                </div>
                <div class="log-info">
                    <h4>${getLogTitle(log.type)}</h4>
                    <p><strong>Kullanıcı:</strong> ${log.user}</p>
                    <p><strong>Moderatör:</strong> ${log.moderator}</p>
                    ${log.reason ? `<p><strong>Sebep:</strong> ${log.reason}</p>` : ''}
                    ${log.duration ? `<p><strong>Süre:</strong> ${log.duration}</p>` : ''}
                    <span class="log-time">${logTime}</span>
                </div>
            `;
            
            logList.appendChild(logItem);
        });
        
    } catch (error) {
        console.log('Log yükleme hatası:', error);
        showNoLogsMessage();
    }
}

function getLogIconClass(type) {
    const icons = {
        'ban': 'ban',
        'kick': 'user-times',
        'mute': 'volume-mute',
        'warn': 'exclamation-triangle',
        'unban': 'user-check',
        'unmute': 'volume-up'
    };
    return icons[type] || 'info-circle';
}

function getLogTitle(type) {
    const titles = {
        'ban': 'Kullanıcı Yasaklandı',
        'kick': 'Kullanıcı Atıldı',
        'mute': 'Kullanıcı Susturuldu',
        'warn': 'Kullanıcı Uyarıldı',
        'unban': 'Yasak Kaldırıldı',
        'unmute': 'Susturma Kaldırıldı'
    };
    return titles[type] || 'Bilinmeyen İşlem';
}

function showNoLogsMessage() {
    const logList = document.querySelector('.log-list');
    logList.innerHTML = `
        <div class="no-logs">
            <i class="fas fa-robot"></i>
            <h4>Bot Aktif Değil</h4>
            <p>Bu sunucuda bot aktif olmadığı için log verileri bulunmuyor.</p>
            <small>Bot'u sunucunuza eklemek için davet linkini kullanın.</small>
        </div>
    `;
}

function showError(message) {
    const authSection = document.querySelector('.auth-section');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button onclick="window.location.reload()">Tekrar Dene</button>
    `;
    authSection.appendChild(errorDiv);
}

// Session management functions
function checkExistingSession() {
    const userData = localStorage.getItem('discord_user_data');
    const guildsData = localStorage.getItem('discord_guilds_data');
    const accessToken = localStorage.getItem('discord_access_token');
    const sessionExpiry = localStorage.getItem('session_expiry');
    
    if (userData && guildsData && accessToken && sessionExpiry) {
        const now = new Date().getTime();
        const expiry = parseInt(sessionExpiry);
        
        // Check if session is still valid (7 days)
        if (now < expiry) {
            const user = JSON.parse(userData);
            const guilds = JSON.parse(guildsData);
            updateUIWithUserData(user, guilds);
            return true;
        } else {
            // Session expired, clear all data
            clearSession();
        }
    }
    return false;
}

function saveSession(userData, guildsData) {
    const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7 days
    localStorage.setItem('discord_user_data', JSON.stringify(userData));
    localStorage.setItem('discord_guilds_data', JSON.stringify(guildsData));
    localStorage.setItem('session_expiry', expiryTime.toString());
}

function clearSession() {
    localStorage.removeItem('discord_user_data');
    localStorage.removeItem('discord_guilds_data');
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('session_expiry');
    localStorage.removeItem('dashboard_user_data');
}

function logout() {
    clearSession();
    window.location.reload();
}