// ===== TEKLEGION 3D WAVE — Flowing Separator =====
// Uses Three.js to render a running sine-wave particle grid before the footer.

(function () {
    'use strict';

    const CANVAS_ID = 'wave-canvas';
    let container, canvas;
    let scene, camera, renderer;
    let particles, count = 0;
    
    // Wave configuration
    const SEPARATION = 42;
    const AMOUNTX = 64;
    const AMOUNTY = 16;
    
    function init() {
        canvas = document.getElementById(CANVAS_ID);
        if (!canvas) return;
        
        container = canvas.parentElement;

        // Camera - positioned to view the grid at a slight angle
        camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 10000);
        camera.position.set(0, 300, 700);
        camera.lookAt(new THREE.Vector3(0, -40, 0));

        // Scene
        scene = new THREE.Scene();

        // Particles Setup
        const numParticles = AMOUNTX * AMOUNTY;
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);
        
        // Brand Gradient: Royal Blue to Soft Blue
        const col1 = new THREE.Color(0x3730a3); // primary blue
        const col2 = new THREE.Color(0xa78bfa); // soft blue

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Coordinate setup
                positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // X coordinates
                positions[i + 1] = 0;                                           // Y (calculated in loop)
                positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // Z coordinates
                
                // Color transition from blue to cyan across the width of the separator
                const ratio = ix / AMOUNTX;
                const c = col1.clone().lerp(col2, ratio);
                colors[i] = c.r;
                colors[i + 1] = c.g;
                colors[i + 2] = c.b;

                i += 3;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Point shape materials
        const material = new THREE.PointsMaterial({
            size: 6.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // WebGL Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);

        window.addEventListener('resize', onWindowResize);
        
        animate();
    }

    function onWindowResize() {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        if (!particles) return;

        const positions = particles.geometry.attributes.position.array;
        let i = 0;
        
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Elegant running sine waves
                positions[i + 1] = (Math.sin((ix + count) * 0.3) * 35) +
                                   (Math.sin((iy + count) * 0.5) * 35);
                i += 3;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
        
        // Fluid running speed
        count += 0.045;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
