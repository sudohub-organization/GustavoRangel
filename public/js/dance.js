import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const danceBtn = document.getElementById('dance-btn');
const modal = document.getElementById('dance-modal');
const dialog = document.getElementById('dance-dialog');
const header = document.getElementById('dance-dialog-header');
const closeBtn = document.getElementById('close-dance-btn');
const container = document.getElementById('dance-avatar-container');

let isInitialized = false;
let mixer, clock, scene, camera, renderer;

// Variables for our character's bones
let mascot, headBone, spineBone, leftArm, rightArm;

// --- Draggable Logic (Mouse & Touch) ---
let isDragging = false;
let startX, startY, initialX, initialY;

function startDrag(clientX, clientY) {
    isDragging = true;
    const rect = dialog.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    startX = clientX;
    startY = clientY;
    // Switch from transform translation to absolute positioning
    dialog.style.transform = 'none';
    dialog.style.left = initialX + 'px';
    dialog.style.top = initialY + 'px';
}

function dragMove(clientX, clientY) {
    if (!isDragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    dialog.style.left = (initialX + dx) + 'px';
    dialog.style.top = (initialY + dy) + 'px';
}

header.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
document.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
document.addEventListener('mouseup', () => isDragging = false);

header.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
document.addEventListener('touchmove', (e) => dragMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
document.addEventListener('touchend', () => isDragging = false);

// --- Three.js Logic ---
function initThreeJS() {
    if (isInitialized) return;
    isInitialized = true;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Pulled the camera back slightly to fit the bigger model
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3.0); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('gus.glb', (gltf) => {
        mascot = gltf.scene;
        
        // Dropped Y slightly more so the bigger scale stays centered
        mascot.position.y = -1.5;
        // Make the model 50% bigger
        mascot.scale.set(1.5, 1.5, 1.5);
        scene.add(mascot);

        // Find bones for our custom code dance (supports Avaturn and Mixamo names)
        headBone = mascot.getObjectByName('Head') || mascot.getObjectByName('mixamorigHead');
        spineBone = mascot.getObjectByName('Spine') || mascot.getObjectByName('Spine1') || mascot.getObjectByName('mixamorigSpine');
        leftArm = mascot.getObjectByName('LeftArm') || mascot.getObjectByName('mixamorigLeftArm');
        rightArm = mascot.getObjectByName('RightArm') || mascot.getObjectByName('mixamorigRightArm');

        mixer = new THREE.AnimationMixer(mascot);
        // Play the default animation if one actually exists
        if (gltf.animations.length > 0) {
            mixer.clipAction(gltf.animations[0]).play();
        }
    });

    // Adjust canvas on resize
    window.addEventListener('resize', () => {
        if(modal.classList.contains('hidden')) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (mixer) mixer.update(delta);

        // --- Custom Disco Dance ---
        const beat = time * 4; // Faster, energetic tempo

        if (mascot) {
            // Bounce the entire body up and down to the beat
            mascot.position.y = -1.5 + Math.abs(Math.sin(beat)) * 0.15;
        }

        if (spineBone) {
            spineBone.rotation.z = Math.sin(beat * 0.5) * 0.15; // Sway hips left/right
            spineBone.rotation.y = Math.cos(beat * 0.5) * 0.3; // Twist torso
            spineBone.rotation.x = Math.sin(beat) * 0.1; // Groove forward/back
        }
        
        if (headBone) {
            headBone.rotation.y = Math.sin(beat) * 0.2; // Look around
            headBone.rotation.x = Math.abs(Math.sin(beat)) * 0.2; // Aggressive head nod on the beat
            headBone.rotation.z = Math.cos(beat * 0.5) * 0.1; // Slight head tilt
        }
        
        // Disco alternating arm pumps
        if (leftArm) {
            leftArm.rotation.z = -0.5 + Math.sin(beat * 0.5) * 1.2; 
            leftArm.rotation.x = Math.cos(beat * 0.5) * 0.5;
        }
        if (rightArm) {
            rightArm.rotation.z = 0.5 + Math.sin(beat * 0.5) * 1.2; 
            rightArm.rotation.x = -Math.cos(beat * 0.5) * 0.5;
        }

        // --- Color Changing Disco Background ---
        // Cycle hue from 0 to 360 smoothly over time
        const hue = Math.floor((time * 60) % 360);
        dialog.style.backgroundColor = `hsl(${hue}, 70%, 15%)`;
        dialog.style.boxShadow = `0 0 40px hsl(${hue}, 80%, 30%)`;
        dialog.style.borderColor = `hsl(${(hue + 180) % 360}, 70%, 50%)`; // Complementary color border

        renderer.render(scene, camera);
    }
    animate();
}

// --- Modal Toggles ---
danceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
    // Re-render Lucide icons in case they were added dynamically
    if(window.lucide) lucide.createIcons();
    initThreeJS();
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    // Reset dialog background when closed
    dialog.style.backgroundColor = '';
    dialog.style.boxShadow = '';
    dialog.style.borderColor = '';
});