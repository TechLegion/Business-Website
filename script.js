// ===== TEKLEGION WEBSITE - MODERN JAVASCRIPT =====

// API Configuration - Auto-detect environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'  // Local development
    : 'https://teklegion.org';  // Production

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initContactForm();
    initParallaxEffects();
    initSmoothScrolling();
    init3dTilt();
    initTerminalSimulation();
    initCardStackFan();
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            anchorPlacement: 'top-bottom'
        });
    }
});

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        navToggle.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
            trapFocus(navMenu);
        }
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Active link highlighting based on scroll position
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for skill bars
                if (entry.target.classList.contains('skill-progress')) {
                    animateSkillBar(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .skill-progress');
    animatedElements.forEach(el => observer.observe(el));
}

// ===== SKILL BARS ANIMATION =====
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        // Reset all skill bars to 0 width initially
        bar.style.width = '0%';
    });
}

function animateSkillBar(skillBar) {
    const targetWidth = skillBar.getAttribute('data-width');
    
    // Use requestAnimationFrame for smooth animation
    let currentWidth = 0;
    const increment = targetWidth / 60; // 60 frames for 1 second animation
    
    function updateWidth() {
        if (currentWidth < targetWidth) {
            currentWidth += increment;
            skillBar.style.width = Math.min(currentWidth, targetWidth) + '%';
            requestAnimationFrame(updateWidth);
        }
    }
    
    updateWidth();
}

// ===== CONTACT FORM FUNCTIONALITY =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formGroups = document.querySelectorAll('.form-group');
    
    if (!form) return;

    // Floating label effect
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');
        
        if (input && label) {
            // Check if input has value on load
            if (input.value.trim() !== '') {
                label.classList.add('active');
            }
            
            // Handle focus and blur events
            input.addEventListener('focus', () => {
                label.classList.add('active');
                
                // Unobtrusively wake up the database (runs only once per session)
                if (!window.dbPinged) {
                    window.dbPinged = true;
                    fetch(`${API_BASE_URL}/api/wakeup-db`).catch(console.error);
                }
            });
            
            input.addEventListener('blur', () => {
                if (input.value.trim() === '') {
                    label.classList.remove('active');
                }
            });
            
            // Handle input events for real-time validation
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    label.classList.add('active');
                }
            });
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Send to backend API
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Show success message
                showNotification(result.message || 'Message sent successfully! I\'ll get back to you soon.', 'success');
                form.reset();
                
                // Reset form labels
                formGroups.forEach(group => {
                    const label = group.querySelector('label');
                    if (label) label.classList.remove('active');
                });
                
                // Track successful submission
                trackEvent('contact_form_success', {
                    subject: data.subject,
                    budget: data.budget
                });
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            
            // Track failed submission
            trackEvent('contact_form_error', {
                error: error.message,
                subject: data.subject
            });
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: var(--font-primary);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== PARALLAX EFFECTS =====
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        parallaxElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
    });
});
}

// ===== TYPING ANIMATION =====
function initTypingAnimation() {
    const heroDescription = document.querySelector('.hero-description');
    
    if (heroDescription) {
        const text = heroDescription.textContent;
        heroDescription.textContent = '';
        heroDescription.style.opacity = '1';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroDescription.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        };
        
        // Start typing animation after a delay
        setTimeout(typeWriter, 1500);
    }
}

// ===== PARTICLE EFFECTS =====
function initParticleEffects() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create additional floating particles
    for (let i = 0; i < 10; i++) {
        createFloatingParticle();
    }
}

function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(55, 48, 163, 0.6);
        border-radius: 50%;
        left: ${startX}px;
        top: ${startY}px;
        animation: floatParticle ${duration}s linear infinite;
        animation-delay: ${delay}s;
        pointer-events: none;
        z-index: 1;
    `;
    
    document.querySelector('.hero-background').appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, (duration + delay) * 1000);
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const text = counter.textContent.trim();
        
        // Check if the text contains numbers (for numerical counters)
        if (/\d/.test(text)) {
            const target = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/\d/g, '');
            let current = 0;
            const increment = target / 60; // 60 frames for 1 second animation
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };
            
            updateCounter();
        } else {
            // For text-based stats, just ensure they're visible
            counter.style.opacity = '1';
        }
    });
}

// ===== INTERSECTION OBSERVER FOR COUNTERS =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe stats section (in about or hero)
const statsSection = document.querySelector('.about-stats') || document.querySelector('.hero-stats');
if (statsSection) {
    counterObserver.observe(statsSection);
}

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    // Add loaded class to body for CSS animations
    document.body.classList.add('loaded');
    
    // Hide loading screen if exists
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events for better performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    // Any scroll-related functionality that needs throttling
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // You can add error reporting here
});

// ===== ACCESSIBILITY IMPROVEMENTS =====
// Keyboard navigation for mobile menu
document.addEventListener('keydown', (e) => {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
        navToggle.focus();
    }
});

// Focus management for accessibility
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(element) {
    const focusableContent = element.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
        } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// ===== SERVICE WORKER REGISTRATION (for PWA features) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// ===== ANALYTICS TRACKING =====
function trackEvent(eventName, eventData = {}) {
    // Track to backend analytics
    fetch(`${API_BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: eventName,
            page: window.location.pathname,
            metadata: eventData
        })
    }).catch(error => {
        console.error('Analytics tracking error:', error);
    });
    
    // Track page views
    if (eventName === 'page_view') {
        trackPageView();
    }
    
    console.log('Event tracked:', eventName, eventData);
}

function trackPageView() {
    fetch(`${API_BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: 'page_view',
            page: window.location.pathname,
            metadata: {
                title: document.title,
                referrer: document.referrer
            }
        })
    }).catch(error => {
        console.error('Page view tracking error:', error);
    });
}

// Track page view on load
document.addEventListener('DOMContentLoaded', () => {
    trackPageView();
});

// Track page view on navigation (for SPA behavior)
window.addEventListener('popstate', () => {
    trackPageView();
});

// Track important interactions
document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (target) {
        const action = target.textContent.trim() || target.getAttribute('aria-label') || 'click';
        trackEvent('click', { action, element: target.tagName });
    }
});

// ===== 3D CARD TILT SHIMMER EFFECT =====
function init3dTilt() {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        const glare = card.querySelector('.card-glare');
        
        card.addEventListener('mouseenter', () => {
            // Remove reset transitions to prevent delay on tilt
            card.style.transition = 'none';
            if (glare) {
                glare.style.opacity = '1';
                glare.style.transition = 'none';
            }
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within the element
            const y = e.clientY - rect.top;  // y coordinate within the element
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Calculate tilt angle based on distance from center
            // Max tilt of 8 degrees to keep it professional
            const rotateY = ((x - xc) / xc) * 8;
            const rotateX = -((y - yc) / yc) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Move glare spotlight coordinate
            if (glare) {
                glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(55, 48, 163, 0.08) 0%, transparent 65%)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Add reset transition back smoothly
            card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            
            if (glare) {
                glare.style.transition = 'opacity 0.5s ease';
                glare.style.opacity = '0';
            }
        });
    });
}

// ===== GITHUB TERMINAL SIMULATION =====
function initTerminalSimulation() {
    const terminalBody = document.getElementById('terminal-body');
    if (!terminalBody) return;
    
    const lines = [
        { type: 'command', text: 'teklegion compile --target=intelligence' },
        { type: 'info', text: '[INFO] Initializing cognitive architecture...' },
        { type: 'info', text: '[INFO] Loading synaptic neural nodes...' },
        { type: 'info', text: '[INFO] Syncing TekLegion Core API (localhost:5000)...' },
        { type: 'output', text: '[SUCCESS] Dynamic model compiled successfully.' },
        { type: 'command', text: 'teklegion status' },
        { type: 'output', text: 'System: Active | CPU: 14% | Neural Load: Optimal' },
        { type: 'command', text: 'git push origin main' },
        { type: 'info', text: 'Enumerating objects: 12, done.' },
        { type: 'info', text: 'Writing objects: 100% (12/12), 2.45 KiB | 2.45 MiB/s, done.' },
        { type: 'output', text: 'To github.com/TechLegion/Core.git\n   a3b82f6..2563eb  main -> main' },
        { type: 'command', text: 'clear' }
    ];
    
    let currentLineIndex = 0;
    
    function appendLine(type, text, callback) {
        const lineDiv = document.createElement('div');
        lineDiv.className = `terminal-line ${type}`;
        
        if (type === 'command') {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'terminal-prompt';
            promptSpan.textContent = 'teklegion@desktop:~$ ';
            lineDiv.appendChild(promptSpan);
            
            const textSpan = document.createElement('span');
            lineDiv.appendChild(textSpan);
            
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'terminal-cursor';
            lineDiv.appendChild(cursorSpan);
            
            terminalBody.appendChild(lineDiv);
            
            // Typewriter effect for command
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < text.length) {
                    textSpan.textContent += text[charIndex];
                    charIndex++;
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                } else {
                    clearInterval(typingInterval);
                    cursorSpan.remove();
                    if (callback) setTimeout(callback, 500);
                }
            }, 60);
        } else {
            lineDiv.textContent = text;
            terminalBody.appendChild(lineDiv);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            if (callback) setTimeout(callback, 400);
        }
    }
    
    function runSimulation() {
        if (currentLineIndex >= lines.length) {
            currentLineIndex = 0;
        }
        
        const line = lines[currentLineIndex];
        
        if (line.text === 'clear') {
            setTimeout(() => {
                terminalBody.innerHTML = '';
                currentLineIndex++;
                runSimulation();
            }, 1500);
            return;
        }
        
        appendLine(line.type, line.text, () => {
            currentLineIndex++;
            runSimulation();
        });
    }
    
    setTimeout(runSimulation, 1000);
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initScrollAnimations,
        initSkillBars,
        initContactForm,
        showNotification,
        animateCounters
    };
}

// ===== QRIKA CARD STACK FAN-OUT =====
function initCardStackFan() {
    const stack = document.getElementById('qrika-stack');
    if (!stack) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    stack.classList.add('is-visible');
                }, 400);
                observer.unobserve(stack);
            }
        });
    }, { threshold: 0.4 });

    observer.observe(stack);

    stack.addEventListener('mouseenter', () => stack.classList.add('is-visible'));
    stack.addEventListener('mouseleave', () => {
        stack.classList.remove('is-visible');
    });
}

// ===== CLASHARENA LIVE METRICS TICKER =====
(function initClashArenaMetrics() {
    const playersEl = document.getElementById('ca-players');
    const latencyEl = document.getElementById('ca-latency');
    if (!playersEl || !latencyEl) return;

    function randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let players = 1247;
    setInterval(() => {
        players += randomBetween(-8, 12);
        players = Math.max(900, Math.min(2000, players));
        playersEl.textContent = players.toLocaleString() + ' Online';

        const ms = randomBetween(8, 18);
        latencyEl.textContent = ms + 'ms';
    }, 2200);
})();

// ===== AI PIPELINE WIDGET LIVE TICKER =====
(function initAIPipelineWidget() {
    const latencyEl  = document.getElementById('apw-latency');
    const throughEl  = document.getElementById('apw-throughput');
    const liveLineEl = document.getElementById('apw-live-line');
    if (!latencyEl) return;

    const logMessages = [
        'Inference running...',
        'Embedding vectors ✓',
        'Classification done ✓',
        'Response generated ✓',
        'Caching result ✓',
        'Next batch queued...',
    ];
    let logIdx = 0;

    setInterval(() => {
        const ms = Math.floor(Math.random() * 30) + 38;
        latencyEl.textContent = ms + 'ms';

        const rps = (3000 + Math.floor(Math.random() * 500)).toLocaleString();
        throughEl.textContent = rps + ' req/s';

        if (liveLineEl) {
            logIdx = (logIdx + 1) % logMessages.length;
            const ts = new Date();
            const hh = String(ts.getHours()).padStart(2,'0');
            const mm = String(ts.getMinutes()).padStart(2,'0');
            const ss = String(ts.getSeconds()).padStart(2,'0');
            liveLineEl.innerHTML = `<span class="apw-ts">[${hh}:${mm}:${ss}]</span> ${logMessages[logIdx]}`;
        }
    }, 1800);
})();

// ===== SERVICES BENTO: MINI NEURAL CANVAS =====
(function initServiceNeuralCanvas() {
    const canvas = document.getElementById('sb-neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const nodeCount = 20;
    const nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 3 + 2,
        pulse: Math.random() * Math.PI * 2
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(99,102,241,${0.25 * (1 - dist / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            n.pulse += 0.04;
            const glowSize = n.r + Math.sin(n.pulse) * 2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99,102,241,0.8)';
            ctx.fill();

            // Move
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// ===== SERVICES SPOTLIGHT =====
(function initServicesSpotlight() {
    const tabs   = document.querySelectorAll('.ssp-tab');
    const panels = document.querySelectorAll('.ssp-panel');
    if (!tabs.length) return;

    let autoTimer = null;

    function activateTab(panel) {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        const tab = document.querySelector(`.ssp-tab[data-panel="${panel}"]`);
        const pnl = document.querySelector(`.ssp-panel[data-panel="${panel}"]`);
        if (!tab || !pnl) return;

        // Force reflow to restart the tab-bar CSS transition
        const bar = tab.querySelector('.ssp-tab-bar');
        if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = ''; }

        tab.classList.add('active');
        pnl.classList.add('active');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            clearInterval(autoTimer);
            activateTab(tab.dataset.panel);
            startAuto(tab.dataset.panel);
        });
    });

    function startAuto(startPanel) {
        const order = ['ai','software','data','automation'];
        let idx = order.indexOf(startPanel);
        autoTimer = setInterval(() => {
            idx = (idx + 1) % order.length;
            activateTab(order[idx]);
        }, 5000);
    }

    activateTab('ai');
    startAuto('ai');

    // Neural canvas for AI panel
    const nc = document.getElementById('ssp-neural');
    if (nc) {
        const ctx = nc.getContext('2d');
        function resize() { nc.width = nc.offsetWidth; nc.height = nc.offsetHeight; }
        resize();
        window.addEventListener('resize', resize);

        const nodes = Array.from({ length: 28 }, () => ({
            x: Math.random() * nc.width,
            y: Math.random() * nc.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 3 + 2,
            pulse: Math.random() * Math.PI * 2
        }));

        function drawNeural() {
            ctx.clearRect(0, 0, nc.width, nc.height);
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    if (d < 130) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(99,102,241,${0.3*(1-d/130)})`;
                        ctx.lineWidth = 1; ctx.stroke();
                    }
                }
            }
            nodes.forEach(n => {
                n.pulse += 0.035;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse)*1.5, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(99,102,241,0.85)'; ctx.fill();
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > nc.width)  n.vx *= -1;
                if (n.y < 0 || n.y > nc.height) n.vy *= -1;
            });
            requestAnimationFrame(drawNeural);
        }
        drawNeural();
    }

    // Sparkline for Data panel
    const linePath = document.getElementById('ssp-line');
    const areaPath = document.getElementById('ssp-area');
    if (linePath) {
        const W = 400, H = 140;
        let pts = Array.from({ length: 20 }, (_, i) => ({
            x: (i / 19) * W,
            y: H - (Math.random() * 0.6 + 0.2) * H
        }));

        function buildPath(points) {
            return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        }

        function updateSparkline() {
            pts.shift();
            pts.push({ x: W, y: H - (Math.random() * 0.6 + 0.2) * H });
            pts.forEach((p, i) => p.x = (i / (pts.length - 1)) * W);
            const d = buildPath(pts);
            linePath.setAttribute('d', d);
            areaPath.setAttribute('d', d + ` L${W},${H} L0,${H} Z`);
        }

        setInterval(updateSparkline, 900);
        updateSparkline();
    }
})();

// ===== QRIKA BROWSER CAROUSEL =====
(function initQrikaCarousel() {
    const slides = document.querySelectorAll('.qrika-slide');
    const dots   = document.querySelectorAll('.qrika-dot');
    if (!slides.length) return;

    let current = 0;
    let timer = null;

    function goTo(idx) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function startAuto() {
        timer = setInterval(() => goTo(current + 1), 3500);
    }

    // Dot click
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(timer);
            goTo(i);
            startAuto();
        });
    });

    startAuto();
})();
