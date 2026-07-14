import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { startDiscoMusic, stopDiscoMusic } from './audio.js';

const MAX_PIXEL_RATIO = 2;
const VIEWPORT_MARGIN = 16;
const DEFAULT_MODEL_Y = -1.5;
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"]';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

let isDanceBound = false;

export function initDance({ openImmediately = false } = {}) {
if (isDanceBound) return;
isDanceBound = true;

const danceBtn = document.getElementById('dance-btn');
const modal = document.getElementById('dance-modal');
const dialog = document.getElementById('dance-dialog');
const header = document.getElementById('dance-dialog-header');
const closeBtn = document.getElementById('close-dance-btn');
const container = document.getElementById('dance-avatar-container');

if (!danceBtn || !modal || !dialog || !header || !closeBtn || !container) {
    console.warn('Dance modal elements are missing from the page.');
    return;
}

let isInitialized = false;
let isModalOpen = false;
let animationFrameId = 0;
let resizeFrameId = 0;
let lastFocusedElement = null;
let resizeObserver = null;
let mixer;
let clock;
let scene;
let camera;
let renderer;

let mascot;
let headBone;
let spineBone;
let leftArm;
let rightArm;

const dragState = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0
};

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getViewportSize() {
    const viewport = window.visualViewport;
    return {
        width: viewport?.width ?? window.innerWidth,
        height: viewport?.height ?? window.innerHeight
    };
}

function getDialogBounds() {
    return {
        width: dialog.offsetWidth,
        height: dialog.offsetHeight
    };
}

function clampDialogPosition(left, top) {
    const { width: viewportWidth, height: viewportHeight } = getViewportSize();
    const { width: dialogWidth, height: dialogHeight } = getDialogBounds();
    const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - dialogWidth - VIEWPORT_MARGIN);
    const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - dialogHeight - VIEWPORT_MARGIN);

    return {
        left: clamp(left, VIEWPORT_MARGIN, maxLeft),
        top: clamp(top, VIEWPORT_MARGIN, maxTop)
    };
}

function applyDialogPosition(left, top) {
    const nextPosition = clampDialogPosition(left, top);
    dialog.style.transform = 'none';
    dialog.style.left = `${nextPosition.left}px`;
    dialog.style.top = `${nextPosition.top}px`;
}

function centerDialog() {
    dialog.style.transform = 'translateX(-50%)';
    dialog.style.left = '50%';
    dialog.style.top = '20vh';
}

function scheduleResize() {
    if (!isInitialized || !isModalOpen || resizeFrameId) return;

    resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = 0;
        resizeRenderer();

        if (dialog.style.transform === 'none') {
            const currentLeft = Number.parseFloat(dialog.style.left) || dialog.getBoundingClientRect().left;
            const currentTop = Number.parseFloat(dialog.style.top) || dialog.getBoundingClientRect().top;
            applyDialogPosition(currentLeft, currentTop);
        }
    });
}

function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!renderer || !camera || width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.setSize(width, height, false);
}

function renderFrame() {
    if (!renderer || !camera) return;

    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    if (mixer) {
        mixer.update(delta);
    }

    const beat = time * 4;

    if (mascot) {
        mascot.position.y = DEFAULT_MODEL_Y + Math.abs(Math.sin(beat)) * 0.15;
    }

    if (spineBone) {
        spineBone.rotation.z = Math.sin(beat * 0.5) * 0.15;
        spineBone.rotation.y = Math.cos(beat * 0.5) * 0.3;
        spineBone.rotation.x = Math.sin(beat) * 0.1;
    }

    if (headBone) {
        headBone.rotation.y = Math.sin(beat) * 0.2;
        headBone.rotation.x = Math.abs(Math.sin(beat)) * 0.2;
        headBone.rotation.z = Math.cos(beat * 0.5) * 0.1;
    }

    if (leftArm) {
        leftArm.rotation.z = -0.5 + Math.sin(beat * 0.5) * 1.2;
        leftArm.rotation.x = Math.cos(beat * 0.5) * 0.5;
    }

    if (rightArm) {
        rightArm.rotation.z = 0.5 + Math.sin(beat * 0.5) * 1.2;
        rightArm.rotation.x = -Math.cos(beat * 0.5) * 0.5;
    }

    renderer.render(scene, camera);
}

function animate() {
    if (!isModalOpen) return;

    renderFrame();
    animationFrameId = window.requestAnimationFrame(animate);
}

function startAnimationLoop() {
    if (animationFrameId) return;

    clock.start();
    clock.getDelta();
    animate();
}

function stopAnimationLoop() {
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    if (clock) {
        clock.stop();
    }
}

function handleModelLoad(gltf) {
    mascot = gltf.scene;
    mascot.position.y = DEFAULT_MODEL_Y;
    mascot.scale.set(1.5, 1.5, 1.5);
    scene.add(mascot);

    headBone = mascot.getObjectByName('Head') || mascot.getObjectByName('mixamorigHead');
    spineBone = mascot.getObjectByName('Spine') || mascot.getObjectByName('Spine1') || mascot.getObjectByName('mixamorigSpine');
    leftArm = mascot.getObjectByName('LeftArm') || mascot.getObjectByName('mixamorigLeftArm');
    rightArm = mascot.getObjectByName('RightArm') || mascot.getObjectByName('mixamorigRightArm');

    mixer = new THREE.AnimationMixer(mascot);
    if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
    }
}

function initThreeJS() {
    if (isInitialized) return;

    isInitialized = true;
    scene = new THREE.Scene();
    clock = new THREE.Clock(false);
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 3);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    new GLTFLoader().load('gus.glb', handleModelLoad);

    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
            scheduleResize();
        });
        resizeObserver.observe(container);
    }

    window.addEventListener('resize', scheduleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });

    resizeRenderer();
    renderFrame();
}

function releaseDrag() {
    dragState.active = false;
    dragState.pointerId = null;
    header.removeAttribute('aria-grabbed');
}

function startDrag(event) {
    if (!isModalOpen || (event.button !== undefined && event.button !== 0)) return;
    if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) return;

    const rect = dialog.getBoundingClientRect();
    dragState.active = true;
    dragState.pointerId = event.pointerId ?? null;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.originLeft = rect.left;
    dragState.originTop = rect.top;

    header.setAttribute('aria-grabbed', 'true');
    header.setPointerCapture?.(event.pointerId);
    dialog.style.transform = 'none';
    dialog.style.left = `${rect.left}px`;
    dialog.style.top = `${rect.top}px`;
    event.preventDefault();
}

function moveDrag(event) {
    if (!dragState.active) return;
    if (dragState.pointerId !== null && event.pointerId !== dragState.pointerId) return;

    const nextLeft = dragState.originLeft + (event.clientX - dragState.startX);
    const nextTop = dragState.originTop + (event.clientY - dragState.startY);
    applyDialogPosition(nextLeft, nextTop);
}

function endDrag(event) {
    if (!dragState.active) return;
    if (dragState.pointerId !== null && event.pointerId !== undefined && event.pointerId !== dragState.pointerId) return;

    if (dragState.pointerId !== null && header.hasPointerCapture?.(dragState.pointerId)) {
        header.releasePointerCapture(dragState.pointerId);
    }
    releaseDrag();
}

function openModal() {
    if (isModalOpen) return;

    isModalOpen = true;
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-overlay');
    centerDialog();
    initThreeJS();
    scheduleResize();
    startAnimationLoop();
    startDiscoMusic();

    closeBtn.focus({ preventScroll: true });
}

function closeModal() {
    if (!isModalOpen) return;

    isModalOpen = false;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-overlay');
    releaseDrag();
    stopAnimationLoop();
    stopDiscoMusic();

    if (resizeFrameId) {
        window.cancelAnimationFrame(resizeFrameId);
        resizeFrameId = 0;
    }

    if (lastFocusedElement) {
        lastFocusedElement.focus({ preventScroll: true });
        lastFocusedElement = null;
    }
}

function handleModalClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

function handleKeydown(event) {
    if (!isModalOpen) return;

    if (event.key === 'Escape') {
        closeModal();
        return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
    if (!focusableElements.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function handleVisibilityChange() {
    if (!isModalOpen) return;

    if (document.hidden) {
        stopAnimationLoop();
        return;
    }

    startAnimationLoop();
}

header.addEventListener('pointerdown', startDrag);
window.addEventListener('pointermove', moveDrag, { passive: true });
window.addEventListener('pointerup', endDrag, { passive: true });
window.addEventListener('pointercancel', endDrag, { passive: true });

danceBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
});

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', handleModalClick);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('visibilitychange', handleVisibilityChange);

if (openImmediately) {
    openModal();
}
}
