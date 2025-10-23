// Smooth scrolling and animations
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close mobile menu when nav link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }

    // Animated counters
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            updateCounter();
        });
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Trigger counter animation for stats section
                if (entry.target.classList.contains('stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-card, .command-item, .stats').forEach(el => {
        observer.observe(el);
    });

    // Command category switching
    const categoryBtns = document.querySelectorAll('.category-btn');
    const commandGroups = document.querySelectorAll('.command-group');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Remove active class from all buttons and groups
            categoryBtns.forEach(b => b.classList.remove('active'));
            commandGroups.forEach(g => g.classList.remove('active'));
            
            // Add active class to clicked button and corresponding group
            btn.classList.add('active');
            const targetGroup = document.querySelector(`[data-group="${category}"]`);
            if (targetGroup) {
                targetGroup.classList.add('active');
            }
        });
    });

    // Parallax effect for floating shapes
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalHTML = heroTitle.innerHTML;
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
            heroTitle.innerHTML = originalHTML;
            heroTitle.style.opacity = '1';
            heroTitle.style.animation = 'fadeInUp 1s ease-out';
        }, 500);
    }

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Animate hero elements
        setTimeout(() => {
            document.querySelector('.hero-content')?.classList.add('animate');
        }, 200);
        
        setTimeout(() => {
            document.querySelector('.hero-visual')?.classList.add('animate');
        }, 400);
    });

    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('#features').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Feature cards hover effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0)';
        });
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .loaded .hero-content {
            animation: slideInUp 1s ease-out;
        }
        
        .loaded .hero-visual {
            animation: slideInRight 1s ease-out 0.3s both;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .feature-card.animate {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .stat-card.animate {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Preloader
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="preloader-logo">
                <img src="images/logo.png" alt="Fevkalade Bot">
            </div>
            <div class="preloader-spinner"></div>
        </div>
    `;
    
    const preloaderStyle = document.createElement('style');
    preloaderStyle.textContent = `
        .preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #0a0e1a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        .preloader.hidden {
            opacity: 0;
            visibility: hidden;
        }
        
        .preloader-content {
            text-align: center;
        }
        
        .preloader-logo img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 2rem;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .preloader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(preloaderStyle);
    document.body.appendChild(preloader);
    
    // Hide preloader when page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 1000);
    });
});
// Check for logged in user on all pages
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
});

function checkUserSession() {
    const userData = localStorage.getItem('discord_user_data');
    const sessionExpiry = localStorage.getItem('session_expiry');
    
    if (userData && sessionExpiry) {
        const now = new Date().getTime();
        const expiry = parseInt(sessionExpiry);
        
        if (now < expiry) {
            const user = JSON.parse(userData);
            showUserProfile(user);
        } else {
            clearUserSession();
        }
    }
}

function showUserProfile(user) {
    const userProfile = document.getElementById('userProfile');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const navUserName = document.getElementById('navUserName');
    const navLogout = document.getElementById('navLogout');
    
    if (userProfile && navUserAvatar && navUserName) {
        // Show user profile, hide dashboard button
        userProfile.style.display = 'flex';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
        
        // Set user data
        navUserAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        navUserName.textContent = user.username;
        
        // Add logout functionality
        if (navLogout) {
            navLogout.addEventListener('click', function(e) {
                e.preventDefault();
                clearUserSession();
                window.location.reload();
            });
        }
    }
}

function clearUserSession() {
    localStorage.removeItem('discord_user_data');
    localStorage.removeItem('discord_guilds_data');
    localStorage.removeItem('discord_access_token');
    localStorage.removeItem('session_expiry');
    localStorage.removeItem('dashboard_user_data');
}
// Load announcements on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncements();
});

function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('site_announcements') || '[]');
    const container = document.getElementById('announcementsContainer');
    
    if (!container) return;
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="no-announcements">
                <i class="fas fa-info-circle"></i>
                <p>Henüz duyuru bulunmuyor</p>
            </div>
        `;
        return;
    }
    
    // Show only latest 5 announcements
    const latestAnnouncements = announcements.slice(0, 5);
    
    container.innerHTML = latestAnnouncements.map(announcement => {
        const iconClass = getAnnouncementIcon(announcement.type);
        
        return `
            <div class="announcement-item ${announcement.type}">
                <div class="announcement-header">
                    <h3 class="announcement-title">
                        <span class="announcement-icon ${announcement.type}">
                            <i class="fas fa-${iconClass}"></i>
                        </span>
                        ${announcement.title}
                    </h3>
                    <span class="announcement-date">${announcement.date}</span>
                </div>
                <p class="announcement-content">${announcement.content}</p>
            </div>
        `;
    }).join('');
}

function getAnnouncementIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle'
    };
    return icons[type] || 'info-circle';
}

// Listen for storage changes to update announcements in real-time
window.addEventListener('storage', function(e) {
    if (e.key === 'site_announcements') {
        loadAnnouncements();
    }
});