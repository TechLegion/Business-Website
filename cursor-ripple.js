// cursor-ripple.js
// A subtle, lightweight 2D interactive mesh that reacts to the mouse cursor globally.
(function() {
    'use strict';

    let canvas, ctx;
    let particles = [];
    const numParticles = 200; // Increased for density
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };
    
    // Config
    const config = {
        color: 'rgba(99, 102, 241, 0.4)', // Violet, more opaque
        lineColor: 'rgba(99, 102, 241, 0.25)',
        mouseRadius: 220, // Larger influence area
        particleSpeed: 0.5, // Faster ambient movement
        connectionDistance: 140
    };

    function init() {
        canvas = document.getElementById('cursor-mesh');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        
        resize();
        window.addEventListener('resize', resize);
        
        // Track mouse globally
        window.addEventListener('mousemove', (e) => {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Calculate velocity for more dynamic ripples
            mouse.vx = mouse.x - lastMouse.x;
            mouse.vy = mouse.y - lastMouse.y;
        });
        
        // Reset mouse when leaving
        document.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        createParticles();
        animate();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.baseRadius = Math.random() * 2.5 + 1.0; // Larger particles
            this.radius = this.baseRadius;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction - repel / ripple
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseRadius) {
                // Attract slightly but deform based on velocity
                const force = (config.mouseRadius - distance) / config.mouseRadius;
                
                // Mouse wake effect - push particles slightly in direction of mouse movement
                if (Math.abs(mouse.vx) > 0.5 || Math.abs(mouse.vy) > 0.5) {
                    this.x += mouse.vx * force * 0.06; // Stronger push
                    this.y += mouse.vy * force * 0.06;
                } else {
                    // Slow gentle attraction when still
                    this.x += dx * force * 0.03; // Stronger pull
                    this.y += dy * force * 0.03;
                }
                
                // Pulse size significantly
                this.radius = this.baseRadius + (force * 3.0);
            } else {
                this.radius = this.baseRadius;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.color;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        // Adjust particle count based on screen size for performance
        const count = Math.min(numParticles, (window.innerWidth * window.innerHeight) / 10000);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < config.connectionDistance) {
                    // Line opacity based on distance
                    const opacity = 1 - (dist / config.connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // If near mouse, lines get slightly brighter/violet
                    const mouseDist = Math.min(
                        Math.sqrt(Math.pow(mouse.x - particles[i].x, 2) + Math.pow(mouse.y - particles[i].y, 2)),
                        Math.sqrt(Math.pow(mouse.x - particles[j].x, 2) + Math.pow(mouse.y - particles[j].y, 2))
                    );
                    
                    if (mouseDist < config.mouseRadius) {
                        ctx.strokeStyle = `rgba(167, 139, 250, ${opacity * 0.8})`; // Bright violet near mouse
                        ctx.lineWidth = 1.0; // Thicker lines near mouse
                    } else {
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`; // Standard color
                        ctx.lineWidth = 0.6;
                    }
                    ctx.stroke();
                }
            }
        }
        
        // Decay mouse velocity
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
