// Initialize a stunning 3D data core/globe for the About section
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('about-3d-canvas');
    if (!canvas) return;

    // Basic three setup
    const scene = new THREE.Scene();
    
    // We want a transparent background to overlay on the UI
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 18; // Moved closer to make globe larger

    // Geometry - a sphere of particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800; // Captivating but performant
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    const colorPrimary = new THREE.Color(0x3730A3); // Indigo
    const colorAccent = new THREE.Color(0xA78BFA); // Violet Highlight
    const colorBlue = new THREE.Color(0x38BDF8); // Light Blue Highlight

    for(let i = 0; i < particlesCount * 3; i+=3) {
        // Spherical distribution
        const radius = 10 + (Math.random() * 2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);     // x
        posArray[i+1] = radius * Math.sin(phi) * Math.sin(theta);   // y
        posArray[i+2] = radius * Math.cos(phi);                     // z

        // Randomize color mix
        const mix = Math.random();
        let pointColor;
        if(mix < 0.5) pointColor = colorPrimary;
        else if(mix < 0.8) pointColor = colorAccent;
        else pointColor = colorBlue;
        
        colorsArray[i] = pointColor.r;
        colorsArray[i+1] = pointColor.g;
        colorsArray[i+2] = pointColor.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.position.x = 4; // Shift right to avoid text fields
    scene.add(particlesMesh);

    // Inner glowing core
    const coreGeometry = new THREE.SphereGeometry(8, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x3730A3,
        transparent: true,
        opacity: 0.08,
        wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.x = 4; // Shift right
    scene.add(coreMesh);

    // Resize handler
    function resize() {
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const parentContainer = canvas.parentElement;

    parentContainer.addEventListener('mousemove', (event) => {
        const rect = parentContainer.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        mouseY = (event.clientY - rect.top) / rect.height - 0.5;
    });

    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        // Base rotation
        particlesMesh.rotation.y = elapsedTime * 0.1;
        particlesMesh.rotation.x = elapsedTime * 0.05;
        
        coreMesh.rotation.y = elapsedTime * -0.05;
        coreMesh.rotation.z = elapsedTime * 0.02;

        // Interactive mouse rotation (adds on top of base rotation)
        particlesMesh.rotation.x += (mouseY * 0.5 - particlesMesh.rotation.x) * 0.05;
        particlesMesh.rotation.y += (mouseX * 0.5 - particlesMesh.rotation.y) * 0.05;
        
        renderer.render(scene, camera);
    }
    
    animate();
});
