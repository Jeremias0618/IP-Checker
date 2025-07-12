// ===== CONFIGURACIÓN DE THREE.JS =====
let scene, camera, renderer, particles, lines;
let animationId;

// ===== INICIALIZACIÓN =====
function initBackground() {
    // Crear escena
    scene = new THREE.Scene();
    
    // Crear cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Crear renderer
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Crear geometría de partículas
    createParticles();
    
    // Crear líneas de conexión
    createConnectionLines();
    
    // Crear efectos de luz
    createLightEffects();
    
    // Iniciar animación
    animate();
    
    // Manejar redimensionamiento
    window.addEventListener('resize', onWindowResize);
}

// ===== CREAR PARTÍCULAS =====
function createParticles() {
    const particleCount = 100; // Menos partículas para ser menos abrumador
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
        new THREE.Color(0x2563eb), // Primary blue
        new THREE.Color(0x10b981), // Success green
        new THREE.Color(0x06b6d4), // Info cyan
        new THREE.Color(0xf59e0b), // Warning orange
        new THREE.Color(0x64748b)  // Secondary gray
    ];
    
    for (let i = 0; i < particleCount; i++) {
        // Posición aleatoria
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
        
        // Color aleatorio
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Tamaño aleatorio
        sizes[i] = Math.random() * 1.5 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Material de partículas
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                gl_FragColor = vec4(vColor, 0.8 - distance * 1.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
}

// ===== CREAR LÍNEAS DE CONEXIÓN =====
function createConnectionLines() {
    const lineCount = 20; // Menos líneas
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];
    
    for (let i = 0; i < lineCount; i++) {
        const startX = (Math.random() - 0.5) * 15;
        const startY = (Math.random() - 0.5) * 15;
        const startZ = (Math.random() - 0.5) * 15;
        
        const endX = startX + (Math.random() - 0.5) * 3;
        const endY = startY + (Math.random() - 0.5) * 3;
        const endZ = startZ + (Math.random() - 0.5) * 3;
        
        linePositions.push(startX, startY, startZ);
        linePositions.push(endX, endY, endZ);
        
        const color = new THREE.Color(0x2563eb);
        lineColors.push(color.r, color.g, color.b);
        lineColors.push(color.r, color.g, color.b);
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    
    lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
}

// ===== CREAR EFECTOS DE LUZ =====
function createLightEffects() {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);
    
    // Luz direccional
    const directionalLight = new THREE.DirectionalLight(0x2563eb, 0.3);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Puntos de luz
    const lightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x2563eb,
        transparent: true,
        opacity: 0.6
    });
    
    for (let i = 0; i < 5; i++) {
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
        );
        scene.add(light);
    }
}

// ===== ANIMACIÓN =====
function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.0005; // Más lento
    
    // Rotar partículas suavemente
    if (particles) {
        particles.rotation.x = time * 0.05;
        particles.rotation.y = time * 0.08;
        
        // Animar posiciones de partículas
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.0005; // Movimiento más sutil
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Mover cámara suavemente
    camera.position.x = Math.sin(time * 0.3) * 1;
    camera.position.y = Math.cos(time * 0.2) * 0.5;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// ===== MANEJAR REDIMENSIONAMIENTO =====
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== EFECTOS INTERACTIVOS =====
function addMouseInteraction() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Mover cámara basado en posición del mouse (más sutil)
        camera.position.x += (mouseX * 1 - camera.position.x) * 0.01;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.01;
    });
}

// ===== EFECTOS DE SCROLL =====
function addScrollEffects() {
    let scrollY = 0;
    
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        
        // Parallax effect para las partículas (más sutil)
        if (particles) {
            particles.position.y = scrollY * 0.05;
        }
    });
}

// ===== EFECTOS DE HOVER =====
function addHoverEffects() {
    const cards = document.querySelectorAll('.pro-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Aumentar intensidad de partículas cercanas (más sutil)
            if (particles) {
                particles.material.uniforms.intensity = { value: 1.2 };
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Restaurar intensidad normal
            if (particles) {
                particles.material.uniforms.intensity = { value: 1.0 };
            }
        });
    });
}

// ===== LIMPIAR RECURSOS =====
function cleanupBackground() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    if (scene) {
        scene.clear();
    }
}

// ===== INICIALIZAR CUANDO EL DOM ESTÉ LISTO =====
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que Three.js se cargue
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            initBackground();
            addMouseInteraction();
            addScrollEffects();
            addHoverEffects();
        } else {
            console.warn('Three.js no está disponible');
        }
    }, 100);
});

// ===== MANEJAR VISIBILIDAD DE LA PÁGINA =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    } else {
        if (!animationId) {
            animate();
        }
    }
});

// ===== EXPORTAR FUNCIONES =====
window.initBackground = initBackground;
window.cleanupBackground = cleanupBackground; 