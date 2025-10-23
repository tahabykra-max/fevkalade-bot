// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Admin credentials (in production, use secure backend)
const ADMIN_CREDENTIALS = {
    'admin': { password: 'admlan23', role: 'owner', name: 'Admin' },
    'developer': { password: 'dev123', role: 'developer', name: 'Developer' },
    'support': { password: 'support123', role: 'support', name: 'Support' }
};

const AUTHORIZED_DISCORD_IDS = [
    '1402560255786876951', // Owner Discord ID
    '1107424511294451853' // Developer Discord ID
];

function initializeAdmin() {
    // Check for Discord OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
        const savedState = localStorage.getItem('discord_oauth_state');
        if (state === savedState) {
            handleDiscordCallback(code);
            return;
        }
    }
    
    // Check if already logged in
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
        const session = JSON.parse(adminSession);
        if (session.expiry > Date.now()) {
            showAdminPanel(session.admin);
            return;
        } else {
            localStorage.removeItem('admin_session');
        }
    }
    
    // Setup login tabs
    setupLoginTabs();
    
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardStats();
    loadAnnouncements();
    loadAdminsList();
    loadActivityLogs();
    loadCommands();
    loadContentData();
    loadContentItems();
}

function setupLoginTabs() {
    const tabBtns = document.querySelectorAll('.login-tabs .tab-btn');
    const passwordLogin = document.getElementById('passwordLogin');
    const discordLogin = document.getElementById('discordLogin');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.tab === 'password') {
                passwordLogin.style.display = 'block';
                discordLogin.style.display = 'none';
            } else {
                passwordLogin.style.display = 'none';
                discordLogin.style.display = 'block';
            }
        });
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Setup content tabs
    setupContentTabs();
}

function setupContentTabs() {
    const contentTabs = document.querySelectorAll('.content-tabs .tab-btn');
    const logsTabs = document.querySelectorAll('.logs-tabs .tab-btn');
    
    contentTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            contentTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Handle content tab switching
        });
    });
    
    logsTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            logsTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const activityLogs = document.getElementById('activityLogs');
            const statsContent = document.getElementById('statsContent');
            
            if (btn.dataset.tab === 'activity') {
                activityLogs.style.display = 'block';
                statsContent.style.display = 'none';
            } else {
                activityLogs.style.display = 'none';
                statsContent.style.display = 'block';
            }
        });
    });
}

function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

// Login Functions
function loginWithPassword() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Kullanıcı adı ve şifre gerekli!', 'error');
        return;
    }
    
    const admin = ADMIN_CREDENTIALS[username];
    if (admin && admin.password === password) {
        const adminData = {
            username: username,
            name: admin.name,
            role: admin.role,
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
        };
        
        createAdminSession(adminData);
        showAdminPanel(adminData);
        logActivity('Admin Login', `${admin.name} logged in via password`);
    } else {
        showNotification('Geçersiz kullanıcı adı veya şifre!', 'error');
    }
}

function loginWithDiscord() {
    const clientId = '1408189180982591618';
    const redirectUri = encodeURIComponent('https://fevkalade.netlify.app/admin.html');
    const scope = 'identify';
    const state = 'admin_login_' + Math.random().toString(36).substring(7);
    
    localStorage.setItem('discord_oauth_state', state);
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    window.location.href = discordAuthUrl;
}

async function handleDiscordCallback(code) {
    try {
        showNotification('Discord ile giriş yapılıyor...', 'info');
        
        // Clear URL immediately to prevent code reuse
        window.history.replaceState({}, document.title, '/admin.html');
        
        // Exchange code for token
        const response = await fetch('/.netlify/functions/discord-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: 'https://fevkalade.netlify.app/admin.html'
            })
        });
        
        const data = await response.json();
        console.log('Discord auth response:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Check if user is authorized
        if (AUTHORIZED_DISCORD_IDS.includes(data.user.id)) {
            const adminData = {
                username: data.user.username,
                name: data.user.global_name || data.user.username,
                role: data.user.id === '1402560255786876951' ? 'owner' : 'developer',
                avatar: data.user.avatar ? 
                    `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png` : 
                    'https://cdn.discordapp.com/embed/avatars/0.png',
                discordId: data.user.id
            };
            
            createAdminSession(adminData);
            showAdminPanel(adminData);
            logActivity('Admin Login', `${adminData.name} logged in via Discord`);
            
            localStorage.removeItem('discord_oauth_state');
        } else {
            throw new Error('Yetkisiz Discord hesabı!');
        }
    } catch (error) {
        console.error('Discord OAuth error:', error);
        showNotification('Discord girişi başarısız: ' + error.message, 'error');
        localStorage.removeItem('discord_oauth_state');
    }
}

function createAdminSession(adminData) {
    const session = {
        admin: adminData,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
}

function showAdminPanel(adminData) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    
    // Update admin info
    document.getElementById('adminName').textContent = adminData.name;
    document.getElementById('adminRole').textContent = adminData.role.toUpperCase();
    document.getElementById('adminAvatar').src = adminData.avatar;
}

function logout() {
    localStorage.removeItem('admin_session');
    window.location.reload();
}

// Dashboard Functions
function loadDashboardStats() {
    // Simulate loading stats (in production, fetch from API)
    setTimeout(() => {
        document.getElementById('totalUsers').textContent = '1,250';
        document.getElementById('totalServers').textContent = '45';
        document.getElementById('siteViews').textContent = '12,340';
        document.getElementById('uptime').textContent = '99.9%';
    }, 1000);
}

// Announcement Functions
function addAnnouncement() {
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const type = document.getElementById('announcementType').value;
    
    if (!title || !content) {
        showNotification('Başlık ve içerik gerekli!', 'error');
        return;
    }
    
    const announcement = {
        id: Date.now(),
        title: title,
        content: content,
        type: type,
        date: new Date().toLocaleDateString('tr-TR'),
        author: getCurrentAdmin().name
    };
    
    // Save to localStorage (in production, save to database)
    const announcements = getAnnouncements();
    announcements.unshift(announcement);
    localStorage.setItem('site_announcements', JSON.stringify(announcements));
    
    // Clear form
    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementContent').value = '';
    
    // Reload announcements
    loadAnnouncements();
    
    // Trigger homepage update
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'site_announcements',
        newValue: JSON.stringify(announcements)
    }));
    
    logActivity('Announcement Added', `New announcement: ${title}`);
    showNotification('Duyuru başarıyla eklendi!', 'success');
}

function loadAnnouncements() {
    const announcements = getAnnouncements();
    const container = document.getElementById('announcementsList');
    
    if (announcements.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Henüz duyuru bulunmuyor</p>';
        return;
    }
    
    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h3 style="color: #e2e8f0; margin: 0;">${announcement.title}</h3>
                <button onclick="deleteAnnouncement(${announcement.id})" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; color: #f87171; padding: 5px 10px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p style="color: #cbd5e1; margin-bottom: 10px;">${announcement.content}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #94a3b8;">
                <span>Yazar: ${announcement.author}</span>
                <span>${announcement.date}</span>
            </div>
        </div>
    `).join('');
}

function deleteAnnouncement(id) {
    const announcements = getAnnouncements().filter(a => a.id !== id);
    localStorage.setItem('site_announcements', JSON.stringify(announcements));
    loadAnnouncements();
    
    // Trigger homepage update
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'site_announcements',
        newValue: JSON.stringify(announcements)
    }));
    
    logActivity('Announcement Deleted', `Announcement ID: ${id} deleted`);
    showNotification('Duyuru silindi!', 'success');
}

function getAnnouncements() {
    return JSON.parse(localStorage.getItem('site_announcements') || '[]');
}

// Bot Control Functions
function restartBot() {
    if (confirm('Bot\'u yeniden başlatmak istediğinizden emin misiniz?')) {
        showNotification('Bot yeniden başlatılıyor...', 'info');
        // Bot API call will be here
        setTimeout(() => {
            document.getElementById('botStatus').innerHTML = '<span class="status-dot"></span><span>Çevrimiçi</span>';
            showNotification('Bot başarıyla yeniden başlatıldı!', 'success');
            logActivity('Bot Restart', 'Bot yeniden başlatıldı');
        }, 3000);
    }
}

function shutdownBot() {
    if (confirm('Bot\'u kapatmak istediğinizden emin misiniz?')) {
        showNotification('Bot kapatılıyor...', 'warning');
        // Bot API call will be here
        setTimeout(() => {
            document.getElementById('botStatus').innerHTML = '<span class="status-dot offline"></span><span>Çevrimdışı</span>';
            showNotification('Bot kapatıldı', 'error');
            logActivity('Bot Shutdown', 'Bot kapatıldı');
        }, 2000);
    }
}

function loadCommands() {
    const commands = [
        { name: 'help', description: 'Yardım menüsünü gösterir', enabled: true },
        { name: 'kick', description: 'Kullanıcıyı sunucudan atar', enabled: true },
        { name: 'ban', description: 'Kullanıcıyı sunucudan yasaklar', enabled: true },
        { name: 'mute', description: 'Kullanıcıyı susturur', enabled: false },
        { name: 'warn', description: 'Kullanıcıyı uyarır', enabled: true },
        { name: 'clear', description: 'Mesajları siler', enabled: true }
    ];
    
    const grid = document.getElementById('commandsGrid');
    if (!grid) return;
    
    grid.innerHTML = commands.map(cmd => `
        <div class="command-card">
            <div class="command-info">
                <h4>!${cmd.name}</h4>
                <p>${cmd.description}</p>
            </div>
            <div class="toggle-switch">
                <input type="checkbox" id="cmd-${cmd.name}" ${cmd.enabled ? 'checked' : ''} onchange="toggleCommand('${cmd.name}')">
                <label for="cmd-${cmd.name}" class="toggle-label"></label>
            </div>
        </div>
    `).join('');
}

function toggleCommand(commandName) {
    const checkbox = document.getElementById(`cmd-${commandName}`);
    const status = checkbox.checked ? 'aktif' : 'pasif';
    showNotification(`${commandName} komutu ${status} edildi`, 'info');
    logActivity('Command Toggle', `${commandName} komutu ${status} edildi`);
}

// Console Functions
function handleConsoleEnter(event) {
    if (event.key === 'Enter') {
        executeConsoleCommand();
    }
}

function executeConsoleCommand() {
    const input = document.getElementById('consoleCommand');
    const command = input.value.trim();
    
    if (!command) return;
    
    const output = document.getElementById('consoleOutput');
    
    // Add command to output
    const commandLine = document.createElement('div');
    commandLine.className = 'console-line';
    commandLine.style.color = '#60a5fa';
    commandLine.textContent = `> ${command}`;
    output.appendChild(commandLine);
    
    // Execute real JavaScript
    try {
        let result;
        
        // Special commands
        if (command.toLowerCase() === 'clear') {
            output.innerHTML = '';
            input.value = '';
            return;
        }
        
        // Execute JavaScript code
        result = eval(command);
        
        // Display result
        const responseLine = document.createElement('div');
        responseLine.className = 'console-line';
        
        if (result !== undefined) {
            if (typeof result === 'object') {
                responseLine.textContent = JSON.stringify(result, null, 2);
            } else {
                responseLine.textContent = String(result);
            }
        } else {
            responseLine.textContent = 'undefined';
            responseLine.style.color = '#94a3b8';
        }
        
        output.appendChild(responseLine);
        
    } catch (error) {
        const errorLine = document.createElement('div');
        errorLine.className = 'console-line';
        errorLine.style.color = '#ef4444';
        errorLine.textContent = `Error: ${error.message}`;
        output.appendChild(errorLine);
    }
    
    input.value = '';
    output.scrollTop = output.scrollHeight;
}

// Content Management Functions
function loadContentItems() {
    const container = document.getElementById('contentItems');
    if (!container) return;
    
    const contentSections = [
        {
            id: 'hero',
            title: 'Ana Sayfa Hero Bölümü',
            current: {
                title: 'Fevkalade Bot ile Sunucunu Yönet',
                subtitle: 'Güçlü moderasyon, eğlenceli komutlar ve daha fazlası ile Discord sunucunu bir üst seviyeye taşı!'
            }
        },
        {
            id: 'features',
            title: 'Özellikler Bölümü',
            current: {
                title: 'Neden Fevkalade Bot?',
                description: 'Sunucunuz için ihtiyacınız olan tüm özellikleri tek bir bot\'ta topladık'
            }
        },
        {
            id: 'commands',
            title: 'Komutlar Bölümü',
            current: {
                title: 'Populüler Komutlar',
                description: 'En çok kullanılan komutlarımızı keşfedin'
            }
        },
        {
            id: 'stats',
            title: 'İstatistikler Bölümü',
            current: {
                title: 'Fevkalade İstatistikler',
                description: 'Gerçek zamanlı bot istatistiklerimizi görün'
            }
        },
        {
            id: 'cta',
            title: 'Harekete Geçirme Bölümü',
            current: {
                title: 'Hazır mısın?',
                subtitle: 'Fevkalade Bot\'u sunucuna ekle ve farkı hemen gör!'
            }
        },
        {
            id: 'footer',
            title: 'Footer Bölümü',
            current: {
                copyright: '© 2024 Fevkalade Bot. Tüm hakları saklıdır.',
                description: 'Discord sunucuları için geliştirilmiş profesyonel bot hizmeti'
            }
        }
    ];
    
    container.innerHTML = contentSections.map(section => {
        const savedContent = JSON.parse(localStorage.getItem(`site_${section.id}_content`) || '{}');
        const content = { ...section.current, ...savedContent };
        
        return `
            <div class="content-item">
                <h3>${section.title}</h3>
                <div class="content-preview">
                    ${Object.entries(content).map(([key, value]) => `
                        <div style="margin-bottom: 10px;">
                            <h4>${key.charAt(0).toUpperCase() + key.slice(1)}:</h4>
                            <p>${value}</p>
                        </div>
                    `).join('')}
                </div>
                <button class="edit-btn" onclick="editContent('${section.id}')">
                    <i class="fas fa-edit"></i>
                    Düzenle
                </button>
            </div>
        `;
    }).join('');
}

function editContent(sectionId) {
    const sections = {
        hero: { title: 'Ana Başlık', subtitle: 'Alt Başlık' },
        features: { title: 'Bölüm Başlığı', description: 'Bölüm Açıklaması' },
        commands: { title: 'Bölüm Başlığı', description: 'Bölüm Açıklaması' },
        stats: { title: 'Bölüm Başlığı', description: 'Bölüm Açıklaması' },
        cta: { title: 'Ana Başlık', subtitle: 'Alt Başlık' },
        footer: { copyright: 'Telif Hakkı Metni', description: 'Açıklama Metni' }
    };
    
    const fields = sections[sectionId];
    const savedContent = JSON.parse(localStorage.getItem(`site_${sectionId}_content`) || '{}');
    
    let formHTML = `<div style="background: rgba(0,0,0,0.8); position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="closeEditModal(event)">`;
    formHTML += `<div style="background: #1a1f2e; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; border: 1px solid rgba(255,255,255,0.1);" onclick="event.stopPropagation()">`;
    formHTML += `<h3 style="color: #3b82f6; margin-bottom: 20px;">${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Düzenle</h3>`;
    
    Object.entries(fields).forEach(([key, label]) => {
        const value = savedContent[key] || '';
        if (key.includes('description') || key.includes('subtitle')) {
            formHTML += `<div style="margin-bottom: 15px;"><label style="color: #cbd5e1; display: block; margin-bottom: 5px;">${label}</label><textarea id="edit_${key}" rows="3" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e2e8f0;">${value}</textarea></div>`;
        } else {
            formHTML += `<div style="margin-bottom: 15px;"><label style="color: #cbd5e1; display: block; margin-bottom: 5px;">${label}</label><input type="text" id="edit_${key}" value="${value}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e2e8f0;"></div>`;
        }
    });
    
    formHTML += `<div style="display: flex; gap: 10px; justify-content: flex-end;"><button onclick="closeEditModal()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer;">İptal</button><button onclick="saveEditedContent('${sectionId}')" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Kaydet</button></div>`;
    formHTML += `</div></div>`;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function closeEditModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
}

function saveEditedContent(sectionId) {
    const sections = {
        hero: ['title', 'subtitle'],
        features: ['title', 'description'],
        commands: ['title', 'description'],
        stats: ['title', 'description'],
        cta: ['title', 'subtitle'],
        footer: ['copyright', 'description']
    };
    
    const content = {};
    sections[sectionId].forEach(field => {
        const element = document.getElementById(`edit_${field}`);
        if (element) content[field] = element.value;
    });
    
    localStorage.setItem(`site_${sectionId}_content`, JSON.stringify(content));
    closeEditModal();
    loadContentItems();
    showNotification(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} bölümü güncellendi!`, 'success');
    logActivity('Content Updated', `${sectionId} bölümü güncellendi`);
}



// Link Management
function saveLinks() {
    const links = {
        discordInvite: document.getElementById('discordInvite').value,
        supportServer: document.getElementById('supportServer').value,
        botInvite: document.getElementById('botInvite').value
    };
    
    localStorage.setItem('site_links', JSON.stringify(links));
    logActivity('Links Updated', 'Site links were updated');
    showNotification('Linkler kaydedildi!', 'success');
}

// Content Management
function saveContent(section) {
    let content = {};
    let storageKey = '';
    let message = '';
    
    switch(section) {
        case 'hero':
            content = {
                title: document.getElementById('heroTitle').value,
                subtitle: document.getElementById('heroSubtitle').value
            };
            storageKey = 'site_hero_content';
            message = 'Hero bölümü';
            break;
        case 'features':
            content = {
                title: document.getElementById('featuresTitle').value,
                description: document.getElementById('featuresDescription').value
            };
            storageKey = 'site_features_content';
            message = 'Özellikler bölümü';
            break;
        case 'commands':
            content = {
                title: document.getElementById('commandsTitle').value,
                description: document.getElementById('commandsDescription').value
            };
            storageKey = 'site_commands_content';
            message = 'Komutlar bölümü';
            break;
        case 'stats':
            content = {
                title: document.getElementById('statsTitle').value,
                description: document.getElementById('statsDescription').value
            };
            storageKey = 'site_stats_content';
            message = 'İstatistikler bölümü';
            break;
        case 'cta':
            content = {
                title: document.getElementById('ctaTitle').value,
                subtitle: document.getElementById('ctaSubtitle').value
            };
            storageKey = 'site_cta_content';
            message = 'CTA bölümü';
            break;
        case 'footer':
            content = {
                copyright: document.getElementById('footerCopyright').value,
                description: document.getElementById('footerDescription').value
            };
            storageKey = 'site_footer_content';
            message = 'Footer bölümü';
            break;
    }
    
    localStorage.setItem(storageKey, JSON.stringify(content));
    logActivity('Content Updated', `${message} güncellendi`);
    showNotification(`${message} kaydedildi!`, 'success');
}

function loadContentData() {
    // Load existing content data into forms
    const sections = ['hero', 'features', 'commands', 'stats', 'cta', 'footer'];
    
    sections.forEach(section => {
        const data = JSON.parse(localStorage.getItem(`site_${section}_content`) || '{}');
        
        Object.keys(data).forEach(key => {
            const element = document.getElementById(`${section}${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.value = data[key];
            }
        });
    });
}



// Admin Management
function addAdmin() {
    const username = document.getElementById('newAdminUsername').value;
    const password = document.getElementById('newAdminPassword').value;
    const role = document.getElementById('newAdminRole').value;
    
    if (!username || !password) {
        showNotification('Kullanıcı adı ve şifre gerekli!', 'error');
        return;
    }
    
    // In production, save to secure database
    const admins = getAdmins();
    admins.push({
        id: Date.now(),
        username: username,
        role: role,
        createdAt: new Date().toLocaleDateString('tr-TR'),
        createdBy: getCurrentAdmin().name
    });
    
    localStorage.setItem('site_admins', JSON.stringify(admins));
    
    // Clear form
    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminPassword').value = '';
    
    loadAdminsList();
    logActivity('Admin Added', `New admin added: ${username} (${role})`);
    showNotification('Admin eklendi!', 'success');
}

function loadAdminsList() {
    const admins = getAdmins();
    const container = document.getElementById('adminsList');
    
    if (!container) return; // Element doesn't exist yet
    
    if (admins.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Henüz ek admin bulunmuyor</p>';
        return;
    }
    
    container.innerHTML = admins.map(admin => `
        <div class="admin-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h4 style="color: #e2e8f0; margin: 0 0 5px 0;">${admin.username}</h4>
                <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Rol: ${admin.role.toUpperCase()} | Oluşturan: ${admin.createdBy} | ${admin.createdAt}</p>
            </div>
            <button onclick="deleteAdmin(${admin.id})" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; color: #f87171; padding: 8px 12px; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteAdmin(id) {
    const admins = getAdmins().filter(a => a.id !== id);
    localStorage.setItem('site_admins', JSON.stringify(admins));
    loadAdminsList();
    logActivity('Admin Deleted', `Admin ID: ${id} deleted`);
    showNotification('Admin silindi!', 'success');
}

function getAdmins() {
    return JSON.parse(localStorage.getItem('site_admins') || '[]');
}

// Activity Logs
function logActivity(action, description) {
    const logs = getActivityLogs();
    logs.unshift({
        id: Date.now(),
        action: action,
        description: description,
        admin: getCurrentAdmin().name,
        timestamp: new Date().toLocaleString('tr-TR')
    });
    
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs.splice(100);
    }
    
    localStorage.setItem('activity_logs', JSON.stringify(logs));
    loadActivityLogs();
}

function loadActivityLogs() {
    const logs = getActivityLogs();
    const container = document.getElementById('logsList');
    
    if (!container) return; // Element doesn't exist yet
    
    if (logs.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Henüz aktivite logu bulunmuyor</p>';
        return;
    }
    
    container.innerHTML = logs.slice(0, 20).map(log => `
        <div class="log-item" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                <h4 style="color: #60a5fa; margin: 0; font-size: 0.95rem;">${log.action}</h4>
                <span style="color: #94a3b8; font-size: 0.8rem;">${log.timestamp}</span>
            </div>
            <p style="color: #cbd5e1; margin: 0 0 5px 0; font-size: 0.9rem;">${log.description}</p>
            <span style="color: #94a3b8; font-size: 0.8rem;">Admin: ${log.admin}</span>
        </div>
    `).join('');
}

function getActivityLogs() {
    return JSON.parse(localStorage.getItem('activity_logs') || '[]');
}

// Utility Functions
function getCurrentAdmin() {
    const session = JSON.parse(localStorage.getItem('admin_session'));
    return session ? session.admin : null;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// CSS Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);