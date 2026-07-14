export function initNavigation() {
    const links = Array.from(document.querySelectorAll('[data-section-link]'));
    const sections = links
        .map((link) => document.getElementById(link.dataset.sectionLink))
        .filter(Boolean);

    if (!links.length || !sections.length) return;

    const setActiveLink = (id) => {
        links.forEach((link) => {
            const isActive = link.dataset.sectionLink === id;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const initialTarget = window.location.hash ? window.location.hash.slice(1) : sections[0].id;
    setActiveLink(initialTarget);

    const observer = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
            setActiveLink(visibleEntry.target.id);
        }
    }, {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.65]
    });

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            setActiveLink(window.location.hash.slice(1));
        }
    });
}
