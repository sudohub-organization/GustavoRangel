let projectsData = [];

// ==========================================
// UI LOGIC (Global so HTML onclick works)
// ==========================================
function showHero() {
    document.getElementById('project-view').classList.add('hidden');
    document.getElementById('project-view').classList.remove('flex');
    document.getElementById('contact-view').classList.add('hidden');
    document.getElementById('contact-view').classList.remove('flex');
    document.getElementById('hero-view').classList.remove('hidden');
}

function showProject(index) {
    const data = projectsData[index];

    document.getElementById('proj-title').innerText = data.title;
    document.getElementById('proj-desc').innerText = data.description;
    document.getElementById('proj-emoji').innerText = data.emojis.join(' ');

    const toolsContainer = document.getElementById('proj-tools');
    toolsContainer.innerHTML = '';
    data.tools.forEach(tool => {
        const span = document.createElement('span');
        span.className = 'px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700';
        span.innerText = tool;
        toolsContainer.appendChild(span);
    });

    const linksContainer = document.getElementById('proj-links');
    linksContainer.innerHTML = '';
    if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.target = '_blank';
        a.className = 'inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-500 transition-colors';
        a.innerHTML = 'Visit Project <i data-lucide="external-link" class="w-4 h-4"></i>';
        linksContainer.appendChild(a);
    }
    if (data.repository) {
        const a = document.createElement('a');
        a.href = data.repository;
        a.target = '_blank';
        a.className = 'inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors border border-slate-600';
        a.innerHTML = 'Repository <i data-lucide="github" class="w-4 h-4"></i>';
        linksContainer.appendChild(a);
    }
    lucide.createIcons({ nodes: [linksContainer] });

    document.getElementById('hero-view').classList.add('hidden');
    document.getElementById('contact-view').classList.add('hidden');
    document.getElementById('contact-view').classList.remove('flex');
    document.getElementById('project-view').classList.remove('hidden');
    document.getElementById('project-view').classList.add('flex');
}

function showContact() {
    document.getElementById('hero-view').classList.add('hidden');
    document.getElementById('project-view').classList.add('hidden');
    document.getElementById('project-view').classList.remove('flex');
    document.getElementById('contact-view').classList.remove('hidden');
    document.getElementById('contact-view').classList.add('flex');
}

// Bind close buttons after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // Initialize Icons

    const btnClose = document.getElementById('btn-close');
    const btnCloseContact = document.getElementById('btn-close-contact');
    if (btnClose) btnClose.addEventListener('click', showHero);
    if (btnCloseContact) btnCloseContact.addEventListener('click', showHero);
});


// ==========================================
// THREE.JS 3D SCENE LOGIC
// ==========================================
async function init3DScene() {
    // 1. Fetch JSON Data
    try {
        const response = await fetch('public/data/projects.json');
        projectsData = await response.json();
    } catch (error) {
        console.error("Failed to load project data. Make sure you are running a local server.", error);
        return;
    }

    // 2. Setup Scene
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // 3. Texture & Sprite Helpers
    function createMeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f62d55';
        ctx.fillRect(0, 0, 1024, 512);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 90px Inter, sans-serif';

        const fullText = ("ME - ME - ").repeat(5);
        ctx.fillText(fullText, 512, 256, 1000);

        return new THREE.CanvasTexture(canvas);
    }

    function createLabelSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 48px Inter, sans-serif';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);

        sprite.scale.set(3, 0.75, 1);
        return sprite;
    }

    const interactables = [];

    // 4. Generate Central "Me" Sphere
    const meTex = createMeTexture();
    const meGeo = new THREE.SphereGeometry(2, 64, 64);
    const meMat = new THREE.MeshStandardMaterial({ map: meTex, roughness: 0.2 });
    const meMesh = new THREE.Mesh(meGeo, meMat);
    meMesh.userData = { type: 'me', targetScale: new THREE.Vector3(1, 1, 1) };
    orbitGroup.add(meMesh);
    interactables.push(meMesh);

    // 5. Generate Project Shapes dynamically from JSON
    const radius = 7;
    const totalItems = projectsData.length;

    projectsData.forEach((project, i) => {
        const angle = (i / totalItems) * Math.PI * 2;
        let geometry;

        switch (project.shape) {
            case 'pyramid': geometry = new THREE.ConeGeometry(project.size, project.size * 2, 4); break;
            case 'octahedron': geometry = new THREE.OctahedronGeometry(project.size); break;
            case 'prism': geometry = new THREE.CylinderGeometry(project.size, project.size, project.size * 1.5, 6); break;
            case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(project.size); break;
            case 'torus': geometry = new THREE.TorusGeometry(project.size, project.size * 0.4, 8, 12); break;
            case 'box': default: geometry = new THREE.BoxGeometry(project.size, project.size, project.size); break;
        }

        const material = new THREE.MeshStandardMaterial({ color: project.color, roughness: 0.2 });
        const obj = new THREE.Mesh(geometry, material);

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2 }));
        obj.add(line);

        const sprite = createLabelSprite(project.title.toUpperCase());
        sprite.position.y = project.size + 0.6;
        obj.add(sprite);

        obj.position.x = Math.cos(angle) * radius;
        obj.position.z = Math.sin(angle) * radius;
        obj.position.y = Math.sin(angle * 3) * 1.5;
        obj.rotation.y = -angle;

        obj.userData = { type: 'project', id: i, targetScale: new THREE.Vector3(1, 1, 1) };

        orbitGroup.add(obj);
        interactables.push(obj);
    });

    // 6. Interaction Logic (Drag, Inertia, Raycasting)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    let angularVelocityX = 0.08;
    let angularVelocityY = 0.01;
    const friction = 0.95;
    const baseRotation = 0.0003;

    container.addEventListener('mousedown', () => isDragging = true);

    container.addEventListener('mousemove', (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
            const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
            angularVelocityX = deltaMove.x * 0.002;
            angularVelocityY = deltaMove.y * 0.002;

            orbitGroup.rotation.y += angularVelocityX;
            orbitGroup.rotation.x += angularVelocityY;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });

    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);

    // Click Detection
    container.addEventListener('click', (e) => {
        if (Math.abs(angularVelocityX) > 0.005 || Math.abs(angularVelocityY) > 0.005) return;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        if (intersects.length > 0) {
            let clickedObj = intersects[0].object;
            if (clickedObj.type === 'Sprite' || clickedObj.type === 'LineSegments') {
                clickedObj = clickedObj.parent;
            }

            if (clickedObj.userData.type === 'project') {
                showProject(clickedObj.userData.id);
            } else if (clickedObj.userData.type === 'me') {
                showHero();
            }
        }
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        previousMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }, {passive: false});

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        const deltaMove = { x: currentX - previousMousePosition.x, y: currentY - previousMousePosition.y };
        angularVelocityX = deltaMove.x * 0.002;
        angularVelocityY = deltaMove.y * 0.002;
        orbitGroup.rotation.y += angularVelocityX;
        orbitGroup.rotation.x += angularVelocityY;

        previousMousePosition = { x: currentX, y: currentY };
    }, {passive: false});

    container.addEventListener('touchend', () => isDragging = false);

    // 7. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            angularVelocityX *= friction;
            angularVelocityY *= friction;
            orbitGroup.rotation.y += angularVelocityX + baseRotation;
            orbitGroup.rotation.x += angularVelocityY;
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        interactables.forEach(c => c.userData.targetScale.set(1, 1, 1));

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            if (obj.type === 'Sprite' || obj.type === 'LineSegments') obj = obj.parent;

            obj.userData.targetScale.set(1.2, 1.2, 1.2);
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
        }

        interactables.forEach(c => c.scale.lerp(c.userData.targetScale, 0.1));

        renderer.render(scene, camera);
    }

    // 8. Handle Resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Start Rendering
    animate();
}

// Trigger initialization on window load
window.onload = init3DScene;
