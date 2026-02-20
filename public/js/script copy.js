document.addEventListener('DOMContentLoaded', () => {
    // --- Konami Code Cursor Easter Egg ---
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    let konamiIndex = 0;
    document.addEventListener('keydown', function(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                document.body.style.cursor = 'url("images/cursor.cur"), auto';
                // Set #page-header background to rain2.gif
                const pageHeader = document.getElementById('page-header');
                if (pageHeader) {
                    pageHeader.style.backgroundImage = 'url("images/rain2.gif")';
                    pageHeader.style.backgroundRepeat = 'repeat';
                }
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    // --- Unified Centered Popup Utility ---
    function showCenteredPopup(message) {
        let popup = document.getElementById('centered-popup');
        if (popup) popup.remove();
        popup = document.createElement('div');
        popup.id = 'centered-popup';
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(30,30,30,0.97)';
        popup.style.color = '#fff';
        popup.style.padding = '0.75rem 1.5rem';
        popup.style.borderRadius = '0.75rem';
        popup.style.fontSize = '1.1rem';
        popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
        popup.style.zIndex = '9999';
        popup.style.textAlign = 'center';
        document.body.appendChild(popup);
        setTimeout(() => { popup.remove(); }, 2000);
    }

    // Event delegation for all .disabled elements
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('.disabled');
        if (target) {
            e.preventDefault();
            showCenteredPopup('work in progress :) come back later');
        }
    });
    lucide.createIcons();

    // --- Main Page Scrolling Logic (Unchanged) ---
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const numSections = sections.length;
    let currentIndex = 0;
    let isAnimating = false;
    const animationDuration = 800;

    const updateNav = (newIndex) => {
        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`.nav-item[data-index="${newIndex}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
    };

    const goToSection = (newIndex) => {
        if (isAnimating || newIndex === currentIndex) return;
        isAnimating = true;
        const currentSection = sections[currentIndex];
        const newSection = sections[newIndex];
        let direction = newIndex > currentIndex ? 'down' : 'up';
        if (currentIndex === numSections - 1 && newIndex === 0) direction = 'down';
        if (currentIndex === 0 && newIndex === numSections - 1) direction = 'up';
        sections.forEach((sec, idx) => { if (idx !== currentIndex && idx !== newIndex) { sec.classList.remove('active', 'static-behind', 'prepare-above'); } });
        if (direction === 'down') {
            currentSection.classList.remove('active');
            currentSection.classList.add('static-behind');
            newSection.classList.add('active');
        } else {
            newSection.classList.add('prepare-above');
            newSection.offsetHeight; 
            currentSection.classList.remove('active');
            currentSection.classList.add('static-behind');
            newSection.classList.remove('prepare-above');
            newSection.classList.add('active');
        }
        currentIndex = newIndex;
        updateNav(currentIndex);
        setTimeout(() => {
            isAnimating = false;
            currentSection.classList.remove('static-behind');
        }, animationDuration);
    };

    window.addEventListener('wheel', (event) => {
        if (isAnimating) return;
        const newIndex = event.deltaY > 0 ? (currentIndex + 1) % numSections : (currentIndex - 1 + numSections) % numSections;
        goToSection(newIndex);
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const newIndex = parseInt(item.getAttribute('data-index'));
            goToSection(newIndex);
        });
    });

    const init = () => {
        sections[0].classList.add('active');
        updateNav(0);
    };
    init();

    // --- Home Section Image Hover Logic ---
    const homeImage = document.getElementById('dynamic-home-image');
    const socialLinks = document.querySelectorAll('.social-icons-container .social-link');
    const imageContainer = document.querySelector('.image-container');
    const defaultHomeImage = 'images/me.jpeg';

    if (homeImage && socialLinks.length && imageContainer) {
        socialLinks.forEach(link => {
            // Blog link: gray out and show custom popup
            if (link.classList.contains('blog-disabled')) {
                link.classList.add('show-popup');
            }
            link.addEventListener('mouseover', () => {
                imageContainer.classList.add('square-corners');
                const newImgSrc = link.getAttribute('data-img-src');
                if (newImgSrc) {
                    homeImage.src = newImgSrc;
                }
            });
            link.addEventListener('mouseout', () => {
                imageContainer.classList.remove('square-corners');
                homeImage.src = defaultHomeImage;
            });
        });
    }


    // --- Project Accordion Logic ---
    const projectsContainer = document.querySelector('.projects-accordion');

    const updateTechIcons = () => {
        const allCards = document.querySelectorAll('.project-accordion-card');
        allCards.forEach(card => {
            const techIconsContainer = card.querySelector('.tech-icons');
            if (!techIconsContainer) return;
            
            const allIcons = techIconsContainer.querySelectorAll('span:not(.plus-indicator)');
            const plusIndicator = techIconsContainer.querySelector('.plus-indicator');
            
            if (plusIndicator) plusIndicator.remove();

            allIcons.forEach(icon => icon.style.display = 'flex');

            if (!card.classList.contains('active')) {
                if (allIcons.length > 2) {
                    for (let i = 2; i < allIcons.length; i++) {
                        allIcons[i].style.display = 'none';
                    }
                    const remainingCount = allIcons.length - 2;
                    const newIndicator = document.createElement('span');
                    newIndicator.className = 'plus-indicator';
                    newIndicator.textContent = `+${remainingCount}`;
                    techIconsContainer.appendChild(newIndicator);
                }
            }
        });
    };

    const loadProjects = async () => {
        try {
            const response = await fetch('../data/projects.json');
            //TODO UNCOMMENT FOR LOCAL TESTING
            //!const response = await fetch('projects.json');
            const projects = await response.json();


            projectsContainer.innerHTML = ''; // Clear existing
            
            projects.forEach((project, index) => {
                const card = document.createElement('div');
                card.className = 'project-accordion-card';
                if (index === 0) card.classList.add('active');
                card.style.backgroundImage = `url('${project.image}')`;

                const toolTags = project.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('');
                const emojiSpans = project.emojis.map(emoji => `<span>${emoji}</span>`).join('');

                card.innerHTML = `
                    <div class="card-content">
                        <div class="text-content-area">
                            <div class="collapsed-content">
                                <h3>${project.title}</h3>
                            </div>
                            <div class="expanded-content">
                                <div class="main-text">
                                    <h3>${project.title}</h3>
                                    <div class="tool-list">${toolTags}</div>
                                    <p>${project.description}</p>
                                </div>
                                <a href="${project.url}" class="visit-btn">Visit Project</a>
                            </div>
                        </div>
                        <div class="tech-icons">
                            ${emojiSpans}
                        </div>
                    </div>
                `;
                projectsContainer.appendChild(card);
                // Fade in the dim overlay after 1s
                setTimeout(() => {
                    card.classList.add('dimmed');
                }, 1000);
            });

            setupAccordionBehavior();
            updateTechIcons();

        } catch (error) {
            console.error('Error loading projects:', error);
            projectsContainer.innerHTML = '<p class="text-white">Could not load projects.</p>';
        }
    };

    const setupAccordionBehavior = () => {
        const accordionCards = document.querySelectorAll('.project-accordion-card');
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        if (isMobile) {
            // Mobile: Use Intersection Observer to activate card when it's centered in the viewport.
            const observerOptions = {
                root: document.querySelector('.accordion-scroll-container'),
                rootMargin: '0px',
                threshold: 0.5 // Activate when 50% of the card is visible
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        accordionCards.forEach(c => c.classList.remove('active'));
                        entry.target.classList.add('active');
                        updateTechIcons();
                    }
                });
            }, observerOptions);

            accordionCards.forEach(card => observer.observe(card));

        } else {
            // Desktop: Click to expand functionality.
            accordionCards.forEach(card => {
                card.addEventListener('click', () => {
                    if (card.classList.contains('active')) return;
                    accordionCards.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    updateTechIcons();
                });
            });
        }
    };
    
    loadProjects();

    // --- Logo Modal Logic (moved from index.html) ---
    const logoThumb = document.getElementById('logo-thumb');
    const logoModal = document.getElementById('logo-modal');

    if (logoThumb && logoModal) {
        logoThumb.addEventListener('click', () => {
            logoModal.style.display = 'flex';
        });

        logoModal.addEventListener('click', (e) => {
            // Close modal if the background is clicked, but not the image itself
            if (e.target === logoModal) {
                logoModal.style.display = 'none';
            }
        });
    }
});
