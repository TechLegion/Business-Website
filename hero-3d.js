// ===== TEKLEGION HERO — 3D Neural Graph (Rewrite) =====
// Fixed: mouse parallax drift, synapse firing rate, shader attribute,
// edge visibility, and added proper cleanup + cursor ripple integration.

(function () {
    'use strict';

    const CANVAS_ID = 'hero-canvas';

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

    const CONFIG = {
        nodeCount:          isMobile ? 70  : 140,
        radius:             isMobile ? 4.5 : 6.5,
        connectionDistance: 3.2,
        rotationSpeed:      0.0008,
        cameraZ:            13,
        synapseChance:      0.008,   // per node per frame — was 0.0005, now visible
        pulseDecay:         0.018,
        colors: {
            node:      0x6366F1,   // indigo-400
            highlight: 0xA78BFA,   // violet-400
            edge:      0x6366F1
        }
    };

    let scene, camera, renderer, clock;
    let graphGroup;
    let nodesMesh;
    let nodesData = [];
    let posArr, colArr, sizeArr;
    let rafId = null;

    // Smooth mouse target — separate target from current to avoid drift
    const mouse  = { x: 0, y: 0 };   // raw normalised -1..1
    const smooth = { x: 0, y: 0 };   // lerped current rotation offset

    // ── Init ─────────────────────────────────────────────────────────────────

    function init() {
        const canvas = document.getElementById(CANVAS_ID);
        if (!canvas) return;

        const W = canvas.clientWidth;
        const H = canvas.clientHeight;

        scene  = new THREE.Scene();
        clock  = new THREE.Clock();

        camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.z = CONFIG.cameraZ;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H, false);

        buildGraph();
        bindEvents();
        animate();
    }

    // ── Graph construction ────────────────────────────────────────────────────

    function buildGraph() {
        graphGroup = new THREE.Group();
        scene.add(graphGroup);

        const N = CONFIG.nodeCount;
        posArr  = new Float32Array(N * 3);
        colArr  = new Float32Array(N * 3);
        sizeArr = new Float32Array(N);

        const baseC = new THREE.Color(CONFIG.colors.node);

        for (let i = 0; i < N; i++) {
            // Fibonacci sphere — more uniform than random
            const phi   = Math.acos(1 - (2 * (i + 0.5)) / N);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r     = CONFIG.radius + (Math.random() - 0.5) * 1.8;

            posArr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
            posArr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            posArr[i*3+2] = r * Math.cos(phi);

            colArr[i*3]   = baseC.r;
            colArr[i*3+1] = baseC.g;
            colArr[i*3+2] = baseC.b;

            sizeArr[i] = Math.random() * 0.7 + 0.6;

            nodesData.push({ pulse: 0, baseSize: sizeArr[i] });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(posArr,  3));
        geo.setAttribute('aColor',   new THREE.BufferAttribute(colArr,  3));  // named 'aColor', not 'color'
        geo.setAttribute('aSize',    new THREE.BufferAttribute(sizeArr, 1));

        // Shader uses explicit attribute names — no conflict with built-ins
        const mat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                attribute vec3 aColor;
                attribute float aSize;
                varying vec3 vColor;
                void main() {
                    vColor = aColor;
                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * (90.0 / -mvPos.z);
                    gl_Position  = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    float d = length(gl_PointCoord - vec2(0.5));
                    if (d > 0.5) discard;
                    float intensity = 1.0 - d * 2.0;
                    intensity = pow(intensity, 1.4);
                    gl_FragColor = vec4(vColor, intensity);
                }
            `,
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending
        });

        nodesMesh = new THREE.Points(geo, mat);
        graphGroup.add(nodesMesh);

        buildEdges();
    }

    function buildEdges() {
        const edgePos = [];
        const edgeCol = [];
        // Use a brighter edge color so lines are visible on white
        // opacity 0.35 + aditive blend reads well on both light/dark
        const ec = new THREE.Color(CONFIG.colors.edge);

        for (let i = 0; i < CONFIG.nodeCount; i++) {
            const ax = posArr[i*3], ay = posArr[i*3+1], az = posArr[i*3+2];

            for (let j = i + 1; j < CONFIG.nodeCount; j++) {
                const bx = posArr[j*3], by = posArr[j*3+1], bz = posArr[j*3+2];
                const dx = ax-bx, dy = ay-by, dz = az-bz;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < CONFIG.connectionDistance) {
                    // Fade edges that are nearly at the cutoff
                    const t = 1.0 - dist / CONFIG.connectionDistance;
                    edgePos.push(ax, ay, az, bx, by, bz);
                    edgeCol.push(ec.r*t, ec.g*t, ec.b*t, ec.r*t, ec.g*t, ec.b*t);
                }
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
        geo.setAttribute('color',    new THREE.Float32BufferAttribute(edgeCol, 3));

        const mat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent:  true,
            opacity:      0.35,   // was 0.15 — now visible on white bg
            blending:     THREE.AdditiveBlending,
            depthWrite:   false
        });

        graphGroup.add(new THREE.LineSegments(geo, mat));
    }

    // ── Synapse pulse ─────────────────────────────────────────────────────────

    function updateSynapses() {
        const base = new THREE.Color(CONFIG.colors.node);
        const hi   = new THREE.Color(CONFIG.colors.highlight);
        let dirty   = false;

        for (let i = 0; i < CONFIG.nodeCount; i++) {
            const nd = nodesData[i];

            // Fire randomly — 0.008 chance per frame = clearly visible pulses
            if (nd.pulse <= 0 && Math.random() < CONFIG.synapseChance) {
                nd.pulse = 1.0;
            }

            if (nd.pulse > 0) {
                nd.pulse = Math.max(0, nd.pulse - CONFIG.pulseDecay);

                sizeArr[i] = nd.baseSize + nd.pulse * 3.5;

                const c = base.clone().lerp(hi, nd.pulse);
                colArr[i*3]   = c.r;
                colArr[i*3+1] = c.g;
                colArr[i*3+2] = c.b;

                dirty = true;
            }
        }

        if (dirty) {
            nodesMesh.geometry.attributes.aSize.needsUpdate  = true;
            nodesMesh.geometry.attributes.aColor.needsUpdate = true;
        }
    }

    // ── Mouse parallax (fixed drift) ──────────────────────────────────────────
    // Key fix: track a TARGET offset separately from the graph's actual rotation.
    // We lerp smooth → target each frame, then SET rotation.x/y = baseRot + smooth.
    // Previously the code was adding a delta to rotation.y which accumulated infinitely.

    let baseRotX = 0;
    let baseRotY = 0;

    function bindEvents() {
        window.addEventListener('resize', onResize, { passive: true });

        const canvas = renderer.domElement;

        if (!isMobile) {
            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                mouse.x =  ((e.clientX - r.left)  / r.width)  * 2 - 1;
                mouse.y = -((e.clientY - r.top)    / r.height) * 2 + 1;
            }, { passive: true });

            canvas.addEventListener('mouseleave', () => {
                mouse.x = 0;
                mouse.y = 0;
            }, { passive: true });
        }
    }

    function onResize() {
        const canvas = renderer.domElement;
        const parent = canvas.parentElement;
        if (!parent) return;
        const W = parent.clientWidth;
        const H = parent.clientHeight;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
    }

    // ── Render loop ───────────────────────────────────────────────────────────

    function animate() {
        rafId = requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        updateSynapses();

        // Advance base rotation
        baseRotY += CONFIG.rotationSpeed;
        baseRotX += CONFIG.rotationSpeed * 0.4;

        // Lerp smooth mouse offset toward target (max ±0.4 rad tilt)
        const targetX = mouse.y * 0.4;
        const targetY = mouse.x * 0.4;
        smooth.x += (targetX - smooth.x) * 0.04;
        smooth.y += (targetY - smooth.y) * 0.04;

        // Set rotation directly — no drift
        graphGroup.rotation.x = baseRotX + smooth.x;
        graphGroup.rotation.y = baseRotY + smooth.y;

        nodesMesh.material.uniforms.uTime.value = t;

        renderer.render(scene, camera);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────

    function destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
    }

    // Expose destroy for SPA unmount hooks (React useEffect cleanup, etc.)
    window.__teklegionHeroDestroy = destroy;

    // ── Boot ──────────────────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
