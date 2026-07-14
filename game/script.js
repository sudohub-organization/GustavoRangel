const PLAY_BOUNDS = {
    x: 12,
    y: 6.5
};

const PLAYER_RADIUS = 1.15;
const OBSTACLE_RADIUS = 1.75;
const OBSTACLE_START_Z = -95;
const OBSTACLE_CLEAR_Z = 12;
const MAX_ACTIVE_OBSTACLES = 4;
const MIN_OBSTACLE_SPAWN_GAP = 1;
const MAX_OBSTACLE_SPAWN_GAP = 2;
const BASE_OBSTACLE_SPEED = 20;
const SPEED_GAIN_PER_SECOND = 0.56;
const PLAYER_ACCELERATION = 38;
const PLAYER_FRICTION = 0.86;
const PLAYER_MAX_SPEED = 16;
const TIMER_UPDATE_INTERVAL = 0.15;
const SHIP_MODEL_ROTATION = { x: Math.PI / 2, y: Math.PI, z: Math.PI };
const FALLBACK_SHIP_ROTATION = { x: -Math.PI / 2, y: Math.PI, z: Math.PI };

const keys = { w: false, a: false, s: false, d: false };
const gameState = {
    isRunning: true,
    elapsed: 0,
    nextTimerPaint: 0,
    obstacles: [],
    nextObstacleAt: 0,
    lastObstaclePosition: new THREE.Vector2(0, 0),
    contactLoaded: false
};

let joystickVector = new THREE.Vector2(0, 0);

lucide.createIcons();
window.addEventListener('load', initGame);

function initGame() {
    const container = document.getElementById('canvas-container');
    const timerValue = document.getElementById('timer-value');
    const speedValue = document.getElementById('speed-value');
    const lossBackdrop = document.getElementById('loss-backdrop');
    const lossModal = document.getElementById('loss-modal');
    const finalScore = document.getElementById('final-score');
    const contactContainer = document.getElementById('score-contact-container');

    document.getElementById('dismiss-instructions')?.addEventListener('click', () => {
        document.getElementById('instructions')?.classList.add('hidden');
    });

    document.getElementById('restart-game')?.addEventListener('click', () => {
        window.location.reload();
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.018);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 220);
    camera.position.set(0, 5, 24);
    camera.lookAt(0, -13, -45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x020617, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(8, 12, 12);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xf472b6, 2.3, 26);
    rimLight.position.set(0, -4, 6);
    scene.add(rimLight);

    const starField = createStarField();
    scene.add(starField);

    const tunnel = createLaneTunnel();
    scene.add(tunnel);

    const shipGroup = createPlayerShip();
    scene.add(shipGroup);

    loadShipModel(shipGroup);
    setupKeyboardControls();
    setupJoystick();

    const clock = new THREE.Clock();
    const shipVelocity = new THREE.Vector2(0, 0);

    addObstacle(scene);

    function animate() {
        requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);

        if (gameState.isRunning) {
            gameState.elapsed += delta;
            updateTimer(timerValue, gameState.elapsed);
            updateSpeed(speedValue, gameState.elapsed);
            updatePlayer(shipGroup, shipVelocity, delta);
            updateObstacles(scene, delta);
            updateBackground(starField, tunnel, delta);

            if (hasCollision(shipGroup, gameState.obstacles)) {
                endGame();
            }
        } else {
            shipGroup.rotation.z *= 0.96;
            gameState.obstacles.forEach((obstacle) => {
                obstacle.mesh.rotation.x += delta * 0.8;
                obstacle.mesh.rotation.y += delta * 0.9;
            });
        }

        renderer.render(scene, camera);
    }

    function endGame() {
        if (!gameState.isRunning) return;

        gameState.isRunning = false;
        const score = formatTime(gameState.elapsed);
        finalScore.textContent = score;
        lossBackdrop.classList.remove('hidden');
        lossModal.classList.remove('hidden');
        lossModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('game-over');
        loadContactForm(contactContainer, score);
    }

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    animate();
}

function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.09,
        transparent: true,
        opacity: 0.82
    });
    const starsVertices = [];

    for (let i = 0; i < 2600; i += 1) {
        starsVertices.push(
            (Math.random() - 0.5) * 140,
            (Math.random() - 0.5) * 80,
            -Math.random() * 180
        );
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    return new THREE.Points(starsGeometry, starsMaterial);
}

function createLaneTunnel() {
    const tunnel = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.22
    });

    for (let i = 0; i < 9; i += 1) {
        const z = -12 - i * 10;
        const points = [
            new THREE.Vector3(-PLAY_BOUNDS.x, -PLAY_BOUNDS.y, z),
            new THREE.Vector3(PLAY_BOUNDS.x, -PLAY_BOUNDS.y, z),
            new THREE.Vector3(PLAY_BOUNDS.x, PLAY_BOUNDS.y, z),
            new THREE.Vector3(-PLAY_BOUNDS.x, PLAY_BOUNDS.y, z),
            new THREE.Vector3(-PLAY_BOUNDS.x, -PLAY_BOUNDS.y, z)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        tunnel.add(new THREE.Line(geometry, lineMaterial));
    }

    return tunnel;
}

function createPlayerShip(fallbackRotation = FALLBACK_SHIP_ROTATION) {
    const shipGroup = new THREE.Group();
    shipGroup.position.set(0, 0, 0);

    const engineLight = new THREE.PointLight(0xf472b6, 2.6, 8);
    engineLight.position.set(0, -0.4, 1.6);
    shipGroup.add(engineLight);

    const fallbackGeometry = new THREE.ConeGeometry(0.8, 2.2, 4);
    const fallbackMaterial = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        emissive: 0x7c2d52,
        roughness: 0.35
    });
    const fallbackShip = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    applyRotation(fallbackShip, fallbackRotation);
    fallbackShip.name = 'fallback-ship';
    shipGroup.add(fallbackShip);

    return shipGroup;
}

function loadShipModel(shipGroup, modelRotation = SHIP_MODEL_ROTATION) {
    const gltfLoader = new THREE.GLTFLoader();

    gltfLoader.load('spaceship.glb', (gltf) => {
        const fallbackShip = shipGroup.getObjectByName('fallback-ship');
        if (fallbackShip) shipGroup.remove(fallbackShip);

        const model = gltf.scene;
        applyRotation(model, modelRotation);
        model.scale.setScalar(0.85);
        shipGroup.add(model);
    });
}

function applyRotation(object, rotation) {
    object.rotation.set(rotation.x, rotation.y, rotation.z);
}

function setupKeyboardControls() {
    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(keys, key)) keys[key] = true;
        if (event.key === 'ArrowUp') keys.w = true;
        if (event.key === 'ArrowDown') keys.s = true;
        if (event.key === 'ArrowLeft') keys.a = true;
        if (event.key === 'ArrowRight') keys.d = true;
    });

    window.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(keys, key)) keys[key] = false;
        if (event.key === 'ArrowUp') keys.w = false;
        if (event.key === 'ArrowDown') keys.s = false;
        if (event.key === 'ArrowLeft') keys.a = false;
        if (event.key === 'ArrowRight') keys.d = false;
    });
}

function setupJoystick() {
    const joystickZone = document.getElementById('joystick-zone');
    if (!joystickZone || !window.nipplejs) return;

    const joystickManager = nipplejs.create({
        zone: joystickZone,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: '#f472b6'
    });

    joystickManager.on('move', (evt, data) => {
        if (!gameState.isRunning) return;
        if (evt?.preventDefault) evt.preventDefault();
        const force = Math.min(data.force, 1);
        joystickVector.x = Math.cos(data.angle.radian) * force;
        joystickVector.y = Math.sin(data.angle.radian) * force;
    });

    joystickManager.on('end', () => {
        joystickVector.set(0, 0);
    });
}

function updatePlayer(shipGroup, shipVelocity, delta) {
    const inputVector = new THREE.Vector2(0, 0);

    if (keys.w) inputVector.y += 1;
    if (keys.s) inputVector.y -= 1;
    if (keys.a) inputVector.x -= 1;
    if (keys.d) inputVector.x += 1;

    if (joystickVector.length() > 0.1) {
        inputVector.copy(joystickVector);
    }

    if (inputVector.length() > 0) {
        inputVector.normalize();
        shipVelocity.x += inputVector.x * PLAYER_ACCELERATION * delta;
        shipVelocity.y += inputVector.y * PLAYER_ACCELERATION * delta;
    }

    shipVelocity.multiplyScalar(Math.pow(PLAYER_FRICTION, delta * 60));
    if (shipVelocity.length() > PLAYER_MAX_SPEED) {
        shipVelocity.normalize().multiplyScalar(PLAYER_MAX_SPEED);
    }

    shipGroup.position.x = clamp(shipGroup.position.x + shipVelocity.x * delta, -PLAY_BOUNDS.x, PLAY_BOUNDS.x);
    shipGroup.position.y = clamp(shipGroup.position.y + shipVelocity.y * delta, -PLAY_BOUNDS.y, PLAY_BOUNDS.y);

    if (Math.abs(shipGroup.position.x) >= PLAY_BOUNDS.x) shipVelocity.x = 0;
    if (Math.abs(shipGroup.position.y) >= PLAY_BOUNDS.y) shipVelocity.y = 0;

    shipGroup.rotation.z = THREE.MathUtils.lerp(shipGroup.rotation.z, -shipVelocity.x * 0.035, 0.16);
    shipGroup.rotation.x = THREE.MathUtils.lerp(shipGroup.rotation.x, shipVelocity.y * 0.018, 0.12);
}

function addObstacle(scene, spawnDelay = getNextObstacleGap()) {
    if (gameState.obstacles.length >= MAX_ACTIVE_OBSTACLES) return;

    gameState.obstacles.push(spawnObstacle(scene));
    gameState.nextObstacleAt = gameState.elapsed + spawnDelay;
}

function getNextObstacleGap() {
    return THREE.MathUtils.randFloat(MIN_OBSTACLE_SPAWN_GAP, MAX_OBSTACLE_SPAWN_GAP);
}

function spawnObstacle(scene) {
    const obstacleGroup = new THREE.Group();
    const shape = Math.floor(Math.random() * 4);
    const size = THREE.MathUtils.randFloat(1.35, 2.15);

    let geometry;
    if (shape === 0) geometry = new THREE.IcosahedronGeometry(size, 1);
    else if (shape === 1) geometry = new THREE.OctahedronGeometry(size, 1);
    else if (shape === 2) geometry = new THREE.DodecahedronGeometry(size, 0);
    else geometry = new THREE.TorusKnotGeometry(size * 0.62, size * 0.22, 72, 8);

    const material = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0x7c2d12,
        emissiveIntensity: 0.3,
        roughness: 0.55,
        metalness: 0.12
    });
    const mesh = new THREE.Mesh(geometry, material);
    obstacleGroup.add(mesh);

    const glow = new THREE.PointLight(0xf97316, 1.2, 10);
    obstacleGroup.add(glow);

    const nextPosition = getRandomObstaclePosition();
    obstacleGroup.position.set(nextPosition.x, nextPosition.y, OBSTACLE_START_Z);
    gameState.lastObstaclePosition.copy(nextPosition);
    scene.add(obstacleGroup);

    return {
        mesh: obstacleGroup,
        radius: OBSTACLE_RADIUS * (size / 1.75),
        spin: new THREE.Vector3(
            THREE.MathUtils.randFloat(0.7, 1.4),
            THREE.MathUtils.randFloat(0.5, 1.2),
            THREE.MathUtils.randFloat(0.4, 1.1)
        )
    };
}

function getRandomObstaclePosition() {
    const candidate = new THREE.Vector2();

    for (let attempt = 0; attempt < 8; attempt += 1) {
        candidate.set(
            THREE.MathUtils.randFloat(-PLAY_BOUNDS.x + 1.4, PLAY_BOUNDS.x - 1.4),
            THREE.MathUtils.randFloat(-PLAY_BOUNDS.y + 1.4, PLAY_BOUNDS.y - 1.4)
        );

        if (candidate.distanceTo(gameState.lastObstaclePosition) > 4) {
            return candidate;
        }
    }

    return candidate;
}

function updateObstacles(scene, delta) {
    const speed = getObstacleSpeed(gameState.elapsed);

    for (let index = gameState.obstacles.length - 1; index >= 0; index -= 1) {
        const obstacle = gameState.obstacles[index];
        obstacle.mesh.position.z += speed * delta;
        obstacle.mesh.rotation.x += obstacle.spin.x * delta;
        obstacle.mesh.rotation.y += obstacle.spin.y * delta;
        obstacle.mesh.rotation.z += obstacle.spin.z * delta;

        if (obstacle.mesh.position.z > OBSTACLE_CLEAR_Z) {
            scene.remove(obstacle.mesh);
            disposeObject(obstacle.mesh);
            gameState.obstacles.splice(index, 1);
        }
    }

    if (
        gameState.obstacles.length === 0 ||
        (gameState.obstacles.length < MAX_ACTIVE_OBSTACLES && gameState.elapsed >= gameState.nextObstacleAt)
    ) {
        addObstacle(scene);
    }
}

function hasCollision(shipGroup, obstacles) {
    return obstacles.some((obstacle) => {
        const dx = shipGroup.position.x - obstacle.mesh.position.x;
        const dy = shipGroup.position.y - obstacle.mesh.position.y;
        const dz = shipGroup.position.z - obstacle.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return distance <= PLAYER_RADIUS + obstacle.radius;
    });
}

function updateBackground(starField, tunnel, delta) {
    const speed = getObstacleSpeed(gameState.elapsed) * 0.12;
    starField.position.z += speed * delta;
    tunnel.position.z += speed * delta;

    if (starField.position.z > 45) starField.position.z = 0;
    if (tunnel.position.z > 10) tunnel.position.z = 0;
}

function updateTimer(timerValue, elapsed) {
    if (elapsed < gameState.nextTimerPaint) return;
    timerValue.textContent = formatTime(elapsed);
    gameState.nextTimerPaint = elapsed + TIMER_UPDATE_INTERVAL;
}

function updateSpeed(speedValue, elapsed) {
    const multiplier = getObstacleSpeed(elapsed) / BASE_OBSTACLE_SPEED;
    speedValue.textContent = `${multiplier.toFixed(1)}x`;
}

function getObstacleSpeed(elapsed) {
    return BASE_OBSTACLE_SPEED + elapsed * SPEED_GAIN_PER_SECOND;
}

async function loadContactForm(container, score) {
    if (gameState.contactLoaded) return;
    gameState.contactLoaded = true;
    container.innerHTML = `
        <form action="https://formspree.io/f/xbldrayw" method="POST" class="score-contact-form">
            <div class="score-contact-grid">
                <label class="score-contact-field">
                    <span>Name</span>
                    <input type="text" name="name" placeholder="John Doe" required>
                </label>
                <label class="score-contact-field">
                    <span>Email</span>
                    <input type="email" name="email" placeholder="john@example.com" required>
                </label>
            </div>
            <label class="score-contact-field">
                <span>Message</span>
                <textarea name="message" rows="4" required>I scored ${score} in the rocket dodger game.</textarea>
            </label>
            <button type="submit" class="score-contact-submit">Send Score</button>
        </form>
    `;
}

function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function disposeObject(object) {
    object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}
