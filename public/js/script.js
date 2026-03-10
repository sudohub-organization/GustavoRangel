document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons
    lucide.createIcons();

    function showCenteredPopup(message) {
        let popup = document.getElementById('centered-popup');
        if (popup) popup.remove();
        popup = document.createElement('div');
        popup.id = 'centered-popup';
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000);
    }

    document.querySelectorAll('.disabled').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            showCenteredPopup('Work in progress! Come back later.');
        });
    });

    // --- Section Overlapping Logic ---
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    let currentIndex = 0;
    let isAnimating = false;

    sections.forEach((sec, idx) => { sec.style.zIndex = idx + 1; });

    function goToSection(index) {
        if (isAnimating || index === currentIndex) return;
        isAnimating = true;

        sections.forEach((sec, idx) => {
            sec.classList.remove('active', 'previous', 'upcoming');
            if (idx < index) sec.classList.add('previous');
            else if (idx === index) sec.classList.add('active');
            else sec.classList.add('upcoming');
        });

        navItems.forEach(item => item.classList.remove('active'));
        if (navItems[index]) navItems[index].classList.add('active');

        currentIndex = index;
        setTimeout(() => { isAnimating = false; }, 800); 
    }

    // --- Advanced Wheel Scroll Detection ---
    window.addEventListener('wheel', (e) => {
        if (isAnimating) return;
        
        const activeSection = sections[currentIndex];

        // HORIZONTAL SCROLL INTERCEPTION
        if (activeSection.id === 'projects') {
            const projectsContainer = document.getElementById('projects-container');
            if (projectsContainer && projectsContainer.contains(e.target)) {
                
                const isAtLeft = projectsContainer.scrollLeft === 0;
                const isAtRight = Math.ceil(projectsContainer.scrollLeft) >= (projectsContainer.scrollWidth - projectsContainer.clientWidth - 1);
                
                if (e.deltaY > 0 && !isAtRight) {
                    projectsContainer.scrollBy({ left: e.deltaY * 2, behavior: 'auto' });
                    e.preventDefault(); 
                    return; 
                } else if (e.deltaY < 0 && !isAtLeft) {
                    projectsContainer.scrollBy({ left: e.deltaY * 2, behavior: 'auto' });
                    e.preventDefault();
                    return; 
                }
            }
        }
        
        // Normal Vertical Section Overlap Logic
        const atTop = activeSection.scrollTop === 0;
        const atBottom = Math.abs(activeSection.scrollHeight - activeSection.clientHeight - activeSection.scrollTop) < 1;
        
        if (e.deltaY > 0 && atBottom) {
            goToSection(Math.min(currentIndex + 1, sections.length - 1));
        } else if (e.deltaY < 0 && atTop) {
            goToSection(Math.max(currentIndex - 1, 0));
        }
    }, { passive: false }); 

    // Nav Clicks
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => goToSection(index));
    });

    // Mobile Swipe Detection
    let touchStartY = 0;
    let touchEndY = 0;
    window.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].screenY; }, {passive: true});
    window.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(e);
    }, {passive: true});

    function handleSwipe(e) {
        if (isAnimating) return;
        const activeSection = sections[currentIndex];
        
        if (activeSection.id === 'projects') {
            const projectsContainer = document.getElementById('projects-container');
            if (projectsContainer && projectsContainer.contains(e.target)) return;
        }

        const atTop = activeSection.scrollTop === 0;
        const atBottom = Math.abs(activeSection.scrollHeight - activeSection.clientHeight - activeSection.scrollTop) < 1;

        if (touchStartY - touchEndY > 50 && atBottom) {
            goToSection(Math.min(currentIndex + 1, sections.length - 1));
        } else if (touchEndY - touchStartY > 50 && atTop) {
            goToSection(Math.max(currentIndex - 1, 0));
        }
    }

    // Helper to get technology icons
    function getIconUrl(tool) {
        const map = {
            'python': 'python/python-original',
            'flask': 'flask/flask-original',
            'sickit-learn': 'scikitlearn/scikitlearn-original',
            'latex': 'latex/latex-original',
            'javascript': 'javascript/javascript-original',
            'three.js': 'threejs/threejs-original',
            'blender': 'blender/blender-original',
            'vue': 'vuejs/vuejs-original',
            'express': 'express/express-original',
            'node.js': 'nodejs/nodejs-original',
            'mongodb': 'mongodb/mongodb-original',
            'html': 'html5/html5-original',
            'css': 'css3/css3-original',
            'pandas': 'pandas/pandas-original',
            'matplotlib': 'python/python-original', 
            'java': 'java/java-original',
            'android studio': 'androidstudio/androidstudio-original',
            'kotlin': 'kotlin/kotlin-original',
            'nlp': 'python/python-original', 
            'php': 'php/php-original',
            'mysql': 'mysql/mysql-original'
        };
        const key = tool.toLowerCase().trim();
        const iconPath = map[key] || 'html5/html5-original'; 
        return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconPath}.svg`;
    }

    // --- Fetch and Load Projects ---
    async function loadProjects() {
        try {
            const response = await fetch('public/data/projects.json');
            if (!response.ok) throw new Error('Failed to load projects');
            const projectsData = await response.json();
            
            const projectsContainer = document.getElementById('projects-container');
            projectsContainer.innerHTML = '';
            
            projectsData.forEach((project) => {
                const card = document.createElement('div');
                card.className = `project-card group`;
                card.style.background = `linear-gradient(145deg, ${project.color}33 0%, var(--color-section-bg) 100%)`;
                card.style.border = `1px solid ${project.color}50`;
                
                const iconThumbnails = project.tools.map(t => 
                    `<img src="${getIconUrl(t)}" alt="${t}" title="${t}" class="w-8 h-8 object-contain drop-shadow-md bg-white/10 rounded-md p-1 backdrop-blur-sm">`
                ).join('');

                const collapsedIcons = project.tools.slice(0, 3).map(t => 
                    `<img src="${getIconUrl(t)}" alt="${t}" class="w-7 h-7 object-contain opacity-80 drop-shadow-md">`
                ).join('');

                let linksHtml = '<div class="flex flex-wrap gap-3 mt-auto">';
                if (project.url) {
                    linksHtml += `<a href="${project.url}" target="_blank" class="inline-flex items-center justify-center bg-white text-black font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors text-sm">View Live</a>`;
                }
                if (project.repository) {
                    linksHtml += `<a href="${project.repository}" target="_blank" class="inline-flex items-center justify-center bg-gray-800 text-white border border-gray-600 font-semibold py-2 px-5 rounded-lg hover:bg-gray-700 transition-colors text-sm">View Repo</a>`;
                }
                if (!project.url && !project.repository) {
                    linksHtml += `<a href="#" class="disabled inline-flex items-center justify-center bg-gray-600 text-gray-300 font-semibold py-2 px-5 rounded-lg cursor-not-allowed text-sm">Coming Soon</a>`;
                }
                linksHtml += '</div>';

                card.innerHTML = `
                    <div class="project-title-vertical flex flex-col items-center justify-center p-4">
                        <div class="flex flex-col gap-4 mb-6">${collapsedIcons}</div>
                        <span class="font-bold tracking-widest uppercase text-xl whitespace-nowrap" style="writing-mode: vertical-rl; transform: rotate(180deg); color: ${project.color}">${project.title}</span>
                    </div>
                    <div class="project-overlay">
                        <div class="flex flex-wrap gap-2 mb-3">${iconThumbnails}</div>
                        <h3 class="text-2xl md:text-3xl font-bold mb-3 leading-tight" style="color: ${project.color}">${project.title}</h3>
                        <p class="text-gray-300 text-sm md:text-base mb-6 line-clamp-3">${project.description}</p>
                        ${linksHtml}
                    </div>
                `;
                
                projectsContainer.appendChild(card);
            });
            
            // Floating hover popup — appended to body so it escapes overflow clipping
            document.getElementById('project-hover-popup')?.remove();
            const popup = document.createElement('div');
            popup.id = 'project-hover-popup';
            popup.className = 'project-hover-popup';
            document.body.appendChild(popup);

            projectsContainer.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    const overlayEl = card.querySelector('.project-overlay');
                    if (overlayEl) popup.innerHTML = overlayEl.innerHTML;
                    popup.style.borderColor = card.style.borderColor || 'rgba(255,255,255,0.12)';
                    const rect = card.getBoundingClientRect();
                    const pw = 300;
                    let left = rect.left + rect.width / 2 - pw / 2;
                    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
                    popup.style.left = left + 'px';
                    popup.style.top = rect.top + 'px';
                    popup.classList.add('visible');
                });
                card.addEventListener('mouseleave', () => popup.classList.remove('visible'));
            });

            // Re-bind click listener for disabled links generated dynamically
            projectsContainer.addEventListener('click', (e) => {
                if(e.target.classList.contains('disabled')) {
                    e.preventDefault();
                    showCenteredPopup('Work in progress! Come back later.');
                }
            });
            
        } catch (error) {
            console.error(error);
            document.getElementById('projects-container').innerHTML = '<p class="text-red-400 p-4">Failed to load projects. (Make sure you are running a local server to fetch JSON)</p>';
        }
    }

    // --- Fetch and Load Experience Timeline ---
    async function loadExperience() {
        try {
            const response = await fetch('public/data/timeline.json');
            if (!response.ok) throw new Error('Failed to load timeline');
            const experienceData = await response.json();
            
            const expContainer = document.getElementById('experience-container');
            expContainer.innerHTML = '';
            
            experienceData.forEach((job) => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'mb-8 ml-8 md:ml-12 relative timeline-card cursor-pointer';
                
                timelineItem.innerHTML = `
                    <span class="absolute -left-[41px] md:-left-[57px] top-1.5 h-4 w-4 rounded-full border-2 border-gray-900 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                    <div class="bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 rounded-xl p-5 md:p-6 transition-colors shadow-lg">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                            <h3 class="text-xl md:text-2xl font-bold text-white">${job.title}</h3>
                            <span class="text-blue-400 text-sm font-semibold tracking-wide bg-blue-500/10 px-3 py-1 rounded-full w-max">${job.date}</span>
                        </div>
                        <p class="text-gray-400 font-medium mb-1">${job.company}</p>
                        
                        <div class="timeline-body">
                            <div>
                                <p class="text-gray-300 text-sm md:text-base leading-relaxed border-t border-gray-800 pt-4">${job.description}</p>
                            </div>
                        </div>
                    </div>
                `;

                timelineItem.addEventListener('click', () => {
                    if (window.innerWidth < 768) {
                        const isExpanded = timelineItem.classList.contains('expanded');
                        document.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('expanded'));
                        if (!isExpanded) timelineItem.classList.add('expanded');
                    }
                });

                expContainer.appendChild(timelineItem);
            });
        } catch (error) {
            console.error(error);
            document.getElementById('experience-container').innerHTML = '<p class="text-red-400 p-4">Failed to load timeline.</p>';
        }
    }

    // Execute fetches
    loadProjects();
    loadExperience();

    // --- Interactive Image on Home ---
    const imageContainer = document.querySelector('.image-container');
    if (imageContainer) {
        imageContainer.addEventListener('mouseenter', () => { imageContainer.classList.add('square-corners'); });
        imageContainer.addEventListener('mouseleave', () => { imageContainer.classList.remove('square-corners'); });
    }

    // --- Logo Modal ---
    const logoBtn = document.getElementById('logo-thumb');
    const logoModal = document.getElementById('logo-modal');
    if (logoBtn && logoModal) {
        logoBtn.addEventListener('click', () => {
            logoModal.classList.remove('hidden'); logoModal.classList.add('flex');
        });
        logoModal.addEventListener('click', (e) => {
            if (e.target === logoModal) {
                logoModal.classList.add('hidden'); logoModal.classList.remove('flex');
            }
        });
    }

    // --- Konami Code Easter Egg ---
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let kIndex = 0;
    let konamiActive = false;
    let dotInterval = null;
    let dotScore = 0;
    const funkyCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cline x1='20' y1='2' x2='20' y2='38' stroke='%23ff00ff' stroke-width='2.5'/%3E%3Cline x1='2' y1='20' x2='38' y2='20' stroke='%23ff00ff' stroke-width='2.5'/%3E%3Ccircle cx='20' cy='20' r='6' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23ff00ff'/%3E%3C/svg%3E") 20 20, crosshair`;
    const dotColors = ['#ff00ff','#00ffff','#ff6600','#ffff00','#00ff88','#ff3388','#8800ff','#00aaff'];

    // HUD overlay element (score + exit hint)
    let konamiHUD = null;
    // Blocking overlay to intercept all page clicks
    let konamiOverlay = null;

    function createKonamiUI() {
        // Full-screen transparent overlay — blocks all underlying interactions
        konamiOverlay = document.createElement('div');
        konamiOverlay.id = 'konami-overlay';
        konamiOverlay.style.cssText = `
            position: fixed; inset: 0;
            z-index: 9990;
            background: transparent;
            cursor: inherit;
        `;
        document.body.appendChild(konamiOverlay);

        // HUD pinned to top-left
        konamiHUD = document.createElement('div');
        konamiHUD.id = 'konami-hud';
        konamiHUD.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.85);
            top: 1rem; left: 1rem;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            pointer-events: none;
            font-family: monospace;
        `;
        konamiHUD.innerHTML = `
            <div id="konami-score" style="
                font-size: 1.4rem;
                font-weight: 700;
                color: #ff00ff;
                text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
                letter-spacing: 0.05em;
            ">💥 Score: 0</div>
            <div style="
                font-size: 0.65rem;
                color: rgba(255,255,255,0.45);
                letter-spacing: 0.08em;
                text-transform: uppercase;
            ">↑↑↓↓←→←→BA to exit</div>
        `;
        document.body.appendChild(konamiHUD);
    }

    function destroyKonamiUI() {
        konamiOverlay?.remove(); konamiOverlay = null;
        konamiHUD?.remove();    konamiHUD = null;
        // Remove any lingering dots
        document.querySelectorAll('.konami-dot').forEach(d => d.remove());
        dotScore = 0;
    }

    function updateScore() {
        const scoreEl = document.getElementById('konami-score');
        if (scoreEl) scoreEl.textContent = `💥 Score: ${dotScore}`;
    }

    function spawnDot() {
        const dot = document.createElement('div');
        dot.className = 'konami-dot';
        const size = 14 + Math.random() * 22;
        const color = dotColors[Math.floor(Math.random() * dotColors.length)];
        // Keep dots away from top-left HUD area
        const safeLeft = 160 + Math.random() * (window.innerWidth - size - 160);
        const safeTop  = 20  + Math.random() * (window.innerHeight - size - 20);
        dot.style.cssText = `
            position: fixed;
            z-index: 9995;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size * 1.5}px ${color}, 0 0 ${size * 0.5}px #fff inset;
            left: ${safeLeft}px;
            top: ${safeTop}px;
            opacity: 1;
            cursor: none;
            transition: transform 0.1s ease, opacity 0.8s ease;
            transform: scale(1);
        `;
        document.body.appendChild(dot);

        // Click-to-destroy
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            dotScore++;
            updateScore();
            // Burst animation then remove
            dot.style.transform = 'scale(2)';
            dot.style.opacity = '0';
            setTimeout(() => dot.remove(), 300);
        });

        // Natural fade-out after 5 seconds if not clicked
        const autoFadeTimer  = setTimeout(() => { dot.style.opacity = '0'; }, 4200);
        const autoRemoveTimer = setTimeout(() => { dot.remove(); }, 5000);

        // If clicked early, clear the auto timers
        dot.addEventListener('click', () => {
            clearTimeout(autoFadeTimer);
            clearTimeout(autoRemoveTimer);
        }, { once: true });
    }

    function scheduleNextDot() {
        if (!konamiActive) return;
        const delay = 2000 + Math.random() * 2000;
        dotInterval = setTimeout(() => {
            spawnDot();
            scheduleNextDot();
        }, delay);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[kIndex]) {
            kIndex++;
            if (kIndex === konamiCode.length) {
                konamiActive = !konamiActive;
                if (konamiActive) {
                    showCenteredPopup('🎮 Funky mode ON! Pop the dots!');
                    document.body.style.cursor = funkyCursor;
                    createKonamiUI();
                    scheduleNextDot();
                } else {
                    showCenteredPopup(`🎮 Funky mode OFF! Final score: ${dotScore}`);
                    document.body.style.cursor = '';
                    clearTimeout(dotInterval);
                    destroyKonamiUI();
                }
                kIndex = 0;
            }
        } else {
            kIndex = 0;
        }
    });
});