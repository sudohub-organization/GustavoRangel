// ==========================================
// GLOBAL STATE & DATA
// ==========================================
let projectsData = [];
let timelineData = [];

let activeModal = null;
let isGamePaused = false;
let isStranded = false;

// Initialize Icons
lucide.createIcons();

// ==========================================
// DATA FETCHING & INITIALIZATION
// ==========================================
async function initializeGame() {
    try {
        // Fetch external JSON files
        const projRes = await fetch('../public/data/projects.json');
        projectsData = await projRes.json();

        const timeRes = await fetch('../public/data/timeline.json');
        timelineData = await timeRes.json();

        // Populate Timeline DOM
        populateTimeline();

        // Initialize 3D Scene
        init3DScene();
    } catch (error) {
        console.error("Failed to load JSON data. Ensure you are running a local server.", error);
    }
}

function populateTimeline() {
    const timelineContainer = document.getElementById('timeline-content');
    timelineContainer.innerHTML = ''; // clear initial
    timelineData.forEach(item => {
        timelineContainer.innerHTML += `
            <div class="relative">
                <div class="absolute w-4 h-4 bg-cyan-400 rounded-full -left-[32px] top-1.5 shadow-[0_0_10px_#22d3ee]"></div>
                <span class="text-sm font-bold text-cyan-400 tracking-wider">${item.year}</span>
                <h3 class="text-2xl font-bold text-white mt-1 mb-2">${item.title}</h3>
                <p class="text-slate-400 text-base">${item.desc}</p>
            </div>
        `;
    });
}

// Start sequence when page loads
window.addEventListener('load', initializeGame);

// ==========================================
// UI LOGIC (Modals)
// ==========================================
function openModal(id) {
    closeModals();
    document.body.classList.remove('game-active'); // Re-enable default mouse cursor
    document.getElementById('modal-backdrop').classList.remove('hidden');
    document.getElementById(id).classList.remove('hidden');
    activeModal = id;
    isGamePaused = true; // Stop movement when reading
}

function closeModals() {
    document.getElementById('modal-backdrop').classList.add('hidden');
    document.querySelectorAll('.glass-panel').forEach(el => {
        if (el.id.startsWith('modal-')) el.classList.add('hidden');
    });
    if (!isStranded) document.body.classList.add('game-active'); // Bring back crosshair if not stranded
    activeModal = null;
    setTimeout(() => isGamePaused = false, 100); // Slight delay to prevent immediate re-trigger
}

function openProject(index) {
    const data = projectsData[index];
    
    document.getElementById('proj-title').innerText = data.title;
    document.getElementById('proj-desc').innerText = data.description;
    
    // Parse Emojis (handle case if emojis array is missing)
    if(data.emojis && data.emojis.length > 0) {
        document.getElementById('proj-emoji').innerText = data.emojis.join(' ');
    } else {
        document.getElementById('proj-emoji').innerText = "🚀";
    }
    
    // Populate Tools
    const toolsContainer = document.getElementById('proj-tools');
    toolsContainer.innerHTML = '';
    if (data.tools) {
        data.tools.forEach(tool => {
            toolsContainer.innerHTML += `<span class="px-3 py-1 bg-slate-800 text-sm font-medium rounded-full border border-slate-700">${tool}</span>`;
        });
    }

    // Populate Links (URL / Repository)
    const linksContainer = document.getElementById('proj-links');
    linksContainer.innerHTML = '';
    
    if (data.url) {
        linksContainer.innerHTML += `<a href="${data.url}" target="_blank" class="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-500 transition-colors">Visit Project <i data-lucide="external-link" class="w-4 h-4"></i></a>`;
    }
    if (data.repository) {
        linksContainer.innerHTML += `<a href="${data.repository}" target="_blank" class="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors border border-slate-600">Repository <i data-lucide="github" class="w-4 h-4"></i></a>`;
    }
    
    // Re-initialize dynamic icons inside links
    lucide.createIcons({ nodes: [linksContainer] });
    
    openModal('modal-project');
}

// ==========================================
// THREE.JS SCENE LOGIC
// ==========================================
function init3DScene() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    // Camera setup (Top-down tilted)
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    const cameraOffset = new THREE.Vector3(0, 15, 20); // Height and distance behind ship

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // --- Space Background (Stars) ---
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
        starsVertices.push(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // --- The Player (Spaceship GLB) ---
    const shipGroup = new THREE.Group();
    shipGroup.position.set(0, 0, 30); // Start behind the other objects
    scene.add(shipGroup);

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('spaceship.glb', (gltf) => {
        const model = gltf.scene;
        model.rotation.x = Math.PI / 2; // Point forward
        shipGroup.add(model);
    });
    
    const engineLight = new THREE.PointLight(0xf472b6, 2, 5);
    engineLight.position.set(0, 0, 1.5);
    shipGroup.add(engineLight);

    const interactables = []; // Interactive items for raycaster

    // Helper to create text labels
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
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5, 1.25, 1);
        sprite.renderOrder = 999;
        return sprite;
    }

    // --- Character (Center Star) ---
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0, 0);
    scene.add(characterGroup);

    const starGeo = new THREE.IcosahedronGeometry(4, 1);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
    const star = new THREE.Mesh(starGeo, starMat);
    
    const coreGeo = new THREE.IcosahedronGeometry(3.5, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    star.add(core);

    const starLight = new THREE.PointLight(0xfacc15, 2, 50);
    characterGroup.add(starLight);

    star.userData = { isPortal: true, target: 'modal-character' };
    characterGroup.add(star);
    interactables.push(star);

    const hitGeoChar = new THREE.SphereGeometry(5, 16, 16);
    const hitMatChar = new THREE.MeshBasicMaterial({ visible: false });
    const hitBoxChar = new THREE.Mesh(hitGeoChar, hitMatChar);
    hitBoxChar.userData = { isPortal: true, target: 'modal-character' };
    characterGroup.add(hitBoxChar);
    interactables.push(hitBoxChar);

    const charLabel = createLabelSprite("CHARACTER");
    charLabel.position.y = 6;
    charLabel.userData = { isPortal: true, target: 'modal-character' };
    characterGroup.add(charLabel);
    interactables.push(charLabel);


    // --- My Projects (Right Hub) ---
    const projectsHubGroup = new THREE.Group();
    projectsHubGroup.position.set(30, 0, 0);
    scene.add(projectsHubGroup);

    const planetGeo = new THREE.SphereGeometry(4, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, emissive: 0x0f172a });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    projectsHubGroup.add(planet);

    const planetLabel = createLabelSprite("MY PROJECTS");
    planetLabel.position.y = 6;
    projectsHubGroup.add(planetLabel);

    const ringGeo = new THREE.RingGeometry(6, 6.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    projectsHubGroup.add(ring);

    // --- Orbiting Projects (Dynamically Generated from JSON) ---
    const orbitGroup = new THREE.Group();
    projectsHubGroup.add(orbitGroup);

    projectsData.forEach((project, i) => {
        const angle = (i / projectsData.length) * Math.PI * 2;
        const radius = 8;
        const sz = project.size || 1;
        
        let geo;
        switch (project.shape) {
            case 'pyramid': geo = new THREE.ConeGeometry(sz, sz * 2, 4); break;
            case 'octahedron': geo = new THREE.OctahedronGeometry(sz); break;
            case 'prism': geo = new THREE.CylinderGeometry(sz, sz, sz * 1.5, 6); break;
            case 'dodecahedron': geo = new THREE.DodecahedronGeometry(sz); break;
            case 'torus': geo = new THREE.TorusGeometry(sz, sz * 0.4, 8, 12); break;
            case 'box': default: geo = new THREE.BoxGeometry(sz, sz, sz); break;
        }

        const mat = new THREE.MeshStandardMaterial({ color: project.color, roughness: 0.2, emissive: project.color, emissiveIntensity: 0.2 });
        const mesh = new THREE.Mesh(geo, mat);

        const label = createLabelSprite(project.title);
        label.position.y = sz + 1.5;
        mesh.add(label);

        mesh.userData = { angle: angle, radius: radius, speed: 0.0008, id: i, isProject: true, isHovered: false };
        orbitGroup.add(mesh);
        interactables.push(mesh);
    });

    // --- Portals (Zones) ---
    function createPortal(color, position, labelText, modalId) {
        const group = new THREE.Group();
        group.position.copy(position);

        const portalGeo = new THREE.TorusGeometry(3, 0.2, 16, 100);
        const portalMat = new THREE.MeshBasicMaterial({ color: color });
        const portal = new THREE.Mesh(portalGeo, portalMat);
        portal.rotation.x = Math.PI / 2;
        portal.userData = { isPortal: true, target: modalId };
        group.add(portal);
        interactables.push(portal);

        const label = createLabelSprite(labelText);
        label.position.y = 6;
        label.userData = { isPortal: true, target: modalId };
        group.add(label);
        interactables.push(label);

        const hitGeoPort = new THREE.SphereGeometry(4, 16, 16);
        const hitMatPort = new THREE.MeshBasicMaterial({ visible: false });
        const hitBoxPort = new THREE.Mesh(hitGeoPort, hitMatPort);
        hitBoxPort.userData = { isPortal: true, target: modalId };
        group.add(hitBoxPort);
        interactables.push(hitBoxPort);

        const pGeo = new THREE.BufferGeometry();
        const pVerts = [];
        for(let i=0; i<50; i++) pVerts.push((Math.random()-0.5)*4, 0, (Math.random()-0.5)*4);
        pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pVerts, 3));
        const pMat = new THREE.PointsMaterial({ color: color, size: 0.2 });
        const particles = new THREE.Points(pGeo, pMat);
        group.add(particles);

        scene.add(group);
        return { group, portal, particles };
    }

    const timelinePortal = createPortal(0x22d3ee, new THREE.Vector3(-30, 0, 0), "Timeline", "modal-timeline");


    // ==========================================
    // INPUT CONTROLS
    // ==========================================
    const keys = { w: false, a: false, s: false, d: false };
    let joystickVector = new THREE.Vector2(0, 0);
    
    window.addEventListener('keydown', (e) => {
        if(isGamePaused) return;
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
        if (e.key === 'ArrowUp') keys.w = true;
        if (e.key === 'ArrowDown') keys.s = true;
        if (e.key === 'ArrowLeft') keys.a = true;
        if (e.key === 'ArrowRight') keys.d = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
        if (e.key === 'ArrowUp') keys.w = false;
        if (e.key === 'ArrowDown') keys.s = false;
        if (e.key === 'ArrowLeft') keys.a = false;
        if (e.key === 'ArrowRight') keys.d = false;
    });

    // Joystick for mobile
    const joystickManager = nipplejs.create({
        zone: document.getElementById('joystick-zone'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: '#f472b6'
    });

    joystickManager.on('move', (evt, data) => {
        if(isGamePaused) return;
        const force = Math.min(data.force, 1);
        joystickVector.x = Math.cos(data.angle.radian) * force;
        joystickVector.y = Math.sin(data.angle.radian) * force;
    });

    joystickManager.on('end', () => {
        joystickVector.set(0, 0);
    });

    // ==========================================
    // RAYCASTING (Clicking Projects)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        if(isGamePaused) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        let clientX = event.clientX;
        let clientY = event.clientY;

        if(event.changedTouches) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        }

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        if (intersects.length > 0) {
            let clicked = intersects[0].object;
            
            if (clicked.type === 'Sprite' && clicked.parent && clicked.parent.userData.isProject) {
                clicked = clicked.parent;
            }

            if (clicked.userData && clicked.userData.isProject) {
                openProject(clicked.userData.id);
            } else if (clicked.userData && clicked.userData.isPortal) {
                openModal(clicked.userData.target);
            }
        }
    }

    window.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('touchstart', (e) => {
        if(e.touches[0].clientX > window.innerWidth / 2) { 
            onMouseClick(e);
        }
    }, {passive: false});


    // ==========================================
    // GAME LOOP & PHYSICS
    // ==========================================
    const clock = new THREE.Clock();
    const shipVelocity = new THREE.Vector3();
    const maxSpeed = 0.15;
    const acceleration = 0.01;
    const friction = 0.95;

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (!isGamePaused) {
            if (!isStranded) {
                // --- Ship Movement ---
                let inputVector = new THREE.Vector3(0, 0, 0);

                if (keys.w) inputVector.z -= 1;
                if (keys.s) inputVector.z += 1;
                if (keys.a) inputVector.x -= 1;
                if (keys.d) inputVector.x += 1;

                if (joystickVector.length() > 0.1) {
                    inputVector.x = joystickVector.x;
                    inputVector.z = -joystickVector.y;
                }

                if (inputVector.length() > 0) inputVector.normalize();

                shipVelocity.x += inputVector.x * acceleration;
                shipVelocity.z += inputVector.z * acceleration;

                shipVelocity.multiplyScalar(friction);
                if (shipVelocity.length() > maxSpeed) {
                    shipVelocity.normalize().multiplyScalar(maxSpeed);
                }

                shipGroup.position.add(shipVelocity);

                if (shipVelocity.length() > 0.01) {
                    const targetAngle = Math.atan2(shipVelocity.x, shipVelocity.z);
                    let currentAngle = shipGroup.rotation.y;
                    let diff = targetAngle - currentAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    shipGroup.rotation.y += diff * 0.1;
                    shipGroup.rotation.z = -shipVelocity.x * 0.5;
                } else {
                    shipGroup.rotation.z *= 0.9;
                }

                // --- Out of Bounds Logic ---
                const dist = shipGroup.position.length();
                if (dist > 120) {
                    isStranded = true;
                    document.getElementById('warning-msg').classList.add('hidden');
                    document.getElementById('stranded-msg').classList.remove('hidden');
                    document.body.classList.remove('game-active');
                    shipVelocity.set(0, 0, 0);
                } else if (dist > 70) {
                    document.getElementById('warning-msg').classList.remove('hidden');
                } else {
                    document.getElementById('warning-msg').classList.add('hidden');
                }

            } else {
                // Stranded helpless spin
                shipGroup.rotation.x += 0.005;
                shipGroup.rotation.y += 0.01;
                shipGroup.rotation.z += 0.002;
            }

            // Camera Follow
            const targetCameraPos = shipGroup.position.clone().add(cameraOffset);
            camera.position.lerp(targetCameraPos, 0.05);
            camera.lookAt(shipGroup.position);
        }

        // --- Animations & Raycaster Hover Logic ---
        let isHoveringSomething = false;

        if (!isGamePaused && window.innerWidth > 768) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactables, true);
            
            interactables.forEach(m => {
                if(m.userData) m.userData.isHovered = false;
                if(m.userData && m.userData.isProject) {
                    m.scale.lerp(new THREE.Vector3(1,1,1), 0.1);
                }
            });

            if (intersects.length > 0) {
                let hovered = intersects[0].object;
                
                if (hovered.type === 'Sprite' && hovered.parent && hovered.parent.userData && hovered.parent.userData.isProject) {
                    hovered = hovered.parent;
                }

                if (hovered.userData && (hovered.userData.isProject || hovered.userData.isPortal)) {
                    hovered.userData.isHovered = true;
                    isHoveringSomething = true;
                    
                    if (hovered.userData.isProject) {
                        hovered.scale.lerp(new THREE.Vector3(1.4, 1.4, 1.4), 0.2);
                    }
                }
            }
        }

        const cursorEl = document.getElementById('custom-cursor');
        if (cursorEl) {
            if (isHoveringSomething) cursorEl.classList.add('cursor-hover');
            else cursorEl.classList.remove('cursor-hover');
        }

        const isTargetHovered = (targetId) => interactables.some(m => m.userData && m.userData.isHovered && m.userData.target === targetId);
        const charHovered = isTargetHovered('modal-character');
        const timelineHovered = isTargetHovered('modal-timeline');

        interactables.forEach(mesh => {
            if (mesh.userData && mesh.userData.isProject) {
                const data = mesh.userData;
                if (!data.isHovered) {
                    data.angle += data.speed;
                }
                mesh.position.x = Math.cos(data.angle) * data.radius;
                mesh.position.z = Math.sin(data.angle) * data.radius;
            }
        });

        if (!charHovered) {
            star.rotation.y += 0.005;
            star.rotation.z += 0.002;
        }

        if (!timelineHovered) {
            timelinePortal.portal.rotation.z += 0.01;
            timelinePortal.particles.rotation.y -= 0.005;
        }

        renderer.render(scene, camera);
    }

    // --- Window Resize ---
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        if(isGamePaused) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        const cursorEl = document.getElementById('custom-cursor');
        if(cursorEl) {
            cursorEl.style.left = e.clientX + 'px';
            cursorEl.style.top = e.clientY + 'px';
        }
    });

    animate();
}